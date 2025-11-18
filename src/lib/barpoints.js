import tinycolor from 'tinycolor2';

const BAR_POINTS_TRANSFORM = 'bar-with-points';
const BAR_POINTS_OVERLAY_KEY = `__${BAR_POINTS_TRANSFORM}-overlay`;

const DEFAULT_STAT = 'mean';
const DEFAULT_ERROR = 'sem';
const DEFAULT_TRACE_LABEL = 'Bar with Points';
const UID_RADIX = 36;
const UID_SLICE_END = 10;
const LIGHTEN_PERCENT = 18;
const POINT_BORDER_COLOR = '#000000';
const POINT_OPACITY = 0.85;
const DEFAULT_COLORWAY = [
  '#636efa',
  '#EF553B',
  '#00cc96',
  '#ab63fa',
  '#FFA15A',
  '#19d3f3',
  '#FF6692',
  '#B6E880',
  '#FF97FF',
  '#FECB52',
];

const ensureUid = (trace) => {
  if (!trace.uid) {
    trace.uid = `barpoints-${Math.random().toString(UID_RADIX).slice(2, UID_SLICE_END)}`;
  }
  return trace.uid;
};

const coerceNumber = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const coerceCategory = (value, fallback) =>
  value === null || typeof value === 'undefined' || value === '' ? fallback : value;

const mean = (values) =>
  values.length ? values.reduce((acc, value) => acc + value, 0) / values.length : 0;

const median = (values) => {
  if (!values.length) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const standardDeviation = (values) => {
  if (values.length <= 1) {
    return 0;
  }
  const avg = mean(values);
  const variance =
    values.reduce((acc, value) => acc + Math.pow(value - avg, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
};

const sem = (values) => {
  if (values.length <= 1) {
    return 0;
  }
  return standardDeviation(values) / Math.sqrt(values.length);
};

const statisticValue = (values, statistic) => {
  if (!values.length) {
    return null;
  }
  if (statistic === 'median') {
    return median(values);
  }
  return mean(values);
};

const errorValue = (values, metric) => {
  if (!values.length) {
    return 0;
  }
  if (metric === 'sd') {
    return standardDeviation(values);
  }
  return sem(values);
};

const buildErrors = (orientation, values) => {
  const hasValues = Array.isArray(values) && values.length;
  const errorPayload = hasValues
    ? {
        type: 'data',
        array: values,
        visible: true,
      }
    : {visible: false};

  if (orientation === 'h') {
    return {error_x: errorPayload, error_y: {visible: false}};
  }

  return {error_y: errorPayload, error_x: {visible: false}};
};

const buildHovertemplate = (statLabel, errLabel, orientation) => {
  const valueRef = orientation === 'h' ? '%{x}' : '%{y}';
  return `${statLabel}: ${valueRef}<br>${errLabel}: %{customdata[0]}<extra></extra>`;
};

const formatLabel = (key) => {
  if (key === 'median') {
    return 'Median';
  }
  if (key === 'sd') {
    return 'Std Dev';
  }
  if (key === 'sem') {
    return 'Std Error';
  }
  return 'Mean';
};

const isBarPointsParent = (trace) =>
  trace && trace.type === 'box' && trace.barpoints && trace.barpoints.enabled;

const getOverlayMeta = (trace) => trace?.[BAR_POINTS_OVERLAY_KEY];

const isBarPointsOverlay = (trace) => Boolean(getOverlayMeta(trace));

const moveAfterParent = (data, parentUid, trace) => {
  const parentIndex = data.findIndex((t) => t.uid === parentUid);
  if (parentIndex === -1) {
    return;
  }
  const currentIndex = data.indexOf(trace);
  if (currentIndex === parentIndex + 1) {
    return;
  }
  if (currentIndex !== -1) {
    data.splice(currentIndex, 1);
  }
  data.splice(parentIndex + 1, 0, trace);
};

const buildGroupedStats = (trace, orientation, statistic, errorMetric) => {
  const measurement = orientation === 'h' ? trace.x : trace.y;
  const categories = orientation === 'h' ? trace.y : trace.x;
  if (!Array.isArray(measurement) || !measurement.length) {
    return null;
  }

  const defaultCategory = trace.name || DEFAULT_TRACE_LABEL;
  const grouped = new Map();
  const pointCategories = new Array(measurement.length).fill(null);

  for (let i = 0; i < measurement.length; i++) {
    const numericValue = coerceNumber(measurement[i]);
    if (numericValue === null) {
      pointCategories[i] = null;
      continue;
    }
    const rawCategory = Array.isArray(categories) ? categories[i] : null;
    const category = coerceCategory(rawCategory, defaultCategory);
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category).push(numericValue);
    pointCategories[i] = category;
  }

  if (!grouped.size) {
    return null;
  }

  const orderedCategories = [];
  const stats = [];
  const errors = [];

  grouped.forEach((values, category) => {
    const statValue = statisticValue(values, statistic);
    if (statValue === null) {
      return;
    }
    orderedCategories.push(category);
    stats.push(statValue);
    errors.push(errorValue(values, errorMetric));
  });

  if (!orderedCategories.length) {
    return null;
  }

  return {categories: orderedCategories, stats, errors, pointCategories};
};

const buildComputedTracePayload = (trace) => {
  const orientation = trace.orientation === 'h' ? 'h' : 'v';
  const statistic = trace.barpoints?.statistic || DEFAULT_STAT;
  const errorMetric = trace.barpoints?.errorMetric || DEFAULT_ERROR;

  const grouped = buildGroupedStats(trace, orientation, statistic, errorMetric);
  if (!grouped) {
    return null;
  }

  const {categories, stats, errors, pointCategories} = grouped;
  const label = trace.name || DEFAULT_TRACE_LABEL;
  const axisProps = {
    ...(trace.xaxis ? {xaxis: trace.xaxis} : {}),
    ...(trace.yaxis ? {yaxis: trace.yaxis} : {}),
    ...(trace.legendgroup ? {legendgroup: trace.legendgroup} : {}),
    ...(trace.offsetgroup ? {offsetgroup: trace.offsetgroup} : {}),
    ...(trace.alignmentgroup ? {alignmentgroup: trace.alignmentgroup} : {}),
    ...(trace.xcalendar ? {xcalendar: trace.xcalendar} : {}),
    ...(trace.ycalendar ? {ycalendar: trace.ycalendar} : {}),
  };

  const statLabel = formatLabel(statistic);
  const errLabel = formatLabel(errorMetric);

  const overlayMeta = {
    type: BAR_POINTS_TRANSFORM,
    inputUid: trace.uid,
    statistic,
    errorMetric,
  };

  const payload = {
    orientation,
    name: `${label} – ${statLabel}`,
    hovertemplate: buildHovertemplate(statLabel, errLabel, orientation),
    customdata: errors.map((err) => [err]),
    ...axisProps,
    pointCategories,
    categories,
    [BAR_POINTS_OVERLAY_KEY]: overlayMeta,
  };

  if (orientation === 'h') {
    payload.y = categories;
    payload.x = stats;
  } else {
    payload.x = categories;
    payload.y = stats;
  }

  Object.assign(payload, buildErrors(orientation, errors));

  return payload;
};

const getColorway = (graphDiv) => {
  const candidate = graphDiv?.layout?.colorway || graphDiv?._fullLayout?.colorway;
  return Array.isArray(candidate) && candidate.length ? candidate : DEFAULT_COLORWAY;
};

const assignCategoryColors = (categories = [], colorway = DEFAULT_COLORWAY) => {
  const palette = Array.isArray(colorway) && colorway.length ? colorway : DEFAULT_COLORWAY;
  return categories.map((_, idx) => palette[idx % palette.length]);
};

const buildBarMarker = (colors) => ({
  color: colors,
  line: {color: 'rgba(0,0,0,0)', width: 0},
});

const lightenColor = (color) => tinycolor(color).lighten(LIGHTEN_PERCENT).toRgbString();

const styleBoxPoints = (trace, pointCategories, categoryColorMap) => {
  if (!pointCategories || !pointCategories.length) {
    return;
  }

  const userSetMarkerColor = Boolean(trace.marker && trace.marker.color);
  trace.showlegend = false;
  trace.fillcolor = trace.fillcolor || 'rgba(0,0,0,0)';
  trace.line = trace.line || {};
  if (typeof trace.line.width === 'undefined') {
    trace.line.width = 0;
  }
  if (userSetMarkerColor) {
    return;
  }

  const fallbackColor = categoryColorMap.values().next().value || DEFAULT_COLORWAY[0];
  const pointColors = pointCategories.map((category) => {
    const baseColor = categoryColorMap.get(category) || fallbackColor;
    return lightenColor(baseColor);
  });

  trace.marker = {
    ...(trace.marker || {}),
    color: pointColors,
    opacity: trace.marker?.opacity ?? POINT_OPACITY,
    line: {
      color: POINT_BORDER_COLOR,
      width: trace.marker?.line?.width ?? 1,
    },
  };
};

export const syncBarWithPointsTraces = (graphDiv) => {
  if (!graphDiv || !Array.isArray(graphDiv.data)) {
    return;
  }

  if (graphDiv.layout) {
    if (typeof graphDiv.layout.boxmode === 'undefined') {
      graphDiv.layout.boxmode = 'group';
    }
  }

  const data = graphDiv.data;
  const existingOverlays = new Map();
  const colorway = getColorway(graphDiv);

  data.forEach((trace, index) => {
    if (isBarPointsOverlay(trace)) {
      const meta = getOverlayMeta(trace);
      if (meta?.inputUid) {
        existingOverlays.set(meta.inputUid, {trace, index});
      }
    }
  });

  const parents = data.filter((trace) => isBarPointsParent(trace));

  parents.forEach((trace) => {
    const uid = ensureUid(trace);
    const payload = buildComputedTracePayload(trace);
    const overlay = existingOverlays.get(uid);

    if (!payload) {
      if (overlay) {
        const overlayIndex = data.indexOf(overlay.trace);
        if (overlayIndex !== -1) {
          data.splice(overlayIndex, 1);
        }
        existingOverlays.delete(uid);
      }
      return;
    }

    const categories = payload.categories || [];
    const categoryColors = assignCategoryColors(categories, colorway);
    const categoryColorMap = new Map();
    categories.forEach((category, idx) => {
      categoryColorMap.set(category, categoryColors[idx]);
    });
    styleBoxPoints(trace, payload.pointCategories, categoryColorMap);
    const overlayMeta = payload[BAR_POINTS_OVERLAY_KEY];

    if (overlay) {
      overlay.trace.type = 'bar';
      overlay.trace.orientation = payload.orientation;
      overlay.trace.x = payload.x;
      overlay.trace.y = payload.y;
      overlay.trace.error_x = payload.error_x;
      overlay.trace.error_y = payload.error_y;
      overlay.trace.name = payload.name;
      overlay.trace.hovertemplate = payload.hovertemplate;
      overlay.trace.xaxis = payload.xaxis;
      overlay.trace.yaxis = payload.yaxis;
      overlay.trace.legendgroup = payload.legendgroup;
      overlay.trace.offsetgroup = payload.offsetgroup;
      overlay.trace.alignmentgroup = payload.alignmentgroup;
      overlay.trace.customdata = payload.customdata;
      overlay.trace.xcalendar = payload.xcalendar;
      overlay.trace.ycalendar = payload.ycalendar;
      overlay.trace.marker = buildBarMarker(categoryColors);
      overlay.trace.showlegend = true;
      if (overlayMeta) {
        overlay.trace[BAR_POINTS_OVERLAY_KEY] = overlayMeta;
      }
      moveAfterParent(data, uid, overlay.trace);
      existingOverlays.delete(uid);
    } else {
      const newTrace = {
        type: 'bar',
        orientation: payload.orientation,
        x: payload.x,
        y: payload.y,
        error_x: payload.error_x,
        error_y: payload.error_y,
        hovertemplate: payload.hovertemplate,
        name: payload.name,
        showlegend: true,
        marker: buildBarMarker(categoryColors),
        xaxis: payload.xaxis,
        yaxis: payload.yaxis,
        legendgroup: payload.legendgroup,
        offsetgroup: payload.offsetgroup,
        alignmentgroup: payload.alignmentgroup,
        customdata: payload.customdata,
        xcalendar: payload.xcalendar,
        ycalendar: payload.ycalendar,
        [BAR_POINTS_OVERLAY_KEY]: overlayMeta,
      };
      const parentIndex = data.findIndex((t) => t.uid === uid);
      data.splice(parentIndex + 1, 0, newTrace);
    }
  });

  const orphaned = Array.from(existingOverlays.values())
    .map(({trace}) => data.indexOf(trace))
    .filter((index) => index !== -1)
    .sort((a, b) => b - a);

  orphaned.forEach((index) => {
    data.splice(index, 1);
  });
};

export {BAR_POINTS_TRANSFORM, BAR_POINTS_OVERLAY_KEY};
