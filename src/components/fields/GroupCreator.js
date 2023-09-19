import {mdiPlus} from '@mdi/js';
import {connectToContainer} from 'lib';
import Field from './Field';
import Dropdown from './Dropdown';
import PropTypes from 'prop-types';
import Button from '../widgets/Button';
import {MULTI_VALUED} from 'lib/constants';

const UnconnectedGroupCreator = (props, context) => {
  const getAllGroups = () =>
    [...new Set(context.data.map((t) => t[props.attr]))].filter((g) => Boolean(g));

  const canAddGroup = () => {
    const {fullContainer, attr} = props;
    const currentGroup = fullContainer[attr];
    const currentTraceIndex = fullContainer.index;

    if (fullContainer.index === MULTI_VALUED) {
      return getAllGroups().length === 0;
    }

    return (
      !currentGroup ||
      context.fullData.some((d) => d.index !== currentTraceIndex && d[attr] === currentGroup)
    );
  };

  const addAndUpdateGroup = () => {
    const allGroups = context.fullData
      .map((t) => parseInt(t[props.attr], 10))
      .filter((n) => Number.isInteger(n));
    // don't want to pass empty array to max
    allGroups.push(0);

    const lastGroupNumber = Math.max.apply(Math, allGroups);

    props.updatePlot(lastGroupNumber + 1);
  };

  const {localize: _} = context;
  const {attr, label, prefix, updatePlot} = props;

  const options = [
    {
      label: _('None'),
      value: '',
    },
  ];
  const allGroups = getAllGroups();
  allGroups.forEach((g) =>
    options.push({
      label: `${prefix} ${g}`,
      value: g,
    })
  );
  options.sort((a, b) => a.value - b.value);

  const addButton = canAddGroup() ? (
    <Button variant="no-text" icon={mdiPlus} onClick={() => addAndUpdateGroup()} />
  ) : (
    <Button variant="no-text--disabled" icon={mdiPlus} onClick={() => {}} />
  );

  return (
    <Dropdown
      label={label}
      attr={attr}
      clearable={false}
      options={options}
      updatePlot={updatePlot}
      extraComponent={addButton}
    />
  );
};

UnconnectedGroupCreator.propTypes = {
  attr: PropTypes.string,
  fullContainer: PropTypes.object,
  prefix: PropTypes.string,
  ...Field.propTypes,
};

UnconnectedGroupCreator.contextTypes = {
  localize: PropTypes.func,
  data: PropTypes.array,
  fullData: PropTypes.array,
};

UnconnectedGroupCreator.displayName = 'UnconnectedGroupCreator';

export default connectToContainer(UnconnectedGroupCreator);
