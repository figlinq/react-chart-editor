import DropdownWidget from '../widgets/Dropdown';
import Field from './Field';
import PropTypes from 'prop-types';
import {connectToContainer} from 'lib';

export const UnconnectedDropdown = (props) => (
  <Field {...props}>
    <DropdownWidget
      backgroundDark={props.backgroundDark}
      options={props.options}
      value={props.fullValue}
      onChange={props.updatePlot}
      clearable={props.clearable}
      placeholder={props.multiValued ? props.fullValue : ''}
      disabled={props.disabled}
      components={props.components}
    />
  </Field>
);

UnconnectedDropdown.propTypes = {
  backgroundDark: PropTypes.bool,
  components: PropTypes.object,
  clearable: PropTypes.bool,
  fullValue: PropTypes.any,
  options: PropTypes.array.isRequired,
  updatePlot: PropTypes.func,
  disabled: PropTypes.bool,
  ...Field.propTypes,
};

UnconnectedDropdown.displayName = 'UnconnectedDropdown';

export default connectToContainer(UnconnectedDropdown);
