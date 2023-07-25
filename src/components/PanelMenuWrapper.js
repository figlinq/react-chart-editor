import PropTypes from 'prop-types';
import {Children, cloneElement, Component} from 'react';
import SidebarGroup from './sidebar/SidebarGroup';
import {bem} from 'lib';
import sortMenu from 'lib/sortMenu';
import {Button} from './widgets';

class PanelMenuWrapper extends Component {
  constructor(props) {
    super(props);

    const opts = this.computeMenuOptions(props.children, props.menuPanelOrder);
    const firstSidebarGroup = opts.filter((o) => o.panels)[0];

    this.state = {
      group: firstSidebarGroup.name,
      panel: firstSidebarGroup.panels[0],
    };

    this.setPanel = this.setPanel.bind(this);
    this.renderSection = this.renderSection.bind(this);
  }

  setPanel(group, panel) {
    this.setState({group, panel});
  }

  getChildContext() {
    return {
      setPanel: this.setPanel,
    };
  }

  renderSection(section, i) {
    return section.type && (section.type.plotly_editor_traits || {}).sidebar_element ? (
      cloneElement(section, {key: i})
    ) : (
      <SidebarGroup
        key={i}
        selectedGroup={this.state.group}
        selectedPanel={this.state.panel}
        group={section.name}
        panels={section.panels}
        onChangeGroup={this.setPanel}
      />
    );
  }

  computeMenuOptions(children, menuPanelOrder) {
    const sections = [];
    const groupLookup = {};
    let groupIndex;
    const childrenArray = sortMenu(Children.toArray(children), menuPanelOrder);

    childrenArray.forEach((child) => {
      if (!child) {
        return;
      }
      const group = child.props.group;
      const name = child.props.name;

      if (group && name) {
        let obj;
        if (groupLookup.hasOwnProperty(group)) {
          groupIndex = groupLookup[group];
          obj = sections[groupIndex];
        } else {
          groupLookup[group] = sections.length;
          obj = {name: group, panels: []};
          sections.push(obj);
        }
        obj.panels.push(name);
      }

      if ((child.type.plotly_editor_traits || {}).sidebar_element) {
        sections.push(child);
      }
    });

    return sections;
  }

  render() {
    const {children, menuPanelOrder} = this.props;
    const {showUndoRedo, undo, redo} = this.context;
    const menuOpts = this.computeMenuOptions(children, menuPanelOrder);

    return (
      <div className={bem('editor_controls', 'wrapper')}>
        <div className={bem('sidebar')}>
          {showUndoRedo && (
            <div className={bem('sidebar', 'buttons')}>
              <Button label="Undo" onClick={() => undo()} />
              <Button label="Redo" onClick={redo} />
            </div>
          )}
          {menuOpts.map(this.renderSection)}
        </div>
        {Children.map(this.props.children, (child, i) =>
          child === null ||
          this.state.group !== child.props.group ||
          this.state.panel !== child.props.name
            ? null
            : cloneElement(child, {key: i})
        )}
      </div>
    );
  }
}

PanelMenuWrapper.propTypes = {
  children: PropTypes.node,
  menuPanelOrder: PropTypes.array,
};

PanelMenuWrapper.childContextTypes = {
  setPanel: PropTypes.func,
};

PanelMenuWrapper.contextTypes = {
  showUndoRedo: PropTypes.bool,
  undo: PropTypes.func,
  redo: PropTypes.func,
};

export default PanelMenuWrapper;
