import PropTypes from 'prop-types';
import {ChartLineIcon} from '@figlinq/plotly-icons';
import {bem} from 'lib';

export const PanelMessage = (props) => {
  const {children, icon: Icon} = props;
  const heading = props.heading || '';
  return (
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
};

PanelMessage.defaultProps = {
  icon: ChartLineIcon,
};

PanelMessage.propTypes = {
  heading: PropTypes.string,
  children: PropTypes.node,
  icon: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

const PanelEmpty = (props) => (
  <div className={bem('panel', 'empty')}>
    <PanelMessage {...props} />
  </div>
);

PanelEmpty.propTypes = {
  heading: PropTypes.string,
  children: PropTypes.node,
  icon: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export default PanelEmpty;
