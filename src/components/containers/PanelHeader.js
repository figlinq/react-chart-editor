import Button from 'components/widgets/Button';
import PropTypes from 'prop-types';
import {useState} from 'react';
import {PlusIcon, ResizeUpIcon, ResizeDownIcon} from '@figlinq/plotly-icons';

const PanelHeader = ({children, addAction, allowCollapse, toggleFolds, hasOpen}, context) => {
  const [addPanelOpen, setAddPanelOpen] = useState(false);

  const togglePanel = () => {
    setAddPanelOpen(!addPanelOpen);
  };

  const {localize: _} = context;

  // dropdown is styled with same styles as react-select component - see _dropdown.scss
  return !children && !addAction && !allowCollapse ? null : (
    <div className="panel__header">
      {children && children.length ? (
        <div className="panel__header__content">{children}</div>
      ) : null}
      <div className="panel__header__actions__container">
        {allowCollapse && (
          <div className="panel__header__collapse" onClick={toggleFolds}>
            {hasOpen ? (
              <span>
                <ResizeDownIcon />
                {_('Collapse All')}
              </span>
            ) : (
              <span>
                <ResizeUpIcon />
                {_('Expand All')}
              </span>
            )}
          </div>
        )}

        {Boolean(addAction) && (
          <div className="panel__header__action dropdown-container">
            <Button
              variant="primary"
              className="js-add-button"
              onClick={
                Array.isArray(addAction.handler) ? togglePanel : () => addAction.handler(context)
              }
              icon={<PlusIcon />}
              label={addAction.label}
            />
            {addPanelOpen && (
              <div className="Select">
                <div className="Select-menu-outer">
                  <div className="Select-menu">
                    {addAction.handler.map(({label, handler}) => (
                      <div
                        className="Select-option"
                        key={label}
                        onClick={() => {
                          handler(context);
                          togglePanel();
                        }}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

PanelHeader.contextTypes = {
  layout: PropTypes.object,
  fullContainer: PropTypes.object,
  onUpdate: PropTypes.func,
  updateContainer: PropTypes.func,
  localize: PropTypes.func,
};

PanelHeader.propTypes = {
  addAction: PropTypes.object,
  allowCollapse: PropTypes.bool,
  children: PropTypes.node,
  hasOpen: PropTypes.bool,
  toggleFolds: PropTypes.func,
};

export default PanelHeader;
