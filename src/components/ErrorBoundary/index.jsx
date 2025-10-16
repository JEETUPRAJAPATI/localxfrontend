import React from 'react';
import PropTypes from 'prop-types';

// Error boundaries currently have to be a class component.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null }; // Initialize state in the constructor
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service (e.g., Sentry)
    console.error('Error captured in Error Boundary: ', error, errorInfo);
  }

  render() {
    // If there's an error, render the fallback component with the error
    if (this.state.hasError) {
      const { fallback } = this.props;
      // Ensure fallback is a valid React component
      return React.isValidElement(fallback)
        ? React.cloneElement(fallback, { error: this.state.error })
        : null;
    }

    return this.props.children; // Render children if no error
  }
}

// Prop type validation
ErrorBoundary.propTypes = {
  fallback: PropTypes.element.isRequired, // 'fallback' should be a React element
  children: PropTypes.node.isRequired, // 'children' prop must be a React node
};

export default ErrorBoundary;
