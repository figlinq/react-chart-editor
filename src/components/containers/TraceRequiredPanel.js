import PanelEmpty from './PanelEmpty';
import PropTypes from 'prop-types';
import {LayoutPanel} from './derived';

const TraceRequiredPanel = (props, context) => {
  const {localize: _} = context;
  const {children, ...rest} = props;

  const hasTrace = () => context.fullData.filter((trace) => trace.visible).length > 0;

  if (!props.visible) {
    return null;
  }

  return hasTrace() ? (
    <LayoutPanel {...rest}>{children}</LayoutPanel>
  ) : (
    <PanelEmpty heading={_("Looks like there aren't any traces defined yet.")}>
      <p>
        {_('Go to the ')}
        <a onClick={() => context.setPanel('Structure', 'Traces')}>{_('Traces')}</a>
        {_(' panel under Structure to define traces.')}
      </p>
    </PanelEmpty>
  );
};

TraceRequiredPanel.propTypes = {
  children: PropTypes.node,
  visible: PropTypes.bool,
};

TraceRequiredPanel.defaultProps = {
  visible: true,
};

TraceRequiredPanel.contextTypes = {
  fullData: PropTypes.array,
  localize: PropTypes.func,
  setPanel: PropTypes.func,
};

export default TraceRequiredPanel;
