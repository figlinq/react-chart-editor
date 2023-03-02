import ModalBox from './ModalBox';
import PropTypes from 'prop-types';
import {useState} from 'react';
import classnames from 'classnames';
import {QuestionIcon, CogIcon} from '@figlinq/plotly-icons';

const MenuPanel = ({show, ownline, label, children, question, icon: Icon}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = () => {
    if (question) {
      return {
        icon: <QuestionIcon className="menupanel__icon" />,
        spanClass: `menupanel__icon-span menupanel__icon-span--question`,
      };
    }
    if (Icon) {
      return {
        icon: <Icon className="menupanel__icon" />,
        spanClass: `menupanel__icon-span`,
      };
    }
    return {
      icon: <CogIcon className="menupanel__icon" />,
      spanClass: 'menupanel__icon-span menupanel__icon-span--cog',
    };
  };

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const isModalOpen = show || isOpen;
  const containerClass = classnames('menupanel', {'menupanel--ownline': ownline});
  const {icon, spanClass} = getIcon();

  return (
    <div className={containerClass}>
      <div className={spanClass}>
        <div className="menupanel__label">{label}</div>
        <div className="menupanel__icon__wrapper" onClick={togglePanel}>
          {icon}
        </div>
      </div>
      {isModalOpen && <ModalBox onClose={togglePanel}>{children}</ModalBox>}
    </div>
  );
};

export default MenuPanel;

MenuPanel.propTypes = {
  children: PropTypes.node,
  icon: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  label: PropTypes.string,
  ownline: PropTypes.bool,
  question: PropTypes.bool,
  show: PropTypes.bool,
};
