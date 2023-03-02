import ColorPickerWidget from '../widgets/ColorPicker';
import Field from './Field';
import PropTypes from 'prop-types';
import {useState} from 'react';
import {connectToContainer} from 'lib';

export const UnconnectedColorPicker = (props, {localize: _}) => {
  const [empty, setEmpty] = useState(!props.fullValue && props.handleEmpty);

  return (
    <Field {...props}>
      {empty ? (
        <div className="js-test-info">
          {_('This color is computed from other parts of the figure but you can')}{' '}
          <a
            onClick={() => {
              setEmpty(false);
              props.updatePlot(props.defaultColor);
            }}
          >
            {_('override it')}
          </a>
          .
        </div>
      ) : (
        <ColorPickerWidget selectedColor={props.fullValue} onColorChange={props.updatePlot} />
      )}
    </Field>
  );
};

UnconnectedColorPicker.propTypes = {
  fullValue: PropTypes.any,
  updatePlot: PropTypes.func,
  handleEmpty: PropTypes.bool,
  defaultColor: PropTypes.string,
  ...Field.propTypes,
};

UnconnectedColorPicker.contextTypes = {
  localize: PropTypes.func,
};

UnconnectedColorPicker.displayName = 'UnconnectedColorPicker';

export default connectToContainer(UnconnectedColorPicker);
