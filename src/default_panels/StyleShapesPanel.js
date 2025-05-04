import PropTypes from 'prop-types';
import {
  ShapeAccordion,
  Radio,
  PlotlySection,
  PositioningRef,
  PositioningNumeric,
  Numeric,
  NumericFraction,
  ColorPicker,
  LineDashSelector,
  TextEditor,
  Dropdown,
  FontSelector,
} from '../components';

const StyleShapesPanel = (props, {localize: _}) => (
  <ShapeAccordion canAdd canReorder>
    <Radio
      attr="visible"
      options={[
        {label: _('Show'), value: true},
        {label: _('Hide'), value: false},
      ]}
    />
    <Radio
      attr="type"
      options={[
        {label: _('Line'), value: 'line'},
        {label: _('Rectangle'), value: 'rect'},
        {label: _('Ellipse'), value: 'circle'},
      ]}
    />

    <PlotlySection name={_('Horizontal Boundaries')}>
      <PositioningRef label={_('Relative to')} attr="xref" />
      <PositioningNumeric label={_('Start Point')} attr="x0" />
      <PositioningNumeric label={_('End Point')} attr="x1" />
    </PlotlySection>

    <PlotlySection name={_('Vertical Boundaries')}>
      <PositioningRef label={_('Relative to')} attr="yref" />
      <PositioningNumeric label={_('Start Point')} attr="y0" />
      <PositioningNumeric label={_('End Point')} attr="y1" />
    </PlotlySection>
    <PlotlySection name={_('Lines')}>
      <Numeric label={_('Width')} attr="line.width" />
      <ColorPicker label={_('Color')} attr="line.color" />
      <LineDashSelector label={_('Type')} attr="line.dash" />
    </PlotlySection>
    <PlotlySection name={_('Fill')}>
      <ColorPicker label={_('Color')} attr="fillcolor" />
      <NumericFraction label={_('Opacity')} attr="opacity" />
    </PlotlySection>
    <PlotlySection name={_('Label')}>
      <TextEditor label={_('Text')} attr="label.text" />
      <Numeric label={_('Font Size')} attr="label.text.font.size" />
      <ColorPicker label={_('Font Color')} attr="label.font.color" />
      <FontSelector label={_('Typeface')} attr="label.font.family" />
      <Numeric label={_('Padding')} attr="label.padding" />
      <Dropdown
        label={_('X Anchor')}
        attr="label.xanchor"
        options={[
          {label: _('Left'), value: 'left'},
          {label: _('Center'), value: 'center'},
          {label: _('Right'), value: 'right'},
        ]}
      />
      <Dropdown
        label={_('Y Anchor')}
        attr="label.yanchor"
        options={[
          {label: _('Top'), value: 'top'},
          {label: _('Middle'), value: 'middle'},
          {label: _('Bottom'), value: 'bottom'},
        ]}
      />
      <Numeric label={_('Rotation')} attr="label.textangle" />
    </PlotlySection>
  </ShapeAccordion>
);

StyleShapesPanel.contextTypes = {
  localize: PropTypes.func,
};

export default StyleShapesPanel;
