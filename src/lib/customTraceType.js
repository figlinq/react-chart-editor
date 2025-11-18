export function plotlyTraceToCustomTrace(trace) {
  if (typeof trace !== 'object') {
    throw new Error(
      `trace provided to plotlyTraceToCustomTrace function should be an object, received ${typeof trace}`
    );
  }

  const gl = 'gl';
  const type = trace.type
    ? trace.type.endsWith(gl)
      ? trace.type.slice(0, -gl.length)
      : trace.type
    : 'scatter';

  if (type === 'box' && trace.barpoints && trace.barpoints.enabled) {
    return 'bar-with-points';
  } else if (
    (type === 'scatter' || type === 'scattergl') &&
    (![null, undefined, ''].includes(trace.stackgroup) || // eslint-disable-line no-undefined
      ['tozeroy', 'tozerox', 'tonexty', 'tonextx', 'toself', 'tonext'].includes(trace.fill))
  ) {
    return 'area';
  } else if (
    (type === 'scatter' || type === 'scattergl') &&
    (trace.mode === 'lines' || trace.mode === 'lines+markers')
  ) {
    return 'line';
  } else if (type === 'scatter3d' && trace.mode === 'lines') {
    return 'line3d';
  }
  return type;
}

export function traceTypeToPlotlyInitFigure(traceType, gl = '') {
  const scatterTrace = {type: 'scatter' + gl, mode: 'markers', stackgroup: null};

  const traceConfigurations = {
    scatter: scatterTrace,
    line: {type: 'scatter' + gl, mode: 'lines', stackgroup: null},
    area: {type: 'scatter' + gl, mode: 'lines', stackgroup: 1},
    scatterpolar: {type: 'scatterpolar' + gl},
    waterfall: {type: 'waterfall', orientation: 'v'},
    box: {type: 'box', boxpoints: false, barpoints: null},
    'bar-with-points': {
      type: 'box',
      name: 'Bar with Points',
      boxpoints: 'all',
      jitter: 0.4,
      pointpos: 0,
      marker: {
        opacity: 0.85,
        line: {color: '#000', width: 1},
      },
      line: {width: 0, color: 'rgba(0,0,0,0)'},
      fillcolor: 'rgba(0,0,0,0)',
      showlegend: false,
      barpoints: {
        enabled: true,
        statistic: 'mean',
        errorMetric: 'sem',
      },
    },
    violin: {type: 'violin', bandwidth: 0},
    line3d: {type: 'scatter3d', mode: 'lines'},
    scatter3d: {type: 'scatter3d', mode: 'markers'},
    bar: {orientation: 'v', type: 'bar'},
    cone: {sizeref: 1, type: 'cone'},
    histogram2dcontour: {type: 'histogram2dcontour', autocolorscale: true},
    histogram2d: {type: 'histogram2d', autocolorscale: true},
    heatmap: {type: 'heatmap', autocolorscale: true},
    contour: {type: 'contour', autocolorscale: true},
  };

  return !traceType ? scatterTrace : traceConfigurations[traceType] || {type: traceType};
}
