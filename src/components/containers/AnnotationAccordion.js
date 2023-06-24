import PlotlyFold from './PlotlyFold';
import {LayoutPanel} from './derived';
import {PanelMessage} from './PanelEmpty';
import PropTypes from 'prop-types';
import {connectAnnotationToLayout, getParsedTemplateString} from 'lib';
import {EDITOR_ACTIONS} from 'lib/constants';

const AnnotationFold = connectAnnotationToLayout(PlotlyFold);

const AnnotationAccordion = (
  {canAdd, children, canReorder},
  {layout: {annotations = [], meta = []}, localize: _}
) => {
  const content =
    annotations.length &&
    annotations.map((ann, i) => (
      <AnnotationFold
        key={i}
        annotationIndex={i}
        name={getParsedTemplateString(ann.text, {meta})}
        canDelete={canAdd}
      >
        {children}
      </AnnotationFold>
    ));
  const addAction = {
    label: _('Annotation'),
    handler: ({layout, updateContainer}) => {
      const annotationIndex = Array.isArray(layout.annotations) ? layout.annotations.length : 0;
      if (updateContainer) {
        updateContainer(
          {
            [`annotations[${annotationIndex}]`]: {
              text: _('new text'),
            },
          },
          EDITOR_ACTIONS.ADD_ANNOTATION
        );
      }
    },
  };
  return (
    <LayoutPanel addAction={canAdd ? addAction : null} canReorder={canReorder}>
      {content || (
        <PanelMessage heading={_('Call out your data.')}>
          <p>
            {_(
              'Annotations are text and arrows you can use to point out specific parts of your figure.'
            )}
          </p>
          <p>{_('Click on the + button above to add an annotation.')}</p>
        </PanelMessage>
      )}
    </LayoutPanel>
  );
};

AnnotationAccordion.contextTypes = {
  layout: PropTypes.object,
  localize: PropTypes.func,
};

AnnotationAccordion.propTypes = {
  children: PropTypes.node,
  canAdd: PropTypes.bool,
  canReorder: PropTypes.bool,
};

export default AnnotationAccordion;
