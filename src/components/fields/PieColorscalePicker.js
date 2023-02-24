import ColorscalePickerWidget from '../widgets/ColorscalePicker';
import Field from './Field';
import PropTypes from 'prop-types';
import {connectToContainer, adjustColorscale} from 'lib';

const UnconnectedPieColorscalePicker = (props, context) => {
  const onUpdate = (colorscale, colorscaleType) => {
    if (Array.isArray(colorscale)) {
      const numPieSlices = context.graphDiv.calcdata[0].length + 1;
      const adjustedColorscale = adjustColorscale(colorscale, numPieSlices, colorscaleType, {
        repeat: true,
      });
      props.updatePlot(adjustedColorscale);
    }
  };

  const colorscale = Array.isArray(props.fullValue) ? props.fullValue : null;

  return (
    <Field {...props}>
      <ColorscalePickerWidget
        selected={colorscale}
        onColorscaleChange={onUpdate}
        initialCategory="categorical"
      />
    </Field>
  );
};

UnconnectedPieColorscalePicker.propTypes = {
  fullValue: PropTypes.any,
  updatePlot: PropTypes.func,
  ...Field.propTypes,
};

UnconnectedPieColorscalePicker.contextTypes = {
  container: PropTypes.object,
  graphDiv: PropTypes.object,
};

UnconnectedPieColorscalePicker.displayName = 'UnconnectedPieColorscalePicker';

export default connectToContainer(UnconnectedPieColorscalePicker, {
  modifyPlotProps: (props, context, plotProps) => {
    if (
      context &&
      context.container &&
      context.graphDiv &&
      (!plotProps.fullValue ||
        (Array.isArray(plotProps.fullValue) && !plotProps.fullValue.length)) &&
      context.graphDiv.calcdata
    ) {
      plotProps.fullValue = context.graphDiv.calcdata[0].map((d) => d.color);
    }

    if (context.traceIndexes.length > 1) {
      plotProps.isVisible = false;
    }
  },
});
