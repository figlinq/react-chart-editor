import {Component} from 'react';
import PropTypes from 'prop-types';
import {getDisplayName} from '../lib';
import EditorContext from './EditorContext';

export default function connectUpdateMenuToLayout(WrappedComponent) {
  class UpdateMenuConnectedComponent extends Component {
    constructor(props, context) {
      super(props, context);
      this.updateUpdateMenu = this.updateUpdateMenu.bind(this);
      this.setLocals(props, context);
    }

    setLocals(props, context) {
      const {updateMenuIndex} = props;
      const {container, fullContainer} = context;

      const updatemenus = container.updatemenus || [];
      const fullUpdateMenus = fullContainer.updatemenus || [];
      this.container = updatemenus[updateMenuIndex];
      this.fullContainer = fullUpdateMenus[updateMenuIndex];
    }

    getChildContext() {
      this.setLocals(this.props, this.context);
      return {
        getValObject: (attr) =>
          !this.context.getValObject ? null : this.context.getValObject(`updatemenus[].${attr}`),
        updateContainer: this.updateUpdateMenu,
        container: this.container,
        fullContainer: this.fullContainer,
      };
    }

    updateUpdateMenu(update) {
      const newUpdate = {};
      const {updateMenuIndex} = this.props;
      for (const key in update) {
        const newkey = `updatemenus[${updateMenuIndex}].${key}`;
        newUpdate[newkey] = update[key];
      }
      this.context.updateContainer(newUpdate);
    }

    render() {
      this.setLocals(this.props, this.context);
      const contextValue = {
        ...this.context,
        ...this.getChildContext(),
      };

      return (
        <EditorContext.Provider value={contextValue}>
          <WrappedComponent {...this.props} />
        </EditorContext.Provider>
      );
    }
  }

  UpdateMenuConnectedComponent.displayName = `UpdateMenuConnected${getDisplayName(
    WrappedComponent
  )}`;

  UpdateMenuConnectedComponent.propTypes = {
    updateMenuIndex: PropTypes.number.isRequired,
  };

  UpdateMenuConnectedComponent.contextTypes = {
    container: PropTypes.object,
    fullContainer: PropTypes.object,
    onUpdate: PropTypes.func,
    updateContainer: PropTypes.func,
    getValObject: PropTypes.func,
  };

  UpdateMenuConnectedComponent.childContextTypes = {
    updateContainer: PropTypes.func,
    container: PropTypes.object,
    fullContainer: PropTypes.object,
    getValObject: PropTypes.func,
  };

  const {plotly_editor_traits} = WrappedComponent;
  UpdateMenuConnectedComponent.plotly_editor_traits = plotly_editor_traits;

  return UpdateMenuConnectedComponent;
}
