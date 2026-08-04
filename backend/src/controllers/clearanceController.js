const Clearance   = require('../models/Clearance');
const Department  = require('../models/Department');
const User         = require('../models/User');
const Notification = require('../models/Notification');
const createAuditLog = require('../utils/auditLog');
const { sendEmail, queueEmail, emailTemplates } = require('../utils/sendEmails');

/* ── Student: Submit a new clearance request ── */
exports.submitClearance = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    /* Prevent duplicate active requests */
    const existing = await Clearance.findOne({
      student: studentId,
      status: { $in: ['submitted', 'in_progress'] },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active clearance request.',
      });
    }

    const { graduationYear, programme, sessionCompleted, remarks, selectedUnits } = req.body;

    /* Build department steps — only from selected units, or all if none specified */
    const allDepartments = await Department.find({ isActive: true }).sort({ order: 1 });
    const unitsToUse = selectedUnits?.length
      ? allDepartments.filter(d => selectedUnits.includes(d._id.toString()))
      : allDepartments;

    if (unitsToUse.length === 0) {
      return res.status(400).json({ success: false, message: 'No clearance units selected.' });
    }

    const departmentSteps = unitsToUse.map(dept => ({
      department:     dept._id,
      departmentName: dept.name,
      status:         'pending',
    }));

    const clearance = await Clearance.create({
      student: studentId,
      status: 'submitted',
      graduationYear,
      programme,
      sessionCompleted,
      remarks,
      departments: departmentSteps,
      submittedAt: new Date(),
    });

    /* Notify all officers in the selected departments */
    for (const dept of unitsToUse) {
  if (dept.officers?.length) {
    const notifs = dept.officers.map(officerId => ({
      recipient: officerId,
      type:      'info',
      title:     'New Clearance Request',
      message:   `${req.user.fullName} (${req.user.matricNumber}) submitted a clearance request for your review.`,
      link:      `/officer/requests/${clearance._id}`,
    }));
    await Notification.insertMany(notifs);

    const officerUsers = await User.find({ _id: { $in: dept.officers } }).select('email');
    officerUsers.forEach(officer => {
      const template = emailTemplates.clearanceSubmittedOfficerAlert(
        req.user.fullName, req.user.matricNumber, dept.name
      );
      queueEmail({ to: officer.email, ...template });
    });
  }
}

    await createAuditLog({
      user: req.user,
      action: 'CLEARANCE_SUBMITTED',
      detail: `Submitted clearance request ${clearance.requestId}`,
      req,
    });

    res.status(201).json({ success: true, clearance });
  } catch (error) {
    next(error);
  }
};

/* ── Student: Get my clearance + history ── */
exports.getMyClearance = async (req, res, next) => {
  try {
    const clearances = await Clearance.find({ student: req.user._id })
      .sort({ createdAt: -1 })
      .populate('departments.officer', 'firstName lastName')
      .populate('registrar', 'firstName lastName');

    const current = clearances.find(c => ['submitted', 'in_progress'].includes(c.status)) || null;
    const history  = clearances.filter(c => c._id.toString() !== current?._id?.toString());

    res.json({ success: true, clearance: current, history });
  } catch (error) {
    next(error);
  }
};

/* ── Officer: Get requests assigned to my department ── */
exports.getDepartmentRequests = async (req, res, next) => {
  try {
    const officerDept = await Department.findOne({ officers: req.user._id });
    if (!officerDept) {
      return res.status(404).json({ success: false, message: 'You are not assigned to any department.' });
    }

    const { status } = req.query;

    const filter = { 'departments.department': officerDept._id };

    const clearances = await Clearance.find(filter)
      .populate('student', 'firstName lastName email matricNumber department programme')
      .sort({ createdAt: -1 });

    /* Shape response to show only this department's step, with overall status filter applied */
    let requests = clearances.map(c => {
      const step = c.departments.find(d => d.department.toString() === officerDept._id.toString());
      return {
        clearanceId: c._id,
        requestId:   c.requestId,
        student:     c.student,
        submittedAt: c.submittedAt,
        remarks:     c.remarks,
        stepStatus:  step?.status,
        stepComment: step?.comment,
        reviewedAt:  step?.reviewedAt,
        totalDocs:   0, // populated below if needed
      };
    });

    if (status && status !== 'all') {
      requests = requests.filter(r => r.stepStatus === status);
    }

    res.json({ success: true, requests, department: officerDept.name });
  } catch (error) {
    next(error);
  }
};

/* ── Officer: Get single request detail ── */
exports.getRequestDetail = async (req, res, next) => {
  try {
    const clearance = await Clearance.findById(req.params.id)
      .populate('student', 'firstName lastName email matricNumber department programme')
      .populate('departments.officer', 'firstName lastName');

    if (!clearance) {
      return res.status(404).json({ success: false, message: 'Clearance request not found.' });
    }

    const Document = require('../models/Document');
    const documents = await Document.find({ student: clearance.student._id });

    res.json({ success: true, clearance, documents });
  } catch (error) {
    next(error);
  }
};

/* ── Officer: Approve a department step ── */
exports.approveStep = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const clearance = await Clearance.findById(req.params.id).populate('student');

    if (!clearance) {
      return res.status(404).json({ success: false, message: 'Clearance request not found.' });
    }

    const officerDept = await Department.findOne({ officers: req.user._id });
    const step = clearance.departments.find(
      d => d.department.toString() === officerDept?._id?.toString()
    );

    if (!step) {
      return res.status(403).json({ success: false, message: 'You are not authorised to review this request.' });
    }

    step.status     = 'approved';
    step.officer    = req.user._id;
    step.comment    = comment || '';
    step.reviewedAt = new Date();

    /* Check if all departments are now approved → move to in_progress or ready state */
    const allApproved = clearance.departments.every(d => d.status === 'approved');
    clearance.status = allApproved ? 'in_progress' : 'in_progress';

    await clearance.save();

    /* Notify student */
    await Notification.create({
      recipient: clearance.student._id,
      type:      'success',
      title:     `${officerDept.name} Clearance Approved`,
      message:   `Your ${officerDept.name} clearance has been approved by ${req.user.fullName}.`,
      link:      '/student/status',
    });

    const template = emailTemplates.clearanceApproved(clearance.student.firstName, officerDept.name, req.user.fullName);
    queueEmail({ to: clearance.student.email, ...template });

    await createAuditLog({
      user: req.user,
      action: 'CLEARANCE_APPROVED',
      detail: `Approved ${officerDept.name} clearance for ${clearance.student.fullName} (${clearance.requestId})`,
      req,
    });

    res.json({ success: true, message: 'Clearance step approved.', clearance });
  } catch (error) {
    next(error);
  }
};

/* ── Officer: Reject a department step ── */
exports.rejectStep = async (req, res, next) => {
  try {
    const { comment } = req.body;
    if (!comment?.trim()) {
      return res.status(400).json({ success: false, message: 'A reason for rejection is required.' });
    }

    const clearance = await Clearance.findById(req.params.id).populate('student');
    if (!clearance) {
      return res.status(404).json({ success: false, message: 'Clearance request not found.' });
    }

    const officerDept = await Department.findOne({ officers: req.user._id });
    const step = clearance.departments.find(
      d => d.department.toString() === officerDept?._id?.toString()
    );

    if (!step) {
      return res.status(403).json({ success: false, message: 'You are not authorised to review this request.' });
    }

    step.status     = 'rejected';
    step.officer    = req.user._id;
    step.comment    = comment;
    step.reviewedAt = new Date();

    await clearance.save();

    await Notification.create({
      recipient: clearance.student._id,
      type:      'danger',
      title:     `${officerDept.name} Clearance Rejected`,
      message:   `Your ${officerDept.name} clearance was rejected. Reason: ${comment}`,
      link:      '/student/status',
    });

    const template = emailTemplates.clearanceRejected(clearance.student.firstName, officerDept.name, comment);
    queueEmail({ to: clearance.student.email, ...template });

    await createAuditLog({
      user: req.user,
      action: 'CLEARANCE_REJECTED',
      detail: `Rejected ${officerDept.name} clearance for ${clearance.student.fullName} — ${comment}`,
      req,
    });

    res.json({ success: true, message: 'Clearance step rejected.', clearance });
  } catch (error) {
    next(error);
  }
};

/* ── Student: Resubmit a rejected department step ── */
exports.resubmitStep = async (req, res, next) => {
  try {
    const clearance = await Clearance.findById(req.params.id).populate('student');

    if (!clearance) {
      return res.status(404).json({ success: false, message: 'Clearance request not found.' });
    }

    if (clearance.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const step = clearance.departments.id(req.params.stepId);
    if (!step) {
      return res.status(404).json({ success: false, message: 'Department step not found.' });
    }

    if (step.status !== 'rejected') {
      return res.status(400).json({ success: false, message: 'Only rejected steps can be resubmitted.' });
    }

    const previousOfficerId = step.officer;
    const previousComment   = step.comment;

    step.status     = 'pending';
    step.comment    = '';
    step.officer    = undefined;
    step.reviewedAt = undefined;

    /* If every step is now pending/approved (none rejected), bump overall status back to in_progress */
    const stillRejected = clearance.departments.some(d => d.status === 'rejected');
    clearance.status = stillRejected ? clearance.status : 'in_progress';

    await clearance.save();

    /* Notify the department's officers again */
    if (previousOfficerId) {
      await Notification.create({
        recipient: previousOfficerId,
        type:      'info',
        title:     'Clearance Resubmitted',
        message:   `${clearance.student.fullName} (${clearance.student.matricNumber}) has resubmitted their ${step.departmentName} clearance for review.`,
        link:      `/officer/requests/${clearance._id}`,
      });
    }

    await createAuditLog({
      user: req.user,
      action: 'CLEARANCE_RESUBMITTED',
      detail: `Resubmitted ${step.departmentName} clearance after rejection (${clearance.requestId})`,
      req,
    });

    res.json({ success: true, message: 'Resubmitted successfully. The department will review it again.', clearance });
  } catch (error) {
    next(error);
  }
};

/* ── Registrar: Get requests ready for final approval ── */
exports.getFinalVerificationQueue = async (req, res, next) => {
  try {
    const clearances = await Clearance.find({ status: 'in_progress' })
      .populate('student', 'firstName lastName email matricNumber programme')
      .populate('departments.officer', 'firstName lastName')
      .sort({ submittedAt: 1 });

    /* Only show those where ALL department steps are approved */
    const ready = clearances.filter(c =>
      c.departments.every(d => d.status === 'approved')
    );

    res.json({ success: true, requests: ready });
  } catch (error) {
    next(error);
  }
};

/* ── Registrar: Grant final clearance ── */
exports.grantFinalClearance = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const clearance = await Clearance.findById(req.params.id).populate('student');

    if (!clearance) {
      return res.status(404).json({ success: false, message: 'Clearance request not found.' });
    }

    const allApproved = clearance.departments.every(d => d.status === 'approved');
    if (!allApproved) {
      return res.status(400).json({ success: false, message: 'Not all departments have approved this request yet.' });
    }

    clearance.status              = 'completed';
    clearance.registrar           = req.user._id;
    clearance.registrarComment    = comment || '';
    clearance.registrarApprovedAt = new Date();
    clearance.completedAt         = new Date();

    await clearance.save();

    await Notification.create({
      recipient: clearance.student._id,
      type:      'success',
      title:     'Final Clearance Granted',
      message:   'Congratulations! Your clearance has been fully approved. You may now download your certificate.',
      link:      '/student/certificate',
    });

    const template = emailTemplates.certificateReady(clearance.student.firstName);
    queueEmail({ to: clearance.student.email, ...template });

    await createAuditLog({
      user: req.user,
      action: 'FINAL_APPROVAL',
      detail: `Granted final clearance to ${clearance.student.fullName} (${clearance.requestId})`,
      req,
    });

    res.json({ success: true, message: 'Final clearance granted.', clearance });
  } catch (error) {
    next(error);
  }
};

/* ── Registrar/Admin: List all clearances with filters ── */
exports.getAllClearances = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;

    let query = Clearance.find(filter)
      .populate('student', 'firstName lastName email matricNumber programme')
      .sort({ createdAt: -1 });

    const total = await Clearance.countDocuments(filter);
    const clearances = await query
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, clearances, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

/* ── Get single clearance by ID (any authorised role) ── */
exports.getClearanceById = async (req, res, next) => {
  try {
    const clearance = await Clearance.findById(req.params.id)
      .populate('student', 'firstName lastName email matricNumber programme')
      .populate('departments.officer', 'firstName lastName')
      .populate('registrar', 'firstName lastName');

    if (!clearance) {
      return res.status(404).json({ success: false, message: 'Clearance request not found.' });
    }

    res.json({ success: true, clearance });
  } catch (error) {
    next(error);
  }
};