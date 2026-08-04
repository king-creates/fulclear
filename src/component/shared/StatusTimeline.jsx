import { CheckCircle, Circle, Clock, XCircle } from 'lucide-react';

const stepIcon = (status) => {
  if (status === 'approved')  return <CheckCircle size={20} color="var(--color-success)" />;
  if (status === 'rejected')  return <XCircle     size={20} color="var(--color-danger)"  />;
  if (status === 'active')    return <Clock       size={20} color="var(--color-primary-700)" />;
  return <Circle size={20} color="var(--color-gray-300)" />;
};

const StatusTimeline = ({ steps = [] }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <div key={step.id || i} style={{ display: 'flex', gap: 'var(--space-4)' }}>

            {/* Icon + Line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ flexShrink: 0, zIndex: 1 }}>
                {stepIcon(step.status)}
              </div>
              {!isLast && (
                <div style={{
                  width: 2, flex: 1, minHeight: 32,
                  background: step.status === 'approved'
                    ? 'var(--color-success)'
                    : 'var(--color-gray-200)',
                  margin: '4px 0',
                }} />
              )}
            </div>

            {/* Content */}
            <div style={{ paddingBottom: isLast ? 0 : 'var(--space-5)', flex: 1, paddingTop: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)', color: 'var(--color-gray-800)' }}>
                    {step.department}
                  </p>
                  {step.officer && (
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', marginTop: 2 }}>
                      Officer: {step.officer}
                    </p>
                  )}
                  {step.comment && (
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', marginTop: 4, fontStyle: 'italic' }}>
                      "{step.comment}"
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 'var(--space-4)' }}>
                  <span className={`badge badge-${
                    step.status === 'approved' ? 'success' :
                    step.status === 'rejected' ? 'danger'  :
                    step.status === 'active'   ? 'primary' : 'gray'
                  }`}>
                    {step.status === 'approved' ? 'Approved' :
                     step.status === 'rejected' ? 'Rejected' :
                     step.status === 'active'   ? 'In Review' : 'Pending'}
                  </span>
                  {step.date && (
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', marginTop: 4 }}>
                      {step.date}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;