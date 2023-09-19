import {mdiChartLine} from '@mdi/js';
import Icon from '@mdi/react';
import PropTypes from 'prop-types';
import {bem} from 'lib';

export const PanelMessage = ({children, heading, icon: PlotlyIcon}) => (
  <div className="panel__empty__message">
    <div className="panel__empty__message__icon">
      {PlotlyIcon ? <PlotlyIcon /> : <Icon path={mdiChartLine} size="24px" />}
    </div>
    {Boolean(heading) && <div className="panel__empty__message__heading">{heading}</div>}
    <div className="panel__empty__message__content">{children}</div>
  </div>
);

PanelMessage.propTypes = {
  heading: PropTypes.string,
  children: PropTypes.node,
  icon: PropTypes.node,
};

const PanelEmpty = (props, context) => (
  <div className={bem('panel', 'empty')}>
    {context?.customConfig?.panelTopItem || null}
    <PanelMessage {...props} />
  </div>
);

PanelEmpty.propTypes = {
  heading: PropTypes.string,
  children: PropTypes.node,
  icon: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

PanelEmpty.contextTypes = {
  customConfig: PropTypes.object,
};

export default PanelEmpty;
