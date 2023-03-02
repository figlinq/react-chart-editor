import PropTypes from 'prop-types';

const FoldEmpty = ({children, icon: Icon, messagePrimary, messageSecondary}) => (
  <div className="fold__content__empty">
    {Boolean(Icon) && (
      <div className="fold__content__empty__icon">
        <Icon />
      </div>
    )}
    {Boolean(messagePrimary) && (
      <div className="fold__content__empty__message__primary">{messagePrimary}</div>
    )}
    {Boolean(messageSecondary) && (
      <div className="fold__content__empty__message__secondary">{messageSecondary}</div>
    )}
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
