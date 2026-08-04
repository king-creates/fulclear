import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  CheckCircle, AlertCircle, ChevronRight, ChevronLeft, Send, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import DashboardLayout from '../../component/layout/DashboardLayout';
import Button from '../../component/common/Button';
import clearanceService from '../../services/clearanceService';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';

const STEPS = ['Personal Info', 'Select Units', 'Confirm & Submit'];

const SubmitClearance = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyActive, setAlreadyActive] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm({
    defaultValues: {
      graduationYear: String(new Date().getFullYear()),
      programme: user?.programme || '',
      sessionCompleted: '',
      remarks: '',
    },
  });

  /* Fetch departments and check for an existing active request */
  useEffect(() => {
    (async () => {
      try {
        setLoadingDepts(true);
        const [deptRes, myRes] = await Promise.all([
          clearanceService.getDepartments(),
          clearanceService.getMy(),
        ]);
        setDepartments(deptRes.data.departments);
        setSelectedUnits(deptRes.data.departments.map(d => d._id));

        if (myRes.data.clearance) {
          setAlreadyActive(true);
        }
      } catch {
        toast.error('Failed to load clearance units.');
      } finally {
        setLoadingDepts(false);
      }
    })();
  }, []);

  const toggleUnit = (id) => {
    setSelectedUnits(prev =>
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  };

  const handleNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  const onSubmit = async () => {
    if (selectedUnits.length === 0) {
      toast.error('Select at least one clearance unit.');
      return;
    }
    try {
      setSubmitting(true);
      const values = getValues();
      await clearanceService.submit({
        ...values,
        selectedUnits,
      });
      toast.success('Clearance request submitted successfully!');
      navigate(ROUTES.STUDENT_STATUS);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const values = getValues();

  if (loadingDepts) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-20)' }}>
          <Loader2 size={28} className="animate-spin" color="var(--color-primary-700)" />
        </div>
      </DashboardLayout>
    );
  }

  if (alreadyActive) {
    return (
      <DashboardLayout>
        <div className="page-header">
          <h1 className="page-title">Submit Clearance Request</h1>
        </div>
        <div className="card" style={{ maxWidth: 560 }}>
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <AlertCircle size={40} color="var(--color-warning)" style={{ margin: '0 auto var(--space-4)' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gray-800)', marginBottom: 'var(--space-3)' }}>
              You already have an active clearance request
            </h3>
            <p style={{ color: 'var(--color-gray-500)', marginBottom: 'var(--space-6)' }}>
              Check your clearance status page to track its progress.
            </p>
            <Button variant="primary" onClick={() => navigate(ROUTES.STUDENT_STATUS)}>
              View Clearance Status
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Submit Clearance Request</h1>
        <p className="page-subtitle">Complete all steps to initiate your clearance process</p>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-8)', maxWidth: 640 }}>
        {STEPS.map((label, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'initial' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'var(--font-bold)', fontSize: 'var(--text-sm)',
                background: i < step ? 'var(--color-success)' :
                  i === step ? 'var(--color-primary-700)' : 'var(--color-gray-200)',
                color: i <= step ? 'white' : 'var(--color-gray-500)',
                transition: 'all var(--transition)',
              }}>
                {i < step ? <CheckCircle size={18} /> : i + 1}
              </div>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: i === step ? 'var(--color-primary-700)' : 'var(--color-gray-400)', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < step ? 'var(--color-success)' : 'var(--color-gray-200)', margin: '0 var(--space-3)', marginBottom: 22, transition: 'background var(--transition)' }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 720 }}>
        <div className="card">
          <div className="card-body" style={{ padding: 'var(--space-8)' }}>

            {step === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)' }}>Personal Information</h3>

                <div style={{ background: 'var(--color-gray-50)', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius)', padding: 'var(--space-4)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    {[
                      { label: 'Full Name', value: `${user?.firstName ?? ''} ${user?.lastName ?? ''}` },
                      { label: 'Matric Number', value: user?.matricNumber ?? '—' },
                      { label: 'Email', value: user?.email ?? '' },
                      { label: 'Department', value: user?.department ?? '' },
                    ].map((f) => (
                      <div key={f.label}>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', marginBottom: 2 }}>{f.label}</p>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-800)' }}>{f.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Graduation Year <span className="required">*</span></label>
                  <select className="form-select" {...register('graduationYear', { required: true })}>
                    {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + 1 - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Programme</label>
                  <input className="form-input" {...register('programme')} />
                </div>

                <div className="form-group">
                  <label className="form-label">Session Completed</label>
                  <input className="form-input" {...register('sessionCompleted')} />
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Remarks</label>
                  <textarea className="form-textarea" rows={3} placeholder="Any special notes for the clearance officers..." {...register('remarks')} />
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)' }}>Select Clearance Units</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginBottom: 'var(--space-5)' }}>
                  All units are selected by default. Deselect any that don't apply to you.
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-3)' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
                    {selectedUnits.length} of {departments.length} selected
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  {departments.map((dept) => {
                    const isSelected = selectedUnits.includes(dept._id);
                    return (
                      <label
                        key={dept._id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                          padding: 'var(--space-3) var(--space-4)',
                          border: `2px solid ${isSelected ? 'var(--color-primary-700)' : 'var(--color-gray-200)'}`,
                          borderRadius: 'var(--radius)',
                          cursor: 'pointer',
                          background: isSelected ? 'var(--color-primary-50)' : 'var(--color-white)',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleUnit(dept._id)}
                          style={{ accentColor: 'var(--color-primary-700)', width: 16, height: 16, flexShrink: 0 }}
                        />
                        <div>
                          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-gray-800)' }}>{dept.name}</p>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)' }}>{dept.code}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gray-900)', marginBottom: 'var(--space-5)' }}>Review & Confirm</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                  <div style={{ background: 'var(--color-gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--color-gray-200)', padding: 'var(--space-5)' }}>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-700)', marginBottom: 'var(--space-4)' }}>Request Summary</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      {[
                        { label: 'Full Name', value: `${user?.firstName ?? ''} ${user?.lastName ?? ''}` },
                        { label: 'Matric Number', value: user?.matricNumber ?? '—' },
                        { label: 'Graduation Year', value: values.graduationYear },
                        { label: 'Programme', value: values.programme },
                        { label: 'Units Selected', value: `${selectedUnits.length} departments` },
                      ].map((row) => (
                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                          <span style={{ color: 'var(--color-gray-500)' }}>{row.label}</span>
                          <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-gray-800)' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-700)', marginBottom: 'var(--space-3)' }}>Clearance Units</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                      {selectedUnits.map(id => {
                        const dept = departments.find(d => d._id === id);
                        return dept ? (
                          <span key={id} className="badge badge-primary">{dept.name}</span>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div className="alert alert-info">
                    <AlertCircle size={18} className="alert-icon" />
                    <div className="alert-content">
                      <p className="alert-title">Before you submit</p>
                      <p>Make sure you have uploaded all required documents. Once submitted, your request will be sent to all selected clearance units.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card-footer">
            {step > 0 && (
              <Button variant="secondary" onClick={handleBack}>
                <ChevronLeft size={16} /> Back
              </Button>
            )}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-3)' }}>
              {step < STEPS.length - 1 ? (
                <Button variant="primary" onClick={handleNext}>
                  Next <ChevronRight size={16} />
                </Button>
              ) : (
                <Button variant="primary" loading={submitting} onClick={onSubmit}>
                  <Send size={16} /> Submit Request
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubmitClearance;