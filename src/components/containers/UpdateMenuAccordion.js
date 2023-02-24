import PlotlyFold from './PlotlyFold';
import TraceRequiredPanel from './TraceRequiredPanel';
import PropTypes from 'prop-types';
import {connectUpdateMenuToLayout} from 'lib';

const UpdateMenuFold = connectUpdateMenuToLayout(PlotlyFold);

const UpdateMenuAccordion = ({children}, {fullLayout: {updatemenus = []}, localize: _}) => (
  <TraceRequiredPanel>
    {(updatemenus.length > 0 &&
      updatemenus.map((upd, i) => {
        const localizedType = {
          dropdown: _('Dropdown'),
          buttons: _('Buttons'),
        };
        const menuType = localizedType[upd.type] || localizedType.dropdown;
        const activeBtn = upd.buttons.filter((b) => b._index === upd.active)[0];
        const foldName = menuType + (activeBtn ? ': ' + activeBtn.label : '');
        return (
          <UpdateMenuFold key={i} updateMenuIndex={i} name={foldName}>
            {children}
          </UpdateMenuFold>
        );
      })) ||
      null}
  </TraceRequiredPanel>
);

UpdateMenuAccordion.contextTypes = {
  fullLayout: PropTypes.object,
  localize: PropTypes.func,
};

UpdateMenuAccordion.propTypes = {
  children: PropTypes.node,
};

export default UpdateMenuAccordion;
