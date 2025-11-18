import PlotlyPanel from './PlotlyPanel';
import PlotlySection from './PlotlySection';
import PropTypes from 'prop-types';

import {
  connectLayoutToPlot,
  containerConnectedContextTypes,
  plotlyTraceToCustomTrace,
} from 'lib';

const LayoutPanel = connectLayoutToPlot(PlotlyPanel);
const LayoutSection = connectLayoutToPlot(PlotlySection);

const TraceTypeSection = (props, context) => {
  const {fullContainer, fullData} = context;
  const {mode, traceTypes, excludeCustomTypes = []} = props;

  const customContainerType = fullContainer
    ? plotlyTraceToCustomTrace(fullContainer)
    : null;

  const matchesTraceType = (candidate) =>
    candidate && (traceTypes || []).includes(candidate);

  const customExcluded = customContainerType && excludeCustomTypes.includes(customContainerType);

  const ifConnectedToTrace =
    mode === 'trace' &&
    fullContainer &&
    !customExcluded &&
    (matchesTraceType(fullContainer.type) || matchesTraceType(customContainerType));

  const ifConnectedToLayout =
    mode === 'layout' &&
    fullData &&
    fullData.some((t) => matchesTraceType(t.type) || matchesTraceType(plotlyTraceToCustomTrace(t)));

  if (ifConnectedToTrace || ifConnectedToLayout) {
    return <PlotlySection {...props} />;
  }

  return null;
};

TraceTypeSection.contextTypes = containerConnectedContextTypes;
TraceTypeSection.propTypes = {
  children: PropTypes.node,
  name: PropTypes.string,
  traceTypes: PropTypes.array,
  mode: PropTypes.string,
  excludeCustomTypes: PropTypes.array,
};

TraceTypeSection.defaultProps = {
  traceTypes: [],
  mode: 'layout',
  excludeCustomTypes: [],
};

export {LayoutPanel, LayoutSection, TraceTypeSection};
