import TextArea from '../TextArea';
import PropTypes from 'prop-types';

import {isLaTeXExpr as isWrapped} from './convertFormats';

export default class LaTeX extends TextArea {
  constructor(props) {
    super(props);

    // Internally, represesent the LaTeX document without the
    // wrapping `$...$` characters.
    const unwrappedValue = LaTeX.unwrapValue(props.value);

    this.state = {
      value: unwrappedValue,
    };
    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const unwrappedNextValue = LaTeX.unwrapValue(nextProps.value);
    if (unwrappedNextValue !== prevState.value) {
      return {value: unwrappedNextValue};
    }
    return null;
  }

  // Return a new value with wrapping `$...$` removed.
  unwrap(value) {
    return LaTeX.unwrapValue(value);
  }

  static unwrapValue(value) {
    if (isWrapped(value)) {
      return value.substr(1, value.length - 2);
    }
    return value;
  }

  // Wrap value in `$...$`.
  wrap(value) {
    if (!isWrapped(value)) {
      return `$${value}$`;
    }

    return value;
  }

  onChange(e) {
    this.setState({
      value: e.target.value,
    });
  }

  onBlur(e) {
    const value = this.wrap(e.target.value);
    this.props.onChange(value);
  }

  render() {
    const {className} = this.props;
    const editorClassNames = className ? className : 'text-editor__latex';
    return (
      <textarea
        value={this.state.value}
        placeholder={this.props.placeholder}
        onChange={this.onChange}
        onBlur={this.onBlur}
        className={editorClassNames}
      />
    );
  }
}

LaTeX.propTypes = {
  className: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string,
};

LaTeX.defaultProps = {
  value: '',
  placeholder: '',
};
