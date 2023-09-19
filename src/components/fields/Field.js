import {mdiClose} from '@mdi/js';
import Icon from '@mdi/react';
import PropTypes from 'prop-types';
import MenuPanel from '../containers/MenuPanel';
import classnames from 'classnames';
import {bem} from 'lib';
import {getMultiValueText} from 'lib/constants';

export const FieldDelete = ({onClick}) => (
  <div className="field__delete" onClick={onClick}>
    <Icon path={mdiClose} />
  </div>
);

const Field = (
  {
    center,
    children,
    label,
    multiValued,
    suppressMultiValuedMessage,
    units,
    extraComponent,
    fieldContainerClassName,
    labelWidth,
  },
  {attr, description, showFieldTooltips, localize: _}
) => {
  const fieldClass = !label
    ? classnames('field__no-title', {
        'field__no-title--center': center,
      })
    : classnames('field__widget', {
        'field__widget--units': Boolean(units),
      });

  const tooltip = description
    ? `${attr} – ${description.replace(/`/g, '"').replace(/\*/g, '"')}`
    : attr;

  const containerClassName = classnames(bem('field'), {
    [fieldContainerClassName]: Boolean(fieldContainerClassName),
  });
  return (
    <div className={containerClassName}>
      {Boolean(label) && (
        <div
          className={bem('field', 'title')}
          style={labelWidth ? {minWidth: labelWidth + 'px'} : {}}
        >
          {showFieldTooltips ? (
            <div
              className={bem('field', 'title-text')}
              aria-label={tooltip}
              data-microtip-position="bottom-right"
              data-microtip-size="large"
              role="tooltip"
            >
              {label}
            </div>
          ) : (
            <div className={bem('field', 'title-text')}>{label}</div>
          )}
        </div>
      )}
      <div className={fieldClass}>
        {children}
        {extraComponent || null}
        {multiValued && !suppressMultiValuedMessage && (
          <MenuPanel label={getMultiValueText('title', _)} ownline question>
            <div className="info__title">{getMultiValueText('title', _)}</div>
            <div className="info__text">{getMultiValueText('text', _)}</div>
            <div className="info__sub-text">{getMultiValueText('subText', _)}</div>
          </MenuPanel>
        )}
      </div>
      {Boolean(units) && (
        <div className={bem('field', 'units')}>
          <div className={bem('field', 'units-text')}>{units}</div>
        </div>
      )}
    </div>
  );
};

Field.propTypes = {
  labelWidth: PropTypes.number,
  center: PropTypes.bool,
  label: PropTypes.any,
  units: PropTypes.string,
  multiValued: PropTypes.bool,
  suppressMultiValuedMessage: PropTypes.bool,
  children: PropTypes.node,
  extraComponent: PropTypes.any,
  fieldContainerClassName: PropTypes.string,
};

Field.contextTypes = {
  localize: PropTypes.func,
  description: PropTypes.string,
  attr: PropTypes.string,
  showFieldTooltips: PropTypes.bool,
};

Field.defaultProps = {
  center: false,
  multiValued: false,
};

FieldDelete.propTypes = {
  onClick: PropTypes.func,
};
export default Field;
