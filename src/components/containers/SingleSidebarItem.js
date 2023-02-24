import PropTypes from 'prop-types';

const SingleSidebarItem = ({children}) =>
  Boolean(children) && <div className="sidebar__item--single">{children}</div>;

export default SingleSidebarItem;

SingleSidebarItem.plotly_editor_traits = {sidebar_element: true};

SingleSidebarItem.propTypes = {
  children: PropTypes.any,
};
