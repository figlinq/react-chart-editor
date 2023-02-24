import PropTypes from 'prop-types';
import {ChartLineIcon} from '@figlinq/plotly-icons';
import {bem} from 'lib';

export const PanelMessage = ({children, heading, icon: Icon}) => (
  <div className="panel__empty__message">
    {Boolean(Icon) && (
      <div className="panel__empty__message__icon">
        <Icon />
      </div>
    )}
    {Boolean(heading) && <div className="panel__empty__message__heading">{heading}</div>}
    <div className="panel__empty__message__content">{children}</div>
  </div>
);

PanelMessage.defaultProps = {
  icon: ChartLineIcon,
};

PanelMessage.propTypes = {
  heading: PropTypes.string,
  children: PropTypes.node,
  icon: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
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
