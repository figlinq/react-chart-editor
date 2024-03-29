export bem from './bem';
export connectCartesianSubplotToLayout from './connectCartesianSubplotToLayout';
export connectNonCartesianSubplotToLayout from './connectNonCartesianSubplotToLayout';
export connectAnnotationToLayout from './connectAnnotationToLayout';
export connectShapeToLayout from './connectShapeToLayout';
export connectSliderToLayout from './connectSliderToLayout';
export connectImageToLayout from './connectImageToLayout';
export connectUpdateMenuToLayout from './connectUpdateMenuToLayout';
export connectRangeSelectorToAxis from './connectRangeSelectorToAxis';
export connectLayersToMapbox from './connectLayersToMapbox';
export connectTransformToTrace from './connectTransformToTrace';
export connectAggregationToTransform from './connectAggregationToTransform';
export connectAxesToLayout from './connectAxesToLayout';
export connectLayoutToPlot from './connectLayoutToPlot';
export connectToContainer, {containerConnectedContextTypes} from './connectToContainer';
export {computeTraceOptionsFromSchema} from './computeTraceOptionsFromSchema';
export connectTraceToPlot from './connectTraceToPlot';
export dereference from './dereference';
import getAllAxes, {
  axisIdToAxisName,
  traceTypeToAxisType,
  getAxisTitle,
  getSubplotTitle,
} from './getAllAxes';
export localize, {localizeString} from './localize';
import tinyColor from 'tinycolor2';
export unpackPlotProps, {
  computeCustomConfigVisibility,
  hasValidCustomConfigVisibilityRules,
  isVisibleGivenCustomConfig,
} from './unpackPlotProps';
export walkObject, {isPlainObject} from './walkObject';
export {traceTypeToPlotlyInitFigure, plotlyTraceToCustomTrace} from './customTraceType';
import * as PlotlyIcons from '@figlinq/plotly-icons';
export striptags from './striptags';
import {capitalize, lowerCase, upperCase, removeNonWord, camelCase, pascalCase} from './strings';
import {getColorscale} from 'react-colorscales';
import {templateString} from 'plotly.js/src/lib';
import {SUBPLOT_TO_ATTR, OPERATION_TYPE, EDITOR_ACTIONS} from './constants';
export History from './history';

export const TOO_LIGHT_FACTOR = 0.8;

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const getDisplayName = (WrappedComponent) =>
  WrappedComponent.displayName || WrappedComponent.name || 'Component';

export const tooLight = (color) => tinyColor(color).toHsl().l > TOO_LIGHT_FACTOR;

export const renderTraceIcon = (trace, prefix = 'Plot') => {
  if (!trace) {
    return null;
  }
  const gl = 'gl';
  const componentName = `${prefix}${pascalCase(
    trace.endsWith(gl) ? trace.slice(0, -gl.length) : trace
  )}Icon`;

  return PlotlyIcons[componentName] ? PlotlyIcons[componentName] : PlotlyIcons.PlotLineIcon;
};

export const transpose = (originalArray) => {
  // if we want to transpose a uni dimensional array
  if (originalArray.every((a) => !Array.isArray(a))) {
    return originalArray.map((a) => [a]);
  }

  let longestArrayItem = Array.isArray(originalArray[0]) ? originalArray[0].length : 1;

  originalArray.forEach((a) => {
    // if it's not an array, it's a string
    const length = Array.isArray(a) ? a.length : 1;
    if (length > longestArrayItem) {
      longestArrayItem = length;
    }
  });

  const newArray = new Array(longestArrayItem);

  for (let outerIndex = 0; outerIndex < originalArray.length; outerIndex++) {
    if (!Array.isArray(originalArray[outerIndex])) {
      originalArray[outerIndex] = [originalArray[outerIndex]];
    }

    for (let innerIndex = 0; innerIndex < longestArrayItem; innerIndex++) {
      // ensure we have an array to push to
      if (!Array.isArray(newArray[innerIndex])) {
        newArray[innerIndex] = [];
      }

      const value =
        typeof originalArray[outerIndex][innerIndex] !== 'undefined'
          ? originalArray[outerIndex][innerIndex]
          : null;
      newArray[innerIndex].push(value);
    }
  }

  return newArray;
};

export const specialTableCase = (traceType, srcAttributePath) =>
  /* Just more user friendly
   * Table traces have many configuration options,
   * The below attributes can be 2d or 1d and will affect the plot differently
   * EX:
   * header.values = ['Jan', 'Feb', 'Mar'] => will put data in a row
   * header.values = [['Jan', 1], ['Feb', 2], ['Mar', 3]] => will create 3 columns
   * 1d arrays affect columns
   * 2d arrays affect rows within each column
   */
  traceType === 'table' &&
  [
    'header.valuessrc',
    'header.font.colorsrc',
    'header.font.sizesrc',
    'header.fill.colorsrc',
    'columnwidthsrc',
  ].some((a) => srcAttributePath.endsWith(a));

export const maybeTransposeData = (data, srcAttributePath, traceType) => {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return null;
  }

  const isTransposable2DArray =
    srcAttributePath.endsWith('zsrc') &&
    ['contour', 'contourgl', 'heatmap', 'heatmapgl', 'surface', 'carpet', 'contourcarpet'].includes(
      traceType
    );

  if (isTransposable2DArray) {
    return transpose(data);
  }

  if (
    specialTableCase(traceType, srcAttributePath) &&
    Array.isArray(data[0]) &&
    data.length === 1
  ) {
    return data[0];
  }

  return data;
};

export const maybeAdjustSrc = (src, srcAttributePath, traceType, config) => {
  if (!src || (Array.isArray(src) && src.length === 0)) {
    return null;
  }

  if (specialTableCase(traceType, srcAttributePath) && src.length === 1) {
    return src[0];
  }

  return config && config.fromSrc ? config.fromSrc(src, traceType, srcAttributePath) : src;
};

export const adjustColorscale = (colorscale, numberOfNeededColors, colorscaleType, config) => {
  if (config?.repeat) {
    if (numberOfNeededColors < colorscale.length) {
      return colorscale.slice(0, numberOfNeededColors);
    }

    const repetitions = Math.ceil(numberOfNeededColors / colorscale.length);
    const newArray = new Array(repetitions).fill(colorscale);
    return newArray
      .reduce((a, b) => {
        return a.concat(b);
      }, [])
      .slice(0, numberOfNeededColors);
  }

  return getColorscale(colorscale, numberOfNeededColors, null, null, colorscaleType);
};

export const getFullTrace = ({fullDataArrayPosition, traceIndexes}, {fullData, data}) => {
  let fullTrace = {};
  if (fullData && data) {
    if (fullDataArrayPosition) {
      // fullDataArrayPosition will be supplied in panels that have the canGroup prop
      fullTrace = fullData[fullDataArrayPosition[0]];
    } else {
      // for all other panels, we'll find fullTrace with the data index
      fullTrace = fullData.filter((t) => t && traceIndexes[0] === t.index)[0];
    }

    // For transformed traces, we actually want to read in _fullInput because
    // there's original parent information that's more useful to the user there
    // This is true except for fit transforms, where reading in fullData is
    // what we want
    if (
      fullTrace?.transforms &&
      !fullTrace.transforms.some((t) => ['moving-average', 'fits'].includes(t.type)) &&
      !fullDataArrayPosition
    ) {
      fullTrace = fullTrace._fullInput;
    }
  }
  return fullTrace;
};

export const isSubplotUsedAnywhereElse = (subplotType, subplotName, fullData, traceIndex) =>
  fullData.some(
    (trace) =>
      (trace[SUBPLOT_TO_ATTR[subplotType].data] === subplotName ||
        ((subplotType === 'xaxis' || subplotType === 'yaxis') && subplotName.charAt(1)) === '' ||
        (subplotName.split(subplotType)[1] === '' &&
          trace[SUBPLOT_TO_ATTR[subplotType].data] === null)) &&
      trace.index !== traceIndex
  );

export const itemsToBeGarbageCollected = (traceIndexToDelete, fullData) => {
  const currentTrace = fullData?.[traceIndexToDelete];

  const subplotType = traceTypeToAxisType(currentTrace?.type);
  const items = {axesToBeGarbageCollected: []};

  if (currentTrace && subplotType) {
    const subplotNames =
      subplotType === 'cartesian'
        ? [currentTrace.xaxis || 'xaxis', currentTrace.yaxis || 'yaxis']
        : currentTrace[SUBPLOT_TO_ATTR[subplotType].data] || SUBPLOT_TO_ATTR[subplotType].data;

    // When we delete a subplot, make sure no unused axes/subplots are left
    if (subplotType === 'cartesian') {
      if (!isSubplotUsedAnywhereElse('xaxis', subplotNames[0], fullData, traceIndexToDelete)) {
        items.axesToBeGarbageCollected.push(subplotNames[0]);
      }
      if (!isSubplotUsedAnywhereElse('yaxis', subplotNames[1], fullData, traceIndexToDelete)) {
        items.axesToBeGarbageCollected.push(subplotNames[1]);
      }
    } else {
      if (!isSubplotUsedAnywhereElse(subplotType, subplotNames, fullData, traceIndexToDelete)) {
        items.subplotToBeGarbageCollected = subplotNames;
      }
    }
  }

  return items;
};

export const getParsedTemplateString = (originalString, context) => {
  let text = originalString;

  if (originalString && context) {
    text = templateString(originalString, context);
  }

  return text === '' && originalString ? originalString : text;
};

export {
  getAllAxes,
  axisIdToAxisName,
  traceTypeToAxisType,
  getAxisTitle,
  getSubplotTitle,
  capitalize,
  lowerCase,
  upperCase,
  removeNonWord,
  camelCase,
  pascalCase,
  OPERATION_TYPE,
  EDITOR_ACTIONS,
};
