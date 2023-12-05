import PropTypes from 'prop-types';

const Logo = ({link, src}) => {
  const image = <img className="sidebar__logo" src={src} />;
  return link ? <a href={link}>{image}</a> : image;
};

export default Logo;

Logo.plotly_editor_traits = {sidebar_element: true};

Logo.propTypes = {
  link: PropTypes.string,
  src: PropTypes.string,
};
