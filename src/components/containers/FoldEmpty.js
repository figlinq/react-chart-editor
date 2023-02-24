import PropTypes from 'prop-types';

const FoldEmpty = ({children, icon: Icon, messagePrimary, messageSecondary}) => (
  <div className="fold__content__empty">
    {Icon ? (
      <div className="fold__content__empty__icon">
        <Icon />
      </div>
    ) : null}
    {messagePrimary ? (
      <div className="fold__content__empty__message__primary">{messagePrimary}</div>
    ) : null}
    {messageSecondary ? (
      <div className="fold__content__empty__message__secondary">{messageSecondary}</div>
    ) : null}
    {children || null}
  </div>
);

export default FoldEmpty;

FoldEmpty.propTypes = {
  messagePrimary: PropTypes.string,
  messageSecondary: PropTypes.string,
  children: PropTypes.node,
  icon: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};
