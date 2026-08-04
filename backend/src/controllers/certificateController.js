const PDFDocument = require('pdfkit');
const Clearance    = require('../models/Clearance');
const createAuditLog = require('../utils/auditLog');

/* ── Generate and stream a PDF certificate ── */
exports.generateCertificate = async (req, res, next) => {
  try {
    const clearance = await Clearance.findById(req.params.id)
      .populate('student', 'firstName lastName matricNumber programme email')
      .populate('registrar', 'firstName lastName');

    if (!clearance) {
      return res.status(404).json({ success: false, message: 'Clearance record not found.' });
    }

    /* Students may only download their own certificate */
    if (req.user.role === 'student' && clearance.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    /* Certificate only exists once fully approved by the registrar */
    if (clearance.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Certificate not yet available. Final clearance has not been granted.' });
    }

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Clearance_Certificate_${clearance.student.matricNumber || clearance.requestId}.pdf`
    );

    doc.pipe(res);

    /* ── Page background ── */
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');

    /* ── Decorative border ── */
    const margin = 24;
    doc.rect(margin, margin, doc.page.width - margin * 2, doc.page.height - margin * 2)
       .lineWidth(3)
       .stroke('#1a3d7a');
    doc.rect(margin + 8, margin + 8, doc.page.width - (margin + 8) * 2, doc.page.height - (margin + 8) * 2)
       .lineWidth(1)
       .stroke('#fbbf24');

    const centerX = doc.page.width / 2;

    /* ── Header ── */
    doc.fillColor('#1a3d7a')
       .font('Helvetica-Bold')
       .fontSize(26)
       .text('FEDERAL UNIVERSITY LOKOJA', 0, 70, { align: 'center' });

    doc.fillColor('#6b7280')
       .font('Helvetica')
       .fontSize(11)
       .text('OFFICE OF THE REGISTRAR', 0, 102, { align: 'center', characterSpacing: 2 });

    /* Gold divider */
    doc.moveTo(centerX - 60, 130).lineTo(centerX + 60, 130).lineWidth(2).stroke('#fbbf24');

    /* ── Title ── */
    doc.fillColor('#111827')
       .font('Helvetica-Bold')
       .fontSize(20)
       .text('STUDENT CLEARANCE CERTIFICATE', 0, 150, { align: 'center' });

    /* ── Body ── */
    doc.fillColor('#4b5563')
       .font('Helvetica')
       .fontSize(12)
       .text('This is to certify that', 0, 195, { align: 'center' });

    doc.fillColor('#1a3d7a')
       .font('Helvetica-Bold')
       .fontSize(24)
       .text(`${clearance.student.firstName} ${clearance.student.lastName}`, 0, 218, { align: 'center' });

    doc.fillColor('#6b7280')
       .font('Helvetica')
       .fontSize(12)
       .text(`Matriculation Number: ${clearance.student.matricNumber || 'N/A'}`, 0, 252, { align: 'center' });

    doc.fillColor('#4b5563')
       .fontSize(11)
       .text(
         `has successfully completed all clearance requirements for the ${clearance.graduationYear || '____'} academic session ` +
         `in the programme of ${clearance.programme || 'the university'}, and is hereby certified fully cleared by all relevant ` +
         `university departments as listed below.`,
         centerX - 320, 280,
         { width: 640, align: 'center', lineGap: 4 }
       );

    /* ── Department list (compact grid) ── */
    const deptStartY = 340;
    const colWidth = 210;
    const cols = 3;
    clearance.departments.forEach((dept, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = centerX - (colWidth * cols) / 2 + col * colWidth;
      const y = deptStartY + row * 20;

      doc.fillColor('#16a34a').font('Helvetica-Bold').fontSize(9).text('✓', x, y);
      doc.fillColor('#374151').font('Helvetica').fontSize(9).text(dept.departmentName, x + 14, y, { width: colWidth - 20 });
    });

    /* ── Signatures ── */
    const sigY = doc.page.height - 130;
    const sigWidth = 180;

    /* Registrar signature */
    doc.moveTo(centerX - 320, sigY).lineTo(centerX - 320 + sigWidth, sigY).lineWidth(1).stroke('#9ca3af');
    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(10)
       .text(clearance.registrar ? `${clearance.registrar.firstName} ${clearance.registrar.lastName}` : 'Registrar', centerX - 320, sigY + 6, { width: sigWidth, align: 'center' });
    doc.fillColor('#6b7280').font('Helvetica').fontSize(9)
       .text('REGISTRAR', centerX - 320, sigY + 20, { width: sigWidth, align: 'center', characterSpacing: 1 });

    /* Date issued */
    doc.moveTo(centerX - sigWidth / 2, sigY).lineTo(centerX + sigWidth / 2, sigY).lineWidth(1).stroke('#9ca3af');
    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(10)
       .text(new Date(clearance.completedAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }), centerX - sigWidth / 2, sigY + 6, { width: sigWidth, align: 'center' });
    doc.fillColor('#6b7280').font('Helvetica').fontSize(9)
       .text('DATE ISSUED', centerX - sigWidth / 2, sigY + 20, { width: sigWidth, align: 'center', characterSpacing: 1 });

    /* Certificate ID */
    doc.moveTo(centerX + 320 - sigWidth, sigY).lineTo(centerX + 320, sigY).lineWidth(1).stroke('#9ca3af');
    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(10)
       .text(clearance.requestId, centerX + 320 - sigWidth, sigY + 6, { width: sigWidth, align: 'center' });
    doc.fillColor('#6b7280').font('Helvetica').fontSize(9)
       .text('CERTIFICATE ID', centerX + 320 - sigWidth, sigY + 20, { width: sigWidth, align: 'center', characterSpacing: 1 });

    /* ── Footer ── */
    doc.fillColor('#9ca3af').font('Helvetica').fontSize(8)
       .text('This is a system-generated certificate from the FUL Student Online Clearance System (SOCS).', 0, doc.page.height - 45, { align: 'center' });

    doc.end();

    /* Mark certificate as issued (only on first successful generation) */
    if (!clearance.certificateIssued) {
      clearance.certificateIssued   = true;
      clearance.certificateIssuedAt = new Date();
      await clearance.save();
    }

    await createAuditLog({
      user: req.user,
      action: 'CERTIFICATE_DOWNLOADED',
      detail: `Certificate downloaded for ${clearance.student.firstName} ${clearance.student.lastName} (${clearance.requestId})`,
      req,
    });

  } catch (error) {
    next(error);
  }
};

/* ── Check certificate eligibility (used by frontend to show/hide download button) ── */
exports.getCertificateStatus = async (req, res, next) => {
  try {
    const clearance = await Clearance.findOne({ student: req.user._id, status: 'completed' })
      .sort({ completedAt: -1 });

    if (!clearance) {
      return res.json({ success: true, eligible: false });
    }

    res.json({
      success: true,
      eligible: true,
      clearanceId: clearance._id,
      requestId:   clearance.requestId,
      issuedAt:    clearance.certificateIssuedAt,
    });
  } catch (error) {
    next(error);
  }
};