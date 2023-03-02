import PropTypes from 'prop-types';
import {bem} from 'lib';

const Button = ({children, className, icon, label, variant, ...rest}) => (
  <button
    className={`button ${variant ? `button--${variant}` : 'button--default'} ${className || ''}`}
    {...rest}
  >
    <div className={bem('button', 'wrapper')}>
      {Boolean(icon) && <div className={bem('button', 'icon')}>{icon}</div>}
      <div className="button__label">{label || children}</div>
    </div>
  </button>
);

Button.propTypes = {
  children: PropTypes.node,
  className: PropTypes.any,
  icon: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  label: PropTypes.any,
  variant: PropTypes.string,
};

export default Button;
