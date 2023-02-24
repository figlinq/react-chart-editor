import Field from './Field';

const Info = (props) => (
  <Field {...props}>
    <div className={`js-test-info ${props.className ? props.className : ''}`}>{props.children}</div>
  </Field>
);

export default Info;

Info.plotly_editor_traits = {
  no_visibility_forcing: true,
};

Info.propTypes = {
  ...Field.propTypes,
};
