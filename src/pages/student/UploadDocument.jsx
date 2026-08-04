import { useState, useRef, useEffect } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import toast                 from 'react-hot-toast';
import DashboardLayout       from '../../component/layout/DashboardLayout';
import Button                from '../../component/common/Button';
import documentService       from '../../services/documentService';

const REQUIRED_DOCS = [
  { id: 'passport',     label: 'Passport Photograph',         accepts: 'image/*',      required: true  },
  { id: 'studentId',    label: 'Student ID Card (Scan)',      accepts: 'image/*,.pdf', required: true  },
  { id: 'paymentProof', label: 'School Fees Payment Receipt', accepts: '.pdf,image/*', required: true  },
  { id: 'result',       label: 'Final Year Result Printout',  accepts: '.pdf',         required: true  },
  { id: 'hostelForm',   label: 'Hostel Clearance Form',       accepts: '.pdf,image/*', required: false },
  { id: 'libraryForm',  label: 'Library Clearance Form',      accepts: '.pdf,image/*', required: false },
];

const formatBytes = (bytes) => {
  if (bytes < 1024)    return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};

const UploadDocuments = () => {
  const [documents, setDocuments] = useState([]);   // uploaded docs from backend
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState({});   // { docId: true/false }
  const [progress,  setProgress]  = useState({});   // { docId: pct }
  const [dragging,  setDragging]  = useState(null);
  const inputRefs = useRef({});

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await documentService.getMyDocuments();
      setDocuments(res.data.documents);
    } catch (err) {
      toast.error('Failed to load your documents.');
    } finally {
      setLoading(false);
    }
  };

  const getDocFor = (docId) => documents.find(d => d.documentType === docId);

  const handleFile = async (docId, file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(`${file.name} exceeds the 5 MB limit.`);
      return;
    }

    try {
      setUploading(prev => ({ ...prev, [docId]: true }));
      setProgress(prev => ({ ...prev, [docId]: 0 }));

      await documentService.upload(file, docId, null, (pct) => {
        setProgress(prev => ({ ...prev, [docId]: pct }));
      });

      toast.success(`${file.name} uploaded successfully.`);
      await fetchDocuments();
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed. Please try again.';
      toast.error(msg);
    } finally {
      setUploading(prev => ({ ...prev, [docId]: false }));
      setProgress(prev => ({ ...prev, [docId]: 0 }));
    }
  };

  const removeFile = async (docId) => {
    const doc = getDocFor(docId);
    if (!doc) return;

    try {
      await documentService.deleteDocument(doc._id);
      toast.success('Document removed.');
      await fetchDocuments();
    } catch {
      toast.error('Failed to remove document.');
    }
  };

  const handleDrop = (e, docId) => {
    e.preventDefault();
    setDragging(null);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(docId, file);
  };

  const uploadedCount    = documents.length;
  const requiredCount    = REQUIRED_DOCS.filter(d => d.required).length;
  const requiredUploaded = REQUIRED_DOCS.filter(d => d.required && getDocFor(d.id)).length;

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-20)' }}>
          <Loader2 size={28} className="animate-spin" color="var(--color-primary-700)" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">Upload Documents</h1>
          <p className="page-subtitle">Upload all required documents before submitting your clearance</p>
        </div>
      </div>

      {/* Progress banner */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-gray-700)' }}>
              Required documents: {requiredUploaded} / {requiredCount} uploaded
            </span>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
              {uploadedCount} total files uploaded
            </span>
          </div>
          <div style={{ height: 6, background: 'var(--color-gray-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 'var(--radius-full)',
              background: requiredUploaded === requiredCount ? 'var(--color-success)' : 'var(--color-primary-700)',
              width: `${(requiredUploaded / requiredCount) * 100}%`,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      </div>

      {requiredUploaded < requiredCount && (
        <div className="alert alert-info" style={{ marginBottom: 'var(--space-5)' }}>
          <AlertCircle size={18} className="alert-icon" />
          <div className="alert-content">
            <p>Upload all required documents before submitting your clearance request.</p>
          </div>
        </div>
      )}

      {/* Document cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
        {REQUIRED_DOCS.map((doc) => {
          const uploadedDoc = getDocFor(doc.id);
          const isUploading = uploading[doc.id];
          const pct         = progress[doc.id] || 0;
          const isDragging  = dragging === doc.id;

          return (
            <div key={doc.id} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                  <div>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-800)' }}>
                      {doc.label}
                    </p>
                    <span className={`badge ${doc.required ? 'badge-danger' : 'badge-gray'}`} style={{ marginTop: 4 }}>
                      {doc.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                  {uploadedDoc && <CheckCircle size={20} color="var(--color-success)" />}
                </div>

                {isUploading ? (
                  /* Upload progress */
                  <div style={{ padding: 'var(--space-4)', border: '1.5px dashed var(--color-primary-300)', borderRadius: 'var(--radius)', background: 'var(--color-primary-50)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-700)', fontWeight: 'var(--font-medium)' }}>
                        Uploading...
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-700)' }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--color-primary-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-primary-700)', transition: 'width 0.2s ease' }} />
                    </div>
                  </div>
                ) : uploadedDoc ? (
                  /* File preview row */
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    background: 'var(--color-success-light)', borderRadius: 'var(--radius)',
                    padding: 'var(--space-3)',
                  }}>
                    <File size={20} color="var(--color-success)" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="truncate" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-gray-800)' }}>
                        {uploadedDoc.originalName}
                      </p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
                        {formatBytes(uploadedDoc.fileSize)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(doc.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gray-400)', padding: 4, borderRadius: 4 }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  /* Drop zone */
                  <div
                    onDragOver={e => { e.preventDefault(); setDragging(doc.id); }}
                    onDragLeave={() => setDragging(null)}
                    onDrop={e => handleDrop(e, doc.id)}
                    onClick={() => inputRefs.current[doc.id]?.click()}
                    style={{
                      border: `2px dashed ${isDragging ? 'var(--color-primary-500)' : 'var(--color-gray-300)'}`,
                      borderRadius: 'var(--radius)',
                      padding: 'var(--space-5)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: isDragging ? 'var(--color-primary-50)' : 'var(--color-gray-50)',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <Upload size={24} color={isDragging ? 'var(--color-primary-700)' : 'var(--color-gray-400)'} style={{ margin: '0 auto var(--space-2)' }} />
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
                      Drag & drop or <span style={{ color: 'var(--color-primary-700)', fontWeight: 'var(--font-medium)' }}>click to browse</span>
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', marginTop: 4 }}>PDF, JPG, PNG — Max 5 MB</p>
                  </div>
                )}

                <input
                  ref={el => inputRefs.current[doc.id] = el}
                  type="file"
                  accept={doc.accepts}
                  style={{ display: 'none' }}
                  onChange={e => handleFile(doc.id, e.target.files[0])}
                />
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default UploadDocuments;