import PropTypes from 'prop-types';
import PlotlyFold from './PlotlyFold';
import {LayoutPanel} from './derived';
import {connectImageToLayout} from 'lib';
import {PanelMessage} from './PanelEmpty';
import {EDITOR_ACTIONS} from 'lib/constants';

const ImageFold = connectImageToLayout(PlotlyFold);

const ImageAccordion = ({canAdd, children, canReorder}, {layout: {images = []}, localize: _}) => {
  const content =
    images.length &&
    images.map((img, i) => (
      <ImageFold key={i} imageIndex={i} name={`${_('Image')} ${i + 1}`} canDelete={canAdd}>
        {children}
      </ImageFold>
    ));

  const addAction = {
    label: _('Image'),
    handler: ({layout, updateContainer}) => {
      let imageIndex;
      if (Array.isArray(layout.images)) {
        imageIndex = layout.images.length;
      } else {
        imageIndex = 0;
      }

      const key = `images[${imageIndex}]`;
      const value = {
        sizex: 0.1,
        sizey: 0.1,
        x: 0.5,
        y: 0.5,
      };

      if (updateContainer) {
        updateContainer({[key]: value}, false, EDITOR_ACTIONS.ADD_IMAGE);
      }
    },
  };

  return (
    <LayoutPanel addAction={canAdd ? addAction : null} canReorder={canReorder}>
      {content ? (
        content
      ) : (
        <PanelMessage heading={_('Logos, watermarks and more.')}>
          <p>
            {_(
              'Embed images in your figure to make the data more readable or to brand your content.'
            )}
          </p>
          <p>{_('Click on the + button above to add an image.')}</p>
        </PanelMessage>
      )}
    </LayoutPanel>
  );
};

ImageAccordion.contextTypes = {
  layout: PropTypes.object,
  localize: PropTypes.func,
};

ImageAccordion.propTypes = {
  children: PropTypes.node,
  canAdd: PropTypes.bool,
  canReorder: PropTypes.bool,
};

export default ImageAccordion;
