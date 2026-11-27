import PropTypes from 'prop-types';
import {useRef} from 'react';

const ENTER_KEYCODE = 13;

/*
 * The element the current wheel gesture started on (null once the gesture has
 * moved off it). A gesture ends after WHEEL_GESTURE_GAP_MS without wheel events.
 * A field only steps for a gesture that started on it: scrolling the panel
 * must not change a focused field that passes under the pointer (#12).
 */
const WHEEL_GESTURE_GAP_MS = 300;
const wheelGesture = {target: null, time: -Infinity};
if (typeof document !== 'undefined') {
  document.addEventListener(
    'wheel',
    (event) => {
      if (event.timeStamp - wheelGesture.time > WHEEL_GESTURE_GAP_MS) {
        wheelGesture.target = event.target;
      } else if (event.target !== wheelGesture.target) {
        wheelGesture.target = null;
      }
      wheelGesture.time = event.timeStamp;
    },
    {capture: true, passive: true}
  );
}

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
    if (
      onWheel &&
      document.activeElement === inputRef.current &&
      wheelGesture.target === inputRef.current
    ) {
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
