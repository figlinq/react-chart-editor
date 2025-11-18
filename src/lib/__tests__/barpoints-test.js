/* eslint-disable no-magic-numbers */
import {syncBarWithPointsTraces, BAR_POINTS_TRANSFORM, BAR_POINTS_OVERLAY_KEY} from '../barpoints';

const DEFAULT_VALUES = [1, 2, 3, 4];
const DEFAULT_CATEGORIES = ['G1', 'G1', 'G2', 'G2'];
const HORIZONTAL_VALUES = [10, 20, 30, 40];
const HORIZONTAL_CATEGORIES = ['H1', 'H1', 'H2', 'H2'];
const GROUP_MEANS = [1.5, 3.5];
const HORIZONTAL_MEDIANS = [15, 35];

const buildGraph = (traceOverrides = {}) => ({
  data: [
    {
      type: 'box',
      name: 'Series A',
      y: DEFAULT_VALUES,
      barpoints: {
        enabled: true,
        statistic: 'mean',
        errorMetric: 'sem',
      },
      ...traceOverrides,
    },
  ],
});

describe('barpoints sync', () => {
  it('adds a computed bar trace with per-category means', () => {
    const graphDiv = buildGraph({x: DEFAULT_CATEGORIES});

    syncBarWithPointsTraces(graphDiv);

    expect(graphDiv.data).toHaveLength(2);
    const [parent, overlay] = graphDiv.data;
    expect(parent.uid).toBeDefined();
    expect(overlay.type).toBe('bar');
    expect(overlay.x).toEqual(['G1', 'G2']);
    expect(overlay.y).toEqual(GROUP_MEANS);
    expect(overlay.error_y.array.length).toBe(2);
    expect(overlay.customdata).toHaveLength(2);
    expect(overlay[BAR_POINTS_OVERLAY_KEY]).toMatchObject({
      type: BAR_POINTS_TRANSFORM,
      inputUid: parent.uid,
      statistic: 'mean',
      errorMetric: 'sem',
    });
  });

  it('updates orientation, statistic, and error metric when settings change', () => {
    const graphDiv = buildGraph({
      orientation: 'h',
      x: HORIZONTAL_VALUES,
      y: HORIZONTAL_CATEGORIES,
      barpoints: {
        enabled: true,
        statistic: 'median',
        errorMetric: 'sd',
      },
    });

    syncBarWithPointsTraces(graphDiv);

    const [, overlay] = graphDiv.data;
    expect(overlay.orientation).toBe('h');
    expect(overlay.y).toEqual(['H1', 'H2']);
    expect(overlay.x).toEqual(HORIZONTAL_MEDIANS);
    expect(overlay.error_x.array.length).toBe(2);
    expect(overlay.error_y.visible).toBe(false);
  });

  it('recomputes bars when parent data changes', () => {
    const graphDiv = buildGraph({x: DEFAULT_CATEGORIES});
    syncBarWithPointsTraces(graphDiv);
    let overlay = graphDiv.data[1];
    expect(overlay.y).toEqual(GROUP_MEANS);

    graphDiv.data[0].y = [2, 4, 6, 8];
    graphDiv.data[0].x = DEFAULT_CATEGORIES;
    syncBarWithPointsTraces(graphDiv);

    overlay = graphDiv.data[1];
    expect(overlay.y).toEqual([3, 7]);
  });

  it('removes overlays when the parent trace no longer requests barpoints', () => {
    const graphDiv = buildGraph();
    syncBarWithPointsTraces(graphDiv);
    expect(graphDiv.data).toHaveLength(2);

    graphDiv.data[0].barpoints.enabled = false;
    syncBarWithPointsTraces(graphDiv);

    expect(graphDiv.data).toHaveLength(1);
    expect(graphDiv.data[0].type).toBe('box');
  });
});
