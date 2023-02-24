import PropTypes from 'prop-types';
import {bem} from 'lib';

const SidebarItem = (props) => {
  const {onClick, label, active} = props;
  return (
    <div onClick={onClick} className={bem('sidebar__item', [active ? 'is-active' : ''])}>
      <div className={bem('sidebar__item', 'wrapper')}>
        <div className={bem('sidebar__item', 'label')}>{label}</div>
      </div>
    </div>
  );
};

export default SidebarItem;

SidebarItem.propTypes = {
  active: PropTypes.bool,
  label: PropTypes.string,
  onClick: PropTypes.func,
};
