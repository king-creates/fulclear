import { useState, useEffect } from 'react';
import { Award, Download, Loader2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout    from '../../component/layout/DashboardLayout';
import Button             from '../../component/common/Button';
import certificateService from '../../services/certificateService';
import { formatDate }     from '../../utils/formatDate';
import { useAuth }        from '../../hooks/UseAuth';

const Certificate = () => {
  const { user } = useAuth();
  const [status,      setStatus]      = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await certificateService.getStatus();
      setStatus(res.data);
    } catch {
      toast.error('Failed to check certificate status.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await certificateService.download(status.clearanceId);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Clearance_Certificate_${user?.matricNumber || 'certificate'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to download certificate.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-20)' }}>
          <Loader2 size={28} className="animate-spin" color="var(--color-primary-700)" />
        </div>
      </DashboardLayout>
    );
  }

  if (!status?.eligible) {
    return (
      <DashboardLayout>
        <div className="page-header">
          <h1 className="page-title">Clearance Certificate</h1>
          <p className="page-subtitle">Download your official clearance certificate</p>
        </div>

        <div className="card" style={{ maxWidth: 560 }}>
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--color-gray-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto var(--space-5)',
            }}>
              <Lock size={32} color="var(--color-gray-400)" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gray-800)', marginBottom: 'var(--space-3)' }}>
              Certificate Not Yet Available
            </h3>
            <p style={{ color: 'var(--color-gray-500)', lineHeight: 1.7, fontSize: 'var(--text-sm)' }}>
              Your clearance certificate will be available for download once all department clearances are approved and the Registrar has issued final authorization.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">Clearance Certificate</h1>
          <p className="page-subtitle">Your official FUL clearance certificate is ready</p>
        </div>
        <Button variant="primary" loading={downloading} onClick={handleDownload}>
          <Download size={16} /> Download Certificate
        </Button>
      </div>

      <div className="card" style={{ maxWidth: 640, padding: 'var(--space-12)', textAlign: 'center', border: '3px solid var(--color-primary-700)' }}>
        <Award size={64} color="var(--color-gold-400)" style={{ margin: '0 auto var(--space-5)' }} />
        <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary-700)', marginBottom: 'var(--space-2)' }}>
          Congratulations, {user?.firstName}!
        </h2>
        <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--space-6)', lineHeight: 1.7 }}>
          Your clearance has been fully approved by all departments and the Registrar's office.
          Your official certificate is ready to download.
        </p>

        <div style={{
          background: 'var(--color-gray-50)', borderRadius: 'var(--radius)',
          padding: 'var(--space-5)', display: 'flex', justifyContent: 'space-around',
          flexWrap: 'wrap', gap: 'var(--space-4)',
        }}>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>Request ID</p>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', fontFamily: 'monospace', color: 'var(--color-gray-800)' }}>
              {status.requestId}
            </p>
          </div>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>Issued</p>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-800)' }}>
              {status.issuedAt ? formatDate(status.issuedAt) : 'Just now'}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Certificate;