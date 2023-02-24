import Dropdown from './Dropdown';
import PropTypes from 'prop-types';

const FontSelector = (props, {fontOptions}) => (
  <Dropdown
    {...props}
    options={fontOptions.map(({value, label}) => ({
      label: <span style={{fontFamily: value}}>{label}</span>,
      value,
    }))}
  />
);

FontSelector.propTypes = {
  ...Dropdown.propTypes,
};

FontSelector.defaultProps = {clearable: false};

FontSelector.contextTypes = {
  fontOptions: PropTypes.array,
};

export default FontSelector;
