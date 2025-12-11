import PlotlySection from './PlotlySection';
import {Component} from 'react';
import PropTypes from 'prop-types';
import EditorContext from 'lib/EditorContext';

class TraceMarkerSection extends Component {
  constructor(props, context) {
    super(props, context);
    this.setLocals(context);
  }

  setLocals(context) {
    const _ = this.context.localize;
    const traceType = context.fullContainer.type;
    if (['bar', 'histogram', 'funnel', 'waterfall'].includes(traceType)) {
      this.name = _('Bars');
    } else if (['funnelarea', 'pie', 'sunburst', 'treemap'].includes(traceType)) {
      this.name = _('Segments');
    } else {
      this.name = _('Points');
    }
  }

  render() {
    this.setLocals(this.context);
    return <PlotlySection name={this.name}>{this.props.children}</PlotlySection>;
  }
}

TraceMarkerSection.propTypes = {
  children: PropTypes.node,
  name: PropTypes.string,
};

TraceMarkerSection.contextTypes = {
  fullContainer: PropTypes.object,
  localize: PropTypes.func,
};

TraceMarkerSection.contextType = EditorContext;

export default TraceMarkerSection;
