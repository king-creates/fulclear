const Spinner = ({ size = 'md', className = '' }) => (
  <span className={`spinner spinner-${size} ${className}`} role="status" aria-label="Loading" />
);

export const PageLoader = ({ message = 'Loading...' }) => (
  <div className="page-loader">
    <Spinner size="lg" />
    <p>{message}</p>
  </div>
);

export default Spinner;