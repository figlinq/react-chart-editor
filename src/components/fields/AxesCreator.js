import Dropdown from './Dropdown';
import Info from './Info';
import PropTypes from 'prop-types';
import {EDITOR_ACTIONS} from 'lib/constants';
import Button from '../widgets/Button';
import {PlusIcon} from '@figlinq/plotly-icons';
import {
  connectToContainer,
  traceTypeToAxisType,
  getAxisTitle,
  axisIdToAxisName,
  getParsedTemplateString,
} from 'lib';
import {PlotlySection} from 'components';

const UnconnectedAxisCreator = (props, context) => {
  const canAddAxis = () => {
    const currentAxisId = props.fullContainer[props.attr];
    const currentTraceIndex = props.fullContainer.index;
    return context.fullData.some(
      (d) => d.index !== currentTraceIndex && d[props.attr] === currentAxisId
    );
  };

  const addAndUpdateAxis = () => {
    const {attr, updateContainer} = props;
    const {
      onUpdate,
      fullLayout: {_subplots: subplots},
    } = context;
    const lastAxisNumber = Number(subplots[attr][subplots[attr].length - 1].charAt(1)) || 1;

    updateContainer({
      [attr]: attr.charAt(0) + (lastAxisNumber + 1),
    });

    let side = null;
    if (attr === 'yaxis') {
      side = 'right';
    } else if (attr === 'xaxis') {
      side = 'top';
    }

    onUpdate({
      type: EDITOR_ACTIONS.UPDATE_LAYOUT,
      payload: {
        update: {
          [`${attr + (lastAxisNumber + 1)}.side`]: side,
          [`${attr + (lastAxisNumber + 1)}.overlaying`]: !(attr === 'yaxis' || attr === 'xaxis')
            ? null
            : subplots[attr][subplots[attr].length - 1],
        },
      },
    });
  };

  const updateAxis = (update) => {
    const currentAxisId = props.fullContainer[props.attr];
    const axesToBeGarbageCollected = [];

    // When we select another axis, make sure no unused axes are left
    if (
      currentAxisId !== update &&
      !context.fullData.some(
        (trace) => trace[props.attr] === currentAxisId && trace.index !== props.fullContainer.index
      )
    ) {
      axesToBeGarbageCollected.push(currentAxisId);
    }

    context.onUpdate({
      type: EDITOR_ACTIONS.UPDATE_TRACES,
      payload: {
        axesToBeGarbageCollected,
        update: {
          [props.attr]: update,
        },
        traceIndexes: [props.fullContainer.index],
      },
    });
  };

  const extraComponent = canAddAxis() ? (
    <Button variant="no-text" icon={<PlusIcon />} onClick={() => addAndUpdateAxis()} />
  ) : (
    <Button variant="no-text--disabled" icon={<PlusIcon />} onClick={() => {}} />
  );

  return (
    <Dropdown
      label={props.label}
      attr={props.attr}
      clearable={false}
      options={props.options}
      updatePlot={(u) => updateAxis(u)}
      extraComponent={extraComponent}
    />
  );
};

UnconnectedAxisCreator.propTypes = {
  attr: PropTypes.string,
  label: PropTypes.string,
  options: PropTypes.array,
  container: PropTypes.object,
  fullContainer: PropTypes.object,
  updateContainer: PropTypes.func,
};

UnconnectedAxisCreator.contextTypes = {
  fullLayout: PropTypes.object,
  data: PropTypes.array,
  fullData: PropTypes.array,
  onUpdate: PropTypes.func,
};

const AxisCreator = connectToContainer(UnconnectedAxisCreator);

const UnconnectedAxesCreator = ({container}, {data, fullLayout, setPanel, localize: _}) => {
  const axisType = traceTypeToAxisType(container.type);
  const isFirstTraceOfAxisType =
    data.filter((d) => traceTypeToAxisType(d.type) === axisType).length === 1;

  if (isFirstTraceOfAxisType) {
    return null;
  }

  const controls = [];

  const getOptions = (axisType) =>
    fullLayout._subplots[axisType].map((axisId) => ({
      label: getParsedTemplateString(getAxisTitle(fullLayout[axisIdToAxisName(axisId)]), {
        meta: fullLayout.meta,
      }),
      value: axisId,
    }));

  if (axisType === 'cartesian') {
    ['xaxis', 'yaxis'].forEach((type, index) => {
      controls.push(
        <AxisCreator
          key={index}
          attr={type}
          label={type.charAt(0).toUpperCase() + _(' Axis')}
          options={getOptions(type)}
        />
      );
    });
  }

  return (
    <PlotlySection name={_('Axes to Use')}>
      {controls}
      <Info>
        {_('You can style and position your axes in the ')}
        <a onClick={() => setPanel('Structure', 'Subplots')}>{_('Subplots')}</a>
        {_(' panel.')}
      </Info>
    </PlotlySection>
  );
};

UnconnectedAxesCreator.propTypes = {
  container: PropTypes.object,
};

UnconnectedAxesCreator.contextTypes = {
  data: PropTypes.array,
  fullData: PropTypes.array,
  fullLayout: PropTypes.object,
  localize: PropTypes.func,
  setPanel: PropTypes.func,
};

export default connectToContainer(UnconnectedAxesCreator, {
  modifyPlotProps: (props, context, plotProps) => {
    const {data} = context;
    const {fullContainer} = plotProps;

    plotProps.isVisible =
      data.length > 1 &&
      data[fullContainer.index] &&
      traceTypeToAxisType(data[fullContainer.index].type) === 'cartesian';
  },
});
