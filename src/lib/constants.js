export const baseClass = 'plotly-editor';

/*
 * Control represents multiple settings (like for several axes)
 * and the values are different.
 *
 * Because this is sometimes used in contexts where users can enter freeform
 * strings, we include a non-printable character (ESC) so it's not something
 * people could type.
 */
export const MULTI_VALUED = '\x1bMIXED_VALUES';

// how mixed values are represented in text inputs
export const MULTI_VALUED_PLACEHOLDER = '---';

export const getMultiValueText = (key, _) => {
  const multiValueText = {
    title: _('Multiple Values'),
    text: _(
      'This input has multiple values associated with it. ' +
        'Changing this setting will override these custom inputs.'
    ),
    subText: _(
      "Common Case: An 'All' tab might display this message " +
        'because the X and Y tabs contain different settings.'
    ),
  };
  return multiValueText[key];
};

export const EDITOR_ACTIONS = {
  ADD_TRANSFORM: 'plotly-editor-add-transform',
  DELETE_TRANSFORM: 'plotly-editor-delete-transform',
  ADD_TRACE: 'plotly-editor-add-trace',
  RESTORE_TRACE: 'plotly-editor-restore-trace', // restores as is and re-adds axes and subplots
  DELETE_TRACE: 'plotly-editor-delete-trace',
  UPDATE_TRACES: 'plotly-editor-update-traces',
  ADD_ANNOTATION: 'plotly-editor-add-annotation',
  DELETE_ANNOTATION: 'plotly-editor-delete-annotation',
  ADD_SHAPE: 'plotly-editor-add-shape',
  DELETE_SHAPE: 'plotly-editor-delete-shape',
  ADD_IMAGE: 'plotly-editor-add-image',
  DELETE_IMAGE: 'plotly-editor-delete-image',
  ADD_RANGESELECTOR: 'plotly-editor-add-rangeselector',
  DELETE_RANGESELECTOR: 'plotly-editor-delete-rangeselector',
  MOVE_TO: 'plotly-editor-move-to',
  UPDATE_LAYOUT: 'plotly-editor-update-layout',
};

export const INVERSE_ACTIONS = {
  [EDITOR_ACTIONS.ADD_TRANSFORM]: EDITOR_ACTIONS.DELETE_TRANSFORM,
  [EDITOR_ACTIONS.DELETE_TRANSFORM]: EDITOR_ACTIONS.ADD_TRANSFORM,
  [EDITOR_ACTIONS.ADD_TRACE]: EDITOR_ACTIONS.DELETE_TRACE,
  [EDITOR_ACTIONS.RESTORE_TRACE]: EDITOR_ACTIONS.DELETE_TRACE,
  [EDITOR_ACTIONS.DELETE_TRACE]: EDITOR_ACTIONS.RESTORE_TRACE,
  [EDITOR_ACTIONS.UPDATE_TRACES]: EDITOR_ACTIONS.UPDATE_TRACES,
  [EDITOR_ACTIONS.ADD_ANNOTATION]: EDITOR_ACTIONS.DELETE_ANNOTATION,
  [EDITOR_ACTIONS.DELETE_ANNOTATION]: EDITOR_ACTIONS.ADD_ANNOTATION,
  [EDITOR_ACTIONS.ADD_SHAPE]: EDITOR_ACTIONS.DELETE_SHAPE,
  [EDITOR_ACTIONS.DELETE_SHAPE]: EDITOR_ACTIONS.ADD_SHAPE,
  [EDITOR_ACTIONS.ADD_IMAGE]: EDITOR_ACTIONS.DELETE_IMAGE,
  [EDITOR_ACTIONS.DELETE_IMAGE]: EDITOR_ACTIONS.ADD_IMAGE,
  [EDITOR_ACTIONS.ADD_RANGESELECTOR]: EDITOR_ACTIONS.UPDATE_LAYOUT,
  [EDITOR_ACTIONS.DELETE_RANGESELECTOR]: EDITOR_ACTIONS.UPDATE_LAYOUT,
  [EDITOR_ACTIONS.MOVE_TO]: EDITOR_ACTIONS.MOVE_TO,
  [EDITOR_ACTIONS.UPDATE_LAYOUT]: EDITOR_ACTIONS.UPDATE_LAYOUT,
};

export const OPERATION_TYPE = {
  NONE: 0,
  UPDATE: 1,
  UNDO: 2,
  REDO: 3,
};

export const DEFAULT_FONTS = [
  {label: 'Sans Serif', value: 'sans-serif'},
  {label: 'Serif', value: 'serif'},
  {label: 'Monospaced', value: 'monospace'},
];

export const RETURN_KEY = 'Enter';
export const ESCAPE_KEY = 'Escape';
export const COMMAND_KEY = 'Meta';
export const CONTROL_KEY = 'Control';

// matches gd._fullLayout._subplots categories except for xaxis & yaxis which
// are in fact cartesian types
export const TRACE_TO_AXIS = {
  cartesian: [
    'scatter',
    'scattergl',
    'box',
    'violin',
    'bar',
    'heatmap',
    'heatmapgl',
    'contour',
    'ohlc',
    'candlestick',
    'histogram',
    'histogram2d',
    'histogram2dcontour',
    'carpet',
    'scattercarpet',
    'contourcarpet',
    'waterfall',
    'funnel',
  ],
  ternary: ['scatterternary'],
  gl3d: ['scatter3d', 'surface', 'mesh3d', 'cone', 'streamtube'],
  geo: ['scattergeo', 'choropleth'],
  mapbox: ['scattermapbox', 'choroplethmapbox', 'densitymapbox'],
  polar: ['scatterpolar', 'scatterpolargl', 'barpolar'],
};

// Note: scene, and xaxis/yaxis were added for convenience sake even though they're not subplot types
export const SUBPLOT_TO_ATTR = {
  cartesian: {data: ['xaxis', 'yaxis'], layout: ['x', 'y']},
  xaxis: {data: 'xaxis', layout: 'x'},
  yaxis: {data: 'yaxis', layout: 'y'},
  x: {data: 'xaxis', layout: 'x'},
  y: {data: 'yaxis', layout: 'y'},
  ternary: {data: 'subplot', layout: 'ternary'},
  gl3d: {data: 'scene', layout: 'scene'},
  scene: {data: 'scene', layout: 'scene'},
  geo: {data: 'geo', layout: 'geo'},
  mapbox: {data: 'subplot', layout: 'mapbox'},
  polar: {data: 'subplot', layout: 'polar'},
};

export const subplotName = (type, _) =>
  ({
    x: _('X'),
    y: _('Y'),
    ternary: _('Ternary'),
    gl3d: _('Scene'),
    scene: _('Scene'),
    geo: _('Map'),
    mapbox: _('Tile Map'),
    polar: _('Polar'),
  }[type]);

export const TRANSFORMS_LIST = ['filter', 'groupby', 'aggregate', 'sort'];

export const TRANSFORMABLE_TRACES = [
  'scatter',
  'scattergl',
  'box',
  'violin',
  'bar',
  'ohlc',
  'candlestick',
  'histogram',
  'histogram2d',
  'waterfall',
];

export const TRACES_WITH_GL = ['scatter', 'scatterpolar', 'scattergl', 'scatterpolargl'];

export const COLORS = {
  charcoal: '#444444',
  white: '#ffffff',
  mutedBlue: '#1f77b4',
  safetyOrange: '#ff7f0e',
  cookedAsparagusGreen: '#2ca02c',
  brickRed: '#d62728',
  mutedPurple: '#9467bd',
  chestnutBrown: '#8c564b',
  raspberryYogurtPink: '#e377c2',
  middleGray: '#7f7f7f',
  curryYellowGreen: '#bcbd22',
  blueTeal: '#17becf',
  editorLink: '#447bdc',
  black: '#000000',
};

// prettier-ignore
export const COLOR_PICKER_SWATCH = [
  '#b71c1c','#d32f2f','#f44336','#e57373','#ffcdd2','#33691e','#689f38','#8bc34a','#aed581','#dcedc8',
  '#880e4f','#c2185b','#e91e63','#f06292','#f8bbd0','#827717','#afb42b','#cddc39','#dce775','#f0f4c3',
  '#4a148c','#7b1fa2','#9c27b0','#ba68c8','#e1bee7','#f57f17','#fbc02d','#ffeb3b','#fff176','#fff9c4',
  '#311b92','#512da8','#673ab7','#9575cd','#d1c4e9','#ff6f00','#ffa000','#ffc107','#ffd54f','#ffecb3',
  '#1a237e','#303f9f','#3f51b5','#7986cb','#c5cae9','#e65100','#f57c00','#ff9800','#ffb74d','#ffe0b2',
  '#0d47a1','#1976d2','#2196f3','#64b5f6','#bbdefb','#bf360c','#e64a19','#ff5722','#ff8a65','#ffccbc',
  '#01579b','#0288d1','#03a9f4','#4fc3f7','#b3e5fc','#3e2723','#5d4037','#795548','#a1887f','#d7ccc8',
  '#006064','#0097a7','#00bcd4','#4dd0e1','#b2ebf2','#263238','#455a64','#607d8b','#90a4ae','#cfd8dc',
  '#004d40','#00796b','#009688','#4db6ac','#b2dfdb','#000000','#1a1a1a','#333333','#4d4d4d','#666666',
  '#194D33','#388e3c','#4caf50','#81c784','#c8e6c9','#7f7f7f','#999999','#b2b2b2','#cccccc','#ffffff',
];

export const DEFAULT_COLORS = Object.values(COLORS);

// These are attrs for which we want to disable the 'variable' option in MarkerSize and MarkerColor, dur to lack of support in plotly.js
export const ATTRS_WITH_DISABLED_VARIABLE_OPTION = {
  'box': ['marker.color', 'marker.size'],
  'violin': ['marker.color', 'marker.size'],
}