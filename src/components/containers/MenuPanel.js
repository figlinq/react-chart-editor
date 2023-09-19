import {mdiCog, mdiHelpCircle} from '@mdi/js';
import Icon from '@mdi/react';
import ModalBox from './ModalBox';
import PropTypes from 'prop-types';
import {useState} from 'react';
import classnames from 'classnames';

const MenuPanel = ({show, ownline, label, children, question, icon: PlotlyIcon}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = () => {
    if (question) {
      return {
        icon: <Icon path={mdiHelpCircle} className="menupanel__icon" />,
        spanClass: `menupanel__icon-span menupanel__icon-span--question`,
      };
    }
    if (PlotlyIcon) {
      return {
        icon: <PlotlyIcon className="menupanel__icon" />,
        spanClass: `menupanel__icon-span`,
      };
    }
    return {
      icon: <Icon Icon path={mdiCog} className="menupanel__icon" />,
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
