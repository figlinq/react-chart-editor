import ColorscalePickerWidget from '../widgets/ColorscalePicker';
import Field from './Field';
import PropTypes from 'prop-types';
import {connectToContainer} from 'lib';

const UnconnectedColorwayPicker = (props) => (
  <Field {...props}>
    <ColorscalePickerWidget
      selected={props.fullValue}
      onColorscaleChange={props.updatePlot}
      initialCategory="categorical"
      disableCategorySwitch={props.disableCategorySwitch}
    />
  </Field>
);

UnconnectedColorwayPicker.propTypes = {
  fullValue: PropTypes.any,
  updatePlot: PropTypes.func,
  ...Field.propTypes,
};

UnconnectedColorwayPicker.displayName = 'UnconnectedColorwayPicker';

export default connectToContainer(UnconnectedColorwayPicker);
