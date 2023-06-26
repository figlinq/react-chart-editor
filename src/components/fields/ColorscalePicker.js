import ColorscalePickerWidget from '../widgets/ColorscalePicker';
import Field from './Field';
import PropTypes from 'prop-types';
import {connectToContainer} from 'lib';
import {EDITOR_ACTIONS} from 'lib/constants';

export const UnconnectedColorscalePicker = (props, context) => {
  const onUpdate = (colorscale, colorscaleType) => {
    if (Array.isArray(colorscale)) {
      props.updatePlot(
        colorscale.map((c, i) => {
          let step = i / (colorscale.length - 1);
          if (i === 0) {
            step = 0;
          }
          return [step, c];
        }),
        colorscaleType
      );
      context.onUpdate({
        type: EDITOR_ACTIONS.UPDATE_TRACES,
        payload: {
          update: {
            autocolorscale: false,
          },
          traceIndexes: [props.fullContainer.index],
        },
      });
    }
  };

  const {fullValue} = props;
  const colorscale = Array.isArray(fullValue) ? fullValue.map((v) => v[1]) : null;

  return (
    <Field {...props} fieldContainerClassName="field__colorscale">
      <ColorscalePickerWidget
        selected={colorscale}
        onColorscaleChange={onUpdate}
        initialCategory={props.initialCategory}
        disableCategorySwitch={props.disableCategorySwitch}
      />
    </Field>
  );
};

UnconnectedColorscalePicker.propTypes = {
  labelWidth: PropTypes.number,
  fullValue: PropTypes.any,
  fullContainer: PropTypes.object,
  updatePlot: PropTypes.func,
  initialCategory: PropTypes.string,
  ...Field.propTypes,
};

UnconnectedColorscalePicker.contextTypes = {
  onUpdate: PropTypes.func,
};

UnconnectedColorscalePicker.displayName = 'UnconnectedColorscalePicker';

export default connectToContainer(UnconnectedColorscalePicker);
