import PropTypes from 'prop-types';
import {useRef} from 'react';

const ENTER_KEYCODE = 13;

// A generic component to handle text that can be edited when the user clicks on it.
const EditableText = ({
  type,
  className,
  text,
  disable,
  autoFocus,
  placeholder,
  readOnly,
  size,
  onKeyDown,
  onChange,
  onUpdate,
  onWheel,
}) => {
  const inputRef = useRef();

  const handleFocus = (event) => {
    event.target.select();
  };

  const handleChange = (event) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  const handleUpdate = (event) => {
    if (onUpdate) {
      onUpdate(event.target.value);
    }
  };

  const handleKeyDown = (event) => {
    // This will force handleUpdate to be called via the input's onBlur
    if ((event.keyCode || event.which) === ENTER_KEYCODE) {
      inputRef.current.blur();
    } else {
      onKeyDown(event);
    }
  };

  const handleWheel = (event) => {
    if (onWheel && document.activeElement === inputRef.current) {
      onWheel(event);
    }
  };

  return (
    <input
      ref={inputRef}
      type={type}
      className={className || ''}
      value={text}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleUpdate}
      disabled={disable}
      autoFocus={autoFocus}
      onKeyDown={handleKeyDown}
      onWheel={handleWheel}
      placeholder={placeholder}
      readOnly={readOnly}
      size={size}
    />
  );
};

EditableText.propTypes = {
  // Called with input value on changes (as the user types)
  onChange: PropTypes.func,

  // Called with input value on blur (and enter if no onEnter is given)
  onUpdate: PropTypes.func,

  // Called on input keyDown events
  onKeyDown: PropTypes.func,

  onWheel: PropTypes.func,
  // Input value property ...
  text: PropTypes.any,

  // Input properties
  placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  disable: PropTypes.bool,
  autoFocus: PropTypes.bool,
  readOnly: PropTypes.bool,
  type: PropTypes.oneOf(['text', 'password']),
  size: PropTypes.number,
};

EditableText.defaultProps = {
  readOnly: false,
  type: 'text',
};

export default EditableText;
