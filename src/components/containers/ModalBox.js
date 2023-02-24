import PropTypes from 'prop-types';
import classnames from 'classnames';

const ModalBox = ({backgroundDark, children, onClose, relative}) => {
  const modalboxClass = classnames('modalbox', {
    'modalbox--dark': backgroundDark,
    'modalbox--relative': relative,
  });
  return (
    <div className={modalboxClass}>
      <div className="modalbox__cover" onClick={onClose} />
      <div className="modalbox__content">{children}</div>
    </div>
  );
};

export default ModalBox;

ModalBox.propTypes = {
  backgroundDark: PropTypes.bool,
  relative: PropTypes.bool,
  children: PropTypes.node,
  onClose: PropTypes.func,
};
