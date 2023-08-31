import Field from './Field';
import PropTypes from 'prop-types';
import {useState} from 'react';
import {connectToContainer} from 'lib';
import ResizableRect from 'react-resizable-rotatable-draggable';
import RadioBlocks from '../widgets/RadioBlocks';
import DualNumeric from './DualNumeric';

const maxWidth = 276;
const gridRes = 8;

const UnconnectedRectanglePositioner = (
  props,
  {
    localize: _,
    fullContainer,
    fullLayout: {width: plotWidthPx, height: plotHeightPx},
    updateContainer,
  }
) => {
  const {attr, cartesian} = props;
  const [shouldSnap, setShouldSnap] = useState(true);
  const attrs = cartesian
    ? {
        x: ['xaxis.domain[0]', 'xaxis.domain[1]'],
        y: ['yaxis.domain[0]', 'yaxis.domain[1]'],
      }
    : {x: ['domain.x[0]', 'domain.x[1]'], y: ['domain.y[0]', 'domain.y[1]']};

  const x = cartesian ? fullContainer.xaxis.domain : fullContainer.domain.x;
  const y = cartesian ? fullContainer.yaxis.domain : fullContainer.domain.y;
  const aspectRatio = plotHeightPx / plotWidthPx;
  const fieldWidthPx = Math.min(maxWidth, maxWidth / aspectRatio);
  const fieldHeightPx = Math.min(maxWidth, maxWidth * aspectRatio);
  const width = fieldWidthPx * (x[1] - x[0]);
  const height = fieldHeightPx * (y[1] - y[0]);
  const left = fieldWidthPx * x[0];
  const top = fieldHeightPx * (1 - y[1]);
  let zoomable = '';

  const sendUpdate = ({x, y, width, height, fieldWidthPx, fieldHeightPx}) => {
    const x0 = x / fieldWidthPx;
    const x1 = (width + x) / fieldWidthPx;
    const y0 = (fieldHeightPx - (height + y)) / fieldHeightPx;
    const y1 = (fieldHeightPx - y) / fieldHeightPx;
    const snap = shouldSnap ? (v) => Math.round(v * gridRes) / gridRes : (v) => v;
    const payload = {};

    if (x0 >= 0 && x1 <= 1) {
      payload[attrs.x[0]] = snap(x0);
      payload[attrs.x[1]] = snap(x1);
    }

    if (y0 >= 0 && y1 <= 1) {
      payload[attrs.y[0]] = snap(y0);
      payload[attrs.y[1]] = snap(y1);
    }

    updateContainer(payload, true);
  };

  if (!fullContainer?.xaxis?.overlaying && !fullContainer?.yaxis?.overlaying) {
    zoomable = 'n, w, s, e, nw, ne, se, sw';
  } else if (!fullContainer?.xaxis?.overlaying) {
    zoomable = 'e, w';
  } else if (!fullContainer?.yaxis?.overlaying) {
    zoomable = 'n, s';
  }

  return (
    <div style={{marginRight: 25}}>
      <Field {...props} attr={attr}>
        <Field label={_('Snap to Grid')}>
          <RadioBlocks
            alignment="center"
            onOptionChange={setShouldSnap}
            activeOption={shouldSnap}
            options={[
              {label: _('On'), value: true},
              {label: _('Off'), value: false},
            ]}
          />
        </Field>
        <div
          className="rect-container"
          style={{width: fieldWidthPx + 1, height: fieldHeightPx + 1}}
        >
          {Array(gridRes * gridRes)
            .fill(0)
            .map((v, i) => (
              <div
                key={i}
                className="rect-grid"
                style={{
                  width: fieldWidthPx / gridRes - 1,
                  height: fieldHeightPx / gridRes - 1,
                  borderBottom: i < gridRes * (gridRes - 1) ? '0' : '1px solid ',
                  borderRight: (i + 1) % gridRes ? '0' : '1px solid',
                }}
              />
            ))}
          <ResizableRect
            bounds="parent"
            width={width}
            height={height}
            left={left}
            top={top}
            rotatable={false}
            draggable={!shouldSnap}
            zoomable={zoomable}
            onResize={(style) => {
              sendUpdate({
                fieldWidthPx,
                fieldHeightPx,
                width: style.width,
                height: style.height,
                x: style.left,
                y: style.top,
              });
            }}
            onDrag={(deltaX, deltaY) => {
              sendUpdate({
                fieldWidthPx,
                fieldHeightPx,
                width,
                height,
                x: left + deltaX,
                y: top + deltaY,
              });
            }}
          />
        </div>
        {fullContainer?.xaxis?.overlaying ? (
          ''
        ) : (
          <DualNumeric
            label={_('X')}
            attr={attrs.x[0]}
            attr2={attrs.x[1]}
            percentage
            step={1}
            min={0}
            max={100}
          />
        )}
        {fullContainer?.yaxis?.overlaying ? (
          ''
        ) : (
          <DualNumeric
            label={_('Y')}
            attr={attrs.y[0]}
            attr2={attrs.y[1]}
            percentage
            step={1}
            min={0}
            max={100}
          />
        )}
      </Field>
    </div>
  );
};

UnconnectedRectanglePositioner.propTypes = {
  fullValue: PropTypes.any,
  updatePlot: PropTypes.func,
  cartesian: PropTypes.bool,
  ...Field.propTypes,
};

UnconnectedRectanglePositioner.contextTypes = {
  localize: PropTypes.func,
  updateContainer: PropTypes.func,
  fullContainer: PropTypes.object,
  fullLayout: PropTypes.object,
};

UnconnectedRectanglePositioner.displayName = 'UnconnectedRectanglePositioner';

export default connectToContainer(UnconnectedRectanglePositioner);
