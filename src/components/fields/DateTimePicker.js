import Field from './Field';
import Picker from '../widgets/DateTimePicker';
import PropTypes from 'prop-types';
import {connectToContainer} from 'lib';

export const UnconnectedDateTimePicker = (props) => (
  <Field {...props}>
    <Picker value={props.fullValue} placeholder={props.placeholder} onChange={props.updatePlot} />
  </Field>
);

UnconnectedDateTimePicker.propTypes = {
  fullValue: PropTypes.string,
  updatePlot: PropTypes.func,
  placeholder: PropTypes.string,
  ...Field.propTypes,
};

UnconnectedDateTimePicker.displayName = 'UnconnectedDateTimePicker';

export default connectToContainer(UnconnectedDateTimePicker);
