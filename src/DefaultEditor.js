import PropTypes from 'prop-types';
import {PanelMenuWrapper} from './components';
import {
  GraphCreatePanel,
  GraphTransformsPanel,
  GraphSubplotsPanel,
  StyleLayoutPanel,
  StyleAxesPanel,
  StyleMapsPanel,
  StyleLegendPanel,
  StyleNotesPanel,
  StyleShapesPanel,
  StyleSlidersPanel,
  StyleImagesPanel,
  StyleTracesPanel,
  StyleColorbarsPanel,
  StyleUpdateMenusPanel,
} from './default_panels';
import {traceHasColorbar} from './default_panels/StyleColorbarsPanel';
import Logo from './components/widgets/Logo';
import {TRANSFORMABLE_TRACES, TRACE_TO_AXIS} from './lib/constants';

const DefaultEditor = (props, context) => {
  const hasTransforms = () => context.fullData.some((d) => TRANSFORMABLE_TRACES.includes(d.type));

  const hasAxes = () =>
    Object.keys(context.fullLayout._subplots).filter(
      (type) =>
        !['cartesian', 'mapbox'].includes(type) && context.fullLayout._subplots[type].length > 0
    ).length > 0;

  const hasMenus = () => {
    const {
      fullLayout: {updatemenus = []},
    } = context;
    return updatemenus.length > 0;
  };

  const hasSliders = () => {
    const {
      layout: {sliders = []},
    } = context;
    return sliders.length > 0;
  };

  const hasColorbars = () => context.fullData.some((d) => traceHasColorbar({}, d));

  const hasLegend = () =>
    context.fullData.some((t) => t.showlegend !== undefined); /* eslint-disable-line no-undefined*/

  const hasMaps = () =>
    context.fullData.some((d) => [...TRACE_TO_AXIS.geo, ...TRACE_TO_AXIS.mapbox].includes(d.type));

  const _ = context.localize;
  const logo = props.logoSrc && <Logo src={props.logoSrc} />;

  return (
    <PanelMenuWrapper menuPanelOrder={props.menuPanelOrder}>
      {logo ? logo : null}
      <GraphCreatePanel group={_('Structure')} name={_('Traces')} />
      <GraphSubplotsPanel group={_('Structure')} name={_('Subplots')} />
      {hasTransforms() && <GraphTransformsPanel group={_('Structure')} name={_('Transforms')} />}
      <StyleLayoutPanel group={_('Style')} name={_('General')} collapsedOnStart />
      <StyleTracesPanel group={_('Style')} name={_('Traces')} />
      {hasAxes() && <StyleAxesPanel group={_('Style')} name={_('Axes')} collapsedOnStart />}
      {hasMaps() && <StyleMapsPanel group={_('Style')} name={_('Maps')} />}
      {hasLegend() && <StyleLegendPanel group={_('Style')} name={_('Legend')} />}
      {hasColorbars() && <StyleColorbarsPanel group={_('Style')} name={_('Color Bars')} />}
      <StyleNotesPanel group={_('Annotate')} name={_('Text')} />
      <StyleShapesPanel group={_('Annotate')} name={_('Shapes')} />
      <StyleImagesPanel group={_('Annotate')} name={_('Images')} />
      {hasSliders() && <StyleSlidersPanel group={_('Control')} name={_('Sliders')} />}
      {hasMenus() && <StyleUpdateMenusPanel group={_('Control')} name={_('Menus')} />}
      {props.children ? props.children : null}
    </PanelMenuWrapper>
  );
};

DefaultEditor.propTypes = {
  children: PropTypes.node,
  logoSrc: PropTypes.string,
  menuPanelOrder: PropTypes.array,
};

DefaultEditor.contextTypes = {
  localize: PropTypes.func,
  fullData: PropTypes.array,
  fullLayout: PropTypes.object,
  layout: PropTypes.object,
};

export default DefaultEditor;
