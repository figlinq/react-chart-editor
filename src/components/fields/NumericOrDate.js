import Field from './Field';
import {UnconnectedNumeric} from './Numeric';
import PropTypes from 'prop-types';
import {connectToContainer} from 'lib';
import {isDateTime} from 'plotly.js/src/lib';
import {isJSDate} from 'plotly.js/src/lib/dates';
import {UnconnectedDateTimePicker} from './DateTimePicker';

export const UnconnectedNumericOrDate = (props) => {
  const date = typeof props.fullValue === 'string' && props.fullValue.split(' ')[0];
  const fullValueIsDate =
    typeof props.fullValue === 'string' && date && (isDateTime(date) || isJSDate(date));

  return fullValueIsDate ? (
    <UnconnectedDateTimePicker {...props} placeholder={'yyyy-mm-dd hh:mm:ss.xxx'} />
  ) : (
    <UnconnectedNumeric {...props} />
  );
};

UnconnectedNumericOrDate.propTypes = {
  defaultValue: PropTypes.any,
  fullValue: PropTypes.any,
  min: PropTypes.number,
  max: PropTypes.number,
  multiValued: PropTypes.bool,
  hideArrows: PropTypes.bool,
  showSlider: PropTypes.bool,
  step: PropTypes.number,
  fullContainer: PropTypes.object,
  updatePlot: PropTypes.func,
  ...Field.propTypes,
};

UnconnectedNumericOrDate.displayName = 'UnconnectedNumericOrDate';

export default connectToContainer(UnconnectedNumericOrDate);
