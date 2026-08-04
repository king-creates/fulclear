const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(uploadDir, req.user._id.toString());
    if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const ext           = path.extname(file.originalname);
    const documentType   = req.body.documentType || 'document';
    const safeName       = `${documentType}-${Date.now()}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExt  = /jpeg|jpg|png|pdf/;
  const allowedMime = /image\/jpeg|image\/jpg|image\/png|application\/pdf/;

  const extOk  = allowedExt.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowedMime.test(file.mimetype);

  if (extOk && mimeOk) return cb(null, true);
  cb(new Error('Only PDF, JPG, and PNG files are allowed.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files:    1,
  },
});

/* Wraps multer to turn its errors into clean JSON responses instead of crashing */
const handleUpload = (fieldName) => (req, res, next) => {
  const uploader = upload.single(fieldName);

  uploader(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File is too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

module.exports = upload;
module.exports.handleUpload = handleUpload;