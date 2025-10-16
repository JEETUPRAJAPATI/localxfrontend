import PropTypes from "prop-types"; // Import PropTypes for validation

const ErrorPage = ({ error }) => {
  return (
    <div className="error-page">
      <h1>Error Occurred 🚨</h1>
      <p>Can&apos;t render page. Please try again.</p>
      {error && (
        <div className="error-details">
          <h3>Error Details:</h3>
          <p>{error.message || "An unknown error occurred."}</p>
        </div>
      )}
    </div>
  );
};

// Prop type validation
ErrorPage.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
};

export default ErrorPage;
