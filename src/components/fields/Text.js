import Field from './Field';
import TextInput from '../widgets/TextInput';
import PropTypes from 'prop-types';
import {connectToContainer} from 'lib';

export const UnconnectedText = (props) => (
  <Field {...props}>
    <TextInput
      value={props.multiValued ? '' : props.fullValue}
      defaultValue={props.defaultValue}
      placeholder={props.multiValued ? props.fullValue : ''}
      onUpdate={props.updatePlot}
      onChange={props.onChange}
    />
  </Field>
);

UnconnectedText.propTypes = {
  defaultValue: PropTypes.any,
  fullValue: PropTypes.any,
  multiValued: PropTypes.bool,
  updatePlot: PropTypes.func,
  onChange: PropTypes.func,
  ...Field.propTypes,
};

UnconnectedText.displayName = 'UnconnectedText';

export default connectToContainer(UnconnectedText);
