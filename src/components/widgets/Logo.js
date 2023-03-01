import PropTypes from 'prop-types';

const Logo = ({src}) => <img className="sidebar__logo" src={src} />;

export default Logo;

Logo.plotly_editor_traits = {sidebar_element: true};

Logo.propTypes = {
  src: PropTypes.string,
};
