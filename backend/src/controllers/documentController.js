const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');
const createAuditLog = require('../utils/auditLog');

const REQUIRED_DOCS = ['passport', 'studentId', 'paymentProof', 'result'];
const ALL_DOC_TYPES = ['passport', 'studentId', 'paymentProof', 'result', 'hostelForm', 'libraryForm', 'other'];

/* ── Student: Upload a document ── */
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file was uploaded.' });
    }

    const { documentType, clearanceId } = req.body;

    if (!documentType || !ALL_DOC_TYPES.includes(documentType)) {
      /* Clean up the orphaned file since we're rejecting the request */
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'A valid document type is required.' });
    }

    /* Replace any previous document of the same type for this student */
    const existing = await Document.findOne({ student: req.user._id, documentType });
    if (existing) {
      const oldPath = path.join(__dirname, '../../', existing.filePath);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      await Document.findByIdAndDelete(existing._id);
    }

    const relativePath = path.relative(path.join(__dirname, '../../'), req.file.path).replace(/\\/g, '/');
    const document = await Document.create({
      student: req.user._id,
      clearance: clearanceId || undefined,
      documentType,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: relativePath,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });

    await createAuditLog({
      user: req.user,
      action: 'DOCUMENT_UPLOADED',
      detail: `Uploaded ${documentType} document (${(req.file.size / 1024).toFixed(0)} KB)`,
      req,
    });

    res.status(201).json({ success: true, document });
  } catch (error) {
    /* Clean up file if something else failed after upload */
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    next(error);
  }
};

/* ── Student: Get my documents with completion summary ── */
exports.getMyDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ student: req.user._id }).sort({ createdAt: -1 });

    const uploadedTypes = documents.map(d => d.documentType);
    const requiredUploaded = REQUIRED_DOCS.filter(t => uploadedTypes.includes(t)).length;

    res.json({
      success: true,
      documents,
      summary: {
        totalUploaded: documents.length,
        requiredTotal: REQUIRED_DOCS.length,
        requiredUploaded,
        allRequiredMet: requiredUploaded === REQUIRED_DOCS.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ── Officer/Registrar/Admin: Get documents by student ── */
exports.getDocumentsByStudent = async (req, res, next) => {
  try {
    const documents = await Document.find({ student: req.params.studentId }).sort({ createdAt: -1 });
    res.json({ success: true, documents });
  } catch (error) {
    next(error);
  }
};

/* ── Student: Delete a document ── */
exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, student: req.user._id });
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const filePath = path.join(__dirname, '../../', document.filePath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Document.findByIdAndDelete(document._id);

    await createAuditLog({
      user: req.user,
      action: 'DOCUMENT_DELETED',
      detail: `Deleted ${document.documentType} document`,
      req,
    });

    res.json({ success: true, message: 'Document deleted.' });
  } catch (error) {
    next(error);
  }
};

/* ── Download a document file (any authorised viewer) ── */
exports.downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    if (req.user.role === 'student' && document.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const filePath = path.isAbsolute(document.filePath)
      ? document.filePath
      : path.join(__dirname, '../../', document.filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server.' });
    }

    res.download(filePath, document.originalName);
  } catch (error) {
    next(error);
  }
};
/* ── View a document inline (opens in browser instead of downloading) ── */
exports.viewDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    if (req.user.role === 'student' && document.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const filePath = path.isAbsolute(document.filePath)
      ? document.filePath
      : path.join(__dirname, '../../', document.filePath);

    console.log("Document filePath:", document.filePath);
    console.log("Resolved path:", filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server.' });
    }

    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    next(error);
  }
};