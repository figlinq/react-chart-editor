import {Component, createRef} from 'react';
import plotly from 'plotly.js/dist/plotly';
import PlotlyEditor from '@figlinq/react-chart-editor';
import '@figlinq/react-chart-editor/lib/react-chart-editor.css';
import Nav from './Nav';
import dataSources from './dataSources';
import {Button} from '@figlinq/react-chart-editor/lib/components';

const dataSourceOptions = Object.keys(dataSources).map((name) => ({
  value: name,
  label: name,
}));

const config = {editable: true};

class App extends Component {
  constructor() {
    super();

    this.state = {
      data: [],
      layout: {},
      frames: [],
      currentMockIndex: -1,
      mocks: [],
    };

    this.loadMock = this.loadMock.bind(this);
    this.PlotlyEditor = createRef();
  }

  UNSAFE_componentWillMount() {
    fetch('https://api.github.com/repos/plotly/plotly.js/contents/test/image/mocks')
      .then((response) => response.json())
      .then((mocks) => this.setState({mocks}));
  }

  loadMock(mockIndex) {
    const mock = this.state.mocks[mockIndex];
    fetch(mock.url, {
      headers: new Headers({Accept: 'application/vnd.github.v3.raw'}),
    })
      .then((response) => response.json())
      .then((figure) => {
        this.setState({
          currentMockIndex: mockIndex,
          data: figure.data,
          layout: figure.layout,
          frames: figure.frames,
        });
      });
  }

  render() {
    return (
      <div className="app">
        <div>
          <Button
            label="Undo"
            onClick={() => {
              this.PlotlyEditor.current.undo();
            }}
          />
          <Button
            label="Redo"
            onClick={() => {
              this.PlotlyEditor.current.redo();
            }}
          />
        </div>
        <PlotlyEditor
          ref={this.PlotlyEditor}
          data={this.state.data}
          layout={this.state.layout}
          config={config}
          frames={this.state.frames}
          dataSources={dataSources}
          dataSourceOptions={dataSourceOptions}
          plotly={plotly}
          onUpdate={(data, layout, frames) => this.setState({data, layout, frames})}
          useResizeHandler
          debug
          advancedTraceTypeSelector
        />
        <Nav
          currentMockIndex={this.state.currentMockIndex}
          loadMock={this.loadMock}
          mocks={this.state.mocks}
        />
      </div>
    );
  }
}

export default App;
