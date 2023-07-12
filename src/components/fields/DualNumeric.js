import Field from './Field';
import NumericInput from '../widgets/NumericInput';
import PropTypes from 'prop-types';
import {connectToContainer} from 'lib';
import nestedProperty from 'plotly.js/src/lib/nested_property';

export const UnconnectedDualNumericFraction = (props) => {
  const updatePlot = (value) => {
    props.updatePlot(props.percentage ? value / 100 : value);
  };

  const updatePlot2 = (value) => {
    props.updateContainer({[props.attr2]: props.percentage ? value / 100 : value});
  };

  const {percentage, multiValued, attr2, step, min, max} = props;
  let fullValue = percentage ? Math.round(100 * props.fullValue) : props.fullValue;
  let fullValue2 = nestedProperty(props.fullContainer, attr2).get();

  if (percentage) {
    fullValue2 = Math.round(100 * fullValue2);
  }
  let placeholder;
  let placeholder2;
  if (multiValued) {
    placeholder = fullValue;
    placeholder2 = fullValue2;
    fullValue = '';
    fullValue2 = '';
  }

  return (
    <Field {...props}>
      <div className="numeric-input__wrapper">
        <NumericInput
          value={fullValue}
          defaultValue={props.defaultValue}
          placeholder={placeholder}
          step={step}
          min={min}
          max={max}
          onChange={updatePlot}
          onUpdate={updatePlot}
          showArrows={!props.hideArrows}
          showSlider={false}
        />
        <NumericInput
          value={fullValue2}
          defaultValue={props.defaultValue}
          placeholder={placeholder2}
          step={step}
          min={min}
          max={max}
          onChange={updatePlot2}
          onUpdate={updatePlot2}
          showArrows={!props.hideArrows}
          showSlider={false}
        />
      </div>
    </Field>
  );
};

UnconnectedDualNumericFraction.propTypes = {
  defaultValue: PropTypes.any,
  fullValue: PropTypes.any,
  min: PropTypes.number,
  max: PropTypes.number,
  multiValued: PropTypes.bool,
  hideArrows: PropTypes.bool,
  showSlider: PropTypes.bool,
  step: PropTypes.number,
  updatePlot: PropTypes.func,
  attr2: PropTypes.any,
  percentage: PropTypes.bool,
  ...Field.propTypes,
};

UnconnectedDualNumericFraction.contextTypes = {
  fullContainer: PropTypes.object,
};

UnconnectedDualNumericFraction.displayName = 'UnconnectedDualNumericFraction';

export default connectToContainer(UnconnectedDualNumericFraction);
