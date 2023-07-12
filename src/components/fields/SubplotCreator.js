import {mdiPlus} from '@mdi/js';
import Dropdown from './Dropdown';
import Info from './Info';
import PropTypes from 'prop-types';
import {EDITOR_ACTIONS, SUBPLOT_TO_ATTR, subplotName} from 'lib/constants';
import Button from '../widgets/Button';
import {connectToContainer, traceTypeToAxisType, getSubplotTitle} from 'lib';
import {PlotlySection} from 'components';

const UnconnectedSingleSubplotCreator = (
  {attr, label, layoutAttr, fullContainer, updateContainer, options},
  {fullData, fullLayout: {_subplots: subplots}, onUpdate}
) => {
  const canAddSubplot = () => {
    const currentAxisId = fullContainer[attr];
    const currentTraceIndex = fullContainer.index;
    return fullData.some((d) => d.index !== currentTraceIndex && d[attr] === currentAxisId);
  };

  const addAndUpdateSubplot = () => {
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
    const currentSubplotId = fullContainer[SUBPLOT_TO_ATTR[layoutAttr].data];
    // When we select another subplot, make sure no unused axes are left
    const subplotToBeGarbageCollected =
      currentSubplotId !== update &&
      !fullData.some(
        (trace) =>
          trace[SUBPLOT_TO_ATTR[layoutAttr].data] === currentSubplotId &&
          trace.index !== fullContainer.index
      )
        ? currentSubplotId
        : null;

    onUpdate({
      type: EDITOR_ACTIONS.UPDATE_TRACES,
      payload: {
        subplotToBeGarbageCollected,
        update: {[attr]: update},
        traceIndexes: [fullContainer.index],
      },
    });
  };

  const extraComponent = canAddSubplot() ? (
    <Button variant="no-text" icon={mdiPlus} onClick={() => addAndUpdateSubplot()} />
  ) : (
    <Button variant="no-text--disabled" icon={mdiPlus} onClick={() => {}} />
  );

  return (
    <Dropdown
      label={label}
      attr={attr}
      clearable={false}
      options={options}
      updatePlot={updateSubplot}
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
  fullData: PropTypes.array,
  onUpdate: PropTypes.func,
};

const SingleSubplotCreator = connectToContainer(UnconnectedSingleSubplotCreator);

const UnconnectedSubplotCreator = ({container}, {data, fullLayout, setPanel, localize: _}) => {
  const subplotType = traceTypeToAxisType(container.type);

  if (!['geo', 'mapbox', 'polar', 'gl3d', 'ternary'].some((t) => t === subplotType)) {
    return null;
  }

  const isFirstTraceOfAxisType =
    data.filter((d) => traceTypeToAxisType(d.type) === subplotType).length === 1;

  if (isFirstTraceOfAxisType) {
    return null;
  }

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
        <a onClick={() => setPanel('Structure', 'Subplots')}>{_('Subplots')}</a>
        {_(' panel.')}
      </Info>
    </PlotlySection>
  );
};

UnconnectedSubplotCreator.propTypes = {
  container: PropTypes.object,
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
