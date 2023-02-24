import PlotlyFold from './PlotlyFold';
import TraceRequiredPanel from './TraceRequiredPanel';
import PropTypes from 'prop-types';
import {connectSliderToLayout} from 'lib';

const SliderFold = connectSliderToLayout(PlotlyFold);

const SliderAccordion = (props, context) => {
  const {
    layout: {sliders = []},
    localize: _,
  } = context;

  const content =
    sliders.length > 0 &&
    sliders.map((sli, i) => (
      <SliderFold key={i} sliderIndex={i} name={_('Slider') + ` ${i + 1}`}>
        {props.children}
      </SliderFold>
    ));

  return <TraceRequiredPanel>{content || null}</TraceRequiredPanel>;
};
SliderAccordion.contextTypes = {
  layout: PropTypes.object,
  localize: PropTypes.func,
};

SliderAccordion.propTypes = {
  children: PropTypes.node,
};

export default SliderAccordion;
