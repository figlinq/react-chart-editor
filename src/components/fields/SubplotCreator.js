import Dropdown from './Dropdown';
import Info from './Info';
import PropTypes from 'prop-types';
import {EDITOR_ACTIONS, SUBPLOT_TO_ATTR, subplotName} from 'lib/constants';
import Button from '../widgets/Button';
import {PlusIcon} from '@figlinq/plotly-icons';
import {connectToContainer, traceTypeToAxisType, getSubplotTitle} from 'lib';
import {PlotlySection} from 'components';

const UnconnectedSingleSubplotCreator = (props, context) => {
  const canAddSubplot = () => {
    const currentAxisId = props.fullContainer[props.attr];
    const currentTraceIndex = props.fullContainer.index;
    return context.fullData.some(
      (d) => d.index !== currentTraceIndex && d[props.attr] === currentAxisId
    );
  };

  const addAndUpdateSubplot = () => {
    const {attr, layoutAttr, updateContainer} = props;
    const {
      fullLayout: {_subplots: subplots},
    } = context;
    const lastSubplotNumber =
      Number(
        subplots[layoutAttr][subplots[layoutAttr].length - 1].split(
          SUBPLOT_TO_ATTR[layoutAttr].layout
        )[1]
      ) || 1;

    updateContainer({
      [attr]: SUBPLOT_TO_ATTR[layoutAttr].layout + (lastSubplotNumber + 1),
    });
  };

  const updateSubplot = (update) => {
    const currentSubplotId = props.fullContainer[SUBPLOT_TO_ATTR[props.layoutAttr].data];
    let subplotToBeGarbageCollected = null;
    // When we select another subplot, make sure no unused axes are left
    if (
      currentSubplotId !== update &&
      !context.fullData.some(
        (trace) =>
          trace[SUBPLOT_TO_ATTR[props.layoutAttr].data] === currentSubplotId &&
          trace.index !== props.fullContainer.index
      )
    ) {
      subplotToBeGarbageCollected = currentSubplotId;
    }

    context.onUpdate({
      type: EDITOR_ACTIONS.UPDATE_TRACES,
      payload: {
        subplotToBeGarbageCollected,
        update: {
          [props.attr]: update,
        },
        traceIndexes: [props.fullContainer.index],
      },
    });
  };

  const icon = <PlusIcon />;
  const extraComponent = canAddSubplot() ? (
    <Button variant="no-text" icon={icon} onClick={() => addAndUpdateSubplot()} />
  ) : (
    <Button variant="no-text--disabled" icon={icon} onClick={() => {}} />
  );

  return (
    <Dropdown
      label={props.label}
      attr={props.attr}
      clearable={false}
      options={props.options}
      updatePlot={(u) => updateSubplot(u)}
      extraComponent={extraComponent}
    />
  );
};
UnconnectedSingleSubplotCreator.propTypes = {
  attr: PropTypes.string,
  layoutAttr: PropTypes.string,
  label: PropTypes.string,
  options: PropTypes.array,
  container: PropTypes.object,
  fullContainer: PropTypes.object,
  updateContainer: PropTypes.func,
};

UnconnectedSingleSubplotCreator.contextTypes = {
  fullLayout: PropTypes.object,
  data: PropTypes.array,
  fullData: PropTypes.array,
  onUpdate: PropTypes.func,
};

const SingleSubplotCreator = connectToContainer(UnconnectedSingleSubplotCreator);

const UnconnectedSubplotCreator = (props, context) => {
  const subplotType = traceTypeToAxisType(props.container.type);

  if (!['geo', 'mapbox', 'polar', 'gl3d', 'ternary'].some((t) => t === subplotType)) {
    return null;
  }

  const isFirstTraceOfAxisType =
    context.data.filter((d) => traceTypeToAxisType(d.type) === subplotType).length === 1;

  if (isFirstTraceOfAxisType) {
    return null;
  }

  const {fullLayout, localize: _} = context;

  const getOptions = (subplotType) =>
    fullLayout._subplots[subplotType].map((subplotId) => ({
      label: getSubplotTitle(subplotId, subplotType, _),
      value: subplotId,
    }));

  return (
    <PlotlySection name={_('Subplots to Use')}>
      <SingleSubplotCreator
        attr={SUBPLOT_TO_ATTR[subplotType].data}
        layoutAttr={subplotType}
        label={subplotName(SUBPLOT_TO_ATTR[subplotType].layout, _)}
        options={getOptions(subplotType)}
      />
      <Info>
        {_('You can style and position your subplots in the ')}
        <a onClick={() => context.setPanel('Structure', 'Subplots')}>{_('Subplots')}</a>
        {_(' panel.')}
      </Info>
    </PlotlySection>
  );
};

UnconnectedSubplotCreator.propTypes = {
  container: PropTypes.object,
  fullContainer: PropTypes.object,
};

UnconnectedSubplotCreator.contextTypes = {
  data: PropTypes.array,
  fullData: PropTypes.array,
  fullLayout: PropTypes.object,
  localize: PropTypes.func,
  setPanel: PropTypes.func,
};

export default connectToContainer(UnconnectedSubplotCreator, {
  modifyPlotProps: (props, context, plotProps) => {
    const {data} = context;
    const {fullContainer} = plotProps;

    plotProps.isVisible =
      data.length > 1 &&
      data[fullContainer.index] &&
      ['geo', 'mapbox', 'polar', 'gl3d', 'ternary'].some(
        (t) => t === traceTypeToAxisType(data[fullContainer.index].type)
      );
  },
});
