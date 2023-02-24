import Field from './Field';
import FlaglistCheckboxGroup from '../widgets/FlaglistCheckboxGroup';
import PropTypes from 'prop-types';
import {connectToContainer} from 'lib';

export const UnconnectedFlaglist = (props) => (
  <Field {...props}>
    <FlaglistCheckboxGroup
      options={props.options}
      activeOption={props.fullValue}
      onChange={props.updatePlot}
    />
  </Field>
);

UnconnectedFlaglist.propTypes = {
  fullValue: PropTypes.any,
  options: PropTypes.array.isRequired,
  updatePlot: PropTypes.func,
  ...Field.propTypes,
};

UnconnectedFlaglist.displayName = 'UnconnectedFlaglist';

export default connectToContainer(UnconnectedFlaglist);
