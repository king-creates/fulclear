const Input = ({
  label,
  name,
  type = 'text',
  placeholder = '',
  error = '',
  hint = '',
  required = false,
  iconLeft = null,
  iconRight = null,
  onIconRightClick = null,
  register = {},
  className = '',
  ...props
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}

      <div className="input-wrapper">
        {iconLeft && (
          <span className="input-icon-left">{iconLeft}</span>
        )}

        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          className={[
            'form-input',
            error ? 'error' : '',
            iconLeft  ? 'has-icon-left'  : '',
            iconRight ? 'has-icon-right' : '',
            className,
          ].filter(Boolean).join(' ')}
          {...register}
          {...props}
        />

        {iconRight && (
          <button
            type="button"
            className="input-icon-right"
            onClick={onIconRightClick}
            tabIndex={-1}
          >
            {iconRight}
          </button>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}
      {hint  && !error && <p className="form-hint">{hint}</p>}
    </div>
  );
};

export default Input;