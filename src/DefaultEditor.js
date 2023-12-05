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

const DefaultEditor = (
  {logoSrc, logoLinkUrl, children, menuPanelOrder},
  {fullData, fullLayout, layout, localize: _}
) => {
  const hasTransforms = () => fullData.some((d) => TRANSFORMABLE_TRACES.includes(d.type));

  const hasAxes = () =>
    Object.keys(fullLayout._subplots).filter(
      (type) => !['cartesian', 'mapbox'].includes(type) && fullLayout._subplots[type].length > 0
    ).length > 0;

  const hasMenus = () => {
    const {updatemenus = []} = fullLayout;
    return updatemenus.length > 0;
  };

  const hasSliders = () => {
    const {sliders = []} = layout;
    return sliders.length > 0;
  };

  const hasColorbars = () => fullData.some((d) => traceHasColorbar({}, d));

  const hasLegend = () =>
    fullData.some((t) => t.showlegend !== undefined); /* eslint-disable-line no-undefined*/

  const hasMaps = () =>
    fullData.some((d) => [...TRACE_TO_AXIS.geo, ...TRACE_TO_AXIS.mapbox].includes(d.type));

  return (
    <PanelMenuWrapper menuPanelOrder={menuPanelOrder}>
      {Boolean(logoSrc) && <Logo src={logoSrc} link={logoLinkUrl} />}
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
      {children || null}
    </PanelMenuWrapper>
  );
};

DefaultEditor.propTypes = {
  children: PropTypes.node,
  logoSrc: PropTypes.string,
  logoLinkUrl: PropTypes.string,
  menuPanelOrder: PropTypes.array,
};

DefaultEditor.contextTypes = {
  localize: PropTypes.func,
  fullData: PropTypes.array,
  fullLayout: PropTypes.object,
  layout: PropTypes.object,
};

export default DefaultEditor;
