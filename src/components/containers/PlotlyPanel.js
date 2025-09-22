import PanelHeader from './PanelHeader';
import PanelEmpty from './PanelEmpty';
import PropTypes from 'prop-types';
import {Children, Component, cloneElement} from 'react';
import update from 'immutability-helper';
import {bem} from 'lib';
import {EmbedIcon} from '@figlinq/plotly-icons';

export class Panel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      individualFoldStates: [],
      hasError: false,
    };
    this.toggleFolds = this.toggleFolds.bind(this);
    this.toggleFold = this.toggleFold.bind(this);
  }

  getChildContext() {
    return {
      deleteContainer: this.props.deleteAction || null,
    };
  }

  componentDidCatch() {
    this.setState({hasError: true});
  }

  toggleFolds() {
    const {individualFoldStates} = this.state;
    const hasOpen = individualFoldStates.length > 0 && individualFoldStates.some((s) => s !== true);
    this.setState({
      individualFoldStates: individualFoldStates.map(() => hasOpen),
    });
  }

  toggleFold(index) {
    this.setState(update(this.state, {individualFoldStates: {$toggle: [index]}}));
  }

  calculateFolds() {
    // to get proper number of child folds and initialize component state
    let numFolds = 0;

    Children.forEach(this.props.children, (child) => {
      if ((child?.type?.plotly_editor_traits || {}).foldable) {
        numFolds++;
      }
    });

    if (this.state.individualFoldStates.length !== numFolds) {
      const newFoldStates = new Array(numFolds).fill(this.props.collapsedOnStart);
      this.setState({
        individualFoldStates: this.props.addAction
          ? newFoldStates.map((e, i) => i !== numFolds - 1)
          : newFoldStates,
      });
    }
  }

  componentDidUpdate() {
    this.calculateFolds();
  }
  componentDidMount() {
    this.calculateFolds();
  }

  render() {
    const {individualFoldStates, hasError} = this.state;
    const {canReorder} = this.props;
    const {localize: _} = this.context;

    return hasError ? (
      <PanelEmpty icon={EmbedIcon} heading={_('Well this is embarrassing.')}>
        <p>{_('This panel could not be displayed due to an error.')}</p>
      </PanelEmpty>
    ) : (
      <div className={`panel${this.props.noPadding ? ' panel--no-padding' : ''}`}>
        {this.context?.customConfig?.panelTopItem || null}
        <PanelHeader
          addAction={this.props.addAction}
          allowCollapse={this.props.showExpandCollapse && individualFoldStates.length > 1}
          toggleFolds={this.toggleFolds}
          hasOpen={individualFoldStates.some((s) => s === false)}
          additionalButton={this.props.additionalButton}
        />
        <div className={bem('panel', 'content')}>
          {Children.map(this.props.children, (child, index) =>
            (child?.type?.plotly_editor_traits || {}).foldable
              ? cloneElement(child, {
                  key: index,
                  folded: individualFoldStates[index] || false,
                  toggleFold: () => this.toggleFold(index),
                  canMoveUp: canReorder && individualFoldStates.length > 1 && index > 0,
                  canMoveDown:
                    canReorder &&
                    individualFoldStates.length > 1 &&
                    index !== individualFoldStates.length - 1,
                })
              : child
          )}
        </div>
      </div>
    );
  }
}

Panel.propTypes = {
  addAction: PropTypes.object,
  children: PropTypes.node,
  deleteAction: PropTypes.func,
  noPadding: PropTypes.bool,
  showExpandCollapse: PropTypes.bool,
  canReorder: PropTypes.bool,
  collapsedOnStart: PropTypes.bool,
  additionalButton: PropTypes.node,
};

Panel.defaultProps = {
  showExpandCollapse: true,
  collapsedOnStart: false,
};

Panel.contextTypes = {
  localize: PropTypes.func,
  customConfig: PropTypes.object,
};

Panel.childContextTypes = {
  deleteContainer: PropTypes.func,
};

class PlotlyPanel extends Panel {}

PlotlyPanel.plotly_editor_traits = {
  no_visibility_forcing: true,
};

export default PlotlyPanel;
