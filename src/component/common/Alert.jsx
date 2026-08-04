import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  danger:  <XCircle size={18} />,
  info:    <Info size={18} />,
};

const Alert = ({ variant = 'info', title = '', message = '', onClose = null }) => {
  return (
    <div className={`alert alert-${variant}`} role="alert">
      <span className="alert-icon">{icons[variant]}</span>
      <div className="alert-content">
        {title   && <p className="alert-title">{title}</p>}
        {message && <p>{message}</p>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;