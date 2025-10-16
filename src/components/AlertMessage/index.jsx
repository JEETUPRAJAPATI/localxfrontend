import { useState, useEffect, memo } from "react";
import { Alert } from "react-bootstrap";
import PropTypes from "prop-types";

const AlertMessage = ({
  type = "info",
  message = "This is an alert message.",
  show = true,
  onClose = null,
  className = "",
  style = {},
  showDismissible = true,
  showHeading = true,
  errors = [],
}) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show); // Sync visible state with the show prop when it changes
  }, [show]);

  // Define colors and styles for each alert type
  const alertStyles = {
    success: { borderColor: "#28a745", borderBottomWidth: "4px" },
    error: { borderColor: "#dc3545", borderBottomWidth: "4px" },
    warning: { borderColor: "#ffc107", borderBottomWidth: "4px" },
    info: { borderColor: "#17a2b8", borderBottomWidth: "4px" },
  };

  const handleClose = () => {
    setVisible(false); // Hide alert locally
    if (onClose) onClose(); // Notify parent component if onClose is provided
  };

  return (
    <>
      {visible && (
        <Alert
          variant={type}
          onClose={handleClose}
          dismissible={showDismissible}
          className={`alert-message ${className}`}
          style={{
            ...alertStyles[type],
            borderBottom: `4px solid ${alertStyles[type].borderColor}`,
            ...style, // User-provided style overrides
          }}
        >
          {showHeading && (
            <Alert.Heading style={{ color: alertStyles[type].borderColor }}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Alert.Heading>
          )}

          {/* Display errors as a list */}
          {errors.length == 0 ? (
            <p style={{ color: alertStyles[type].borderColor }}>{message}</p>
          ) : (
            <ul
              style={{
                color: alertStyles[type].borderColor,
                marginLeft: "2px",
                paddingLeft: "15px",
                marginBottom: "0",
              }}
            >
              {errors.map((error, index) => (
                <li key={index} style={{ marginBottom: "5px" }}>
                  {error}
                </li>
              ))}
            </ul>
          )}
        </Alert>
      )}
    </>
  );
};

AlertMessage.propTypes = {
  type: PropTypes.oneOf(["success", "error", "warning", "info"]),
  message: PropTypes.any,
  show: PropTypes.bool,
  showDismissible: PropTypes.bool,
  showHeading: PropTypes.bool,
  onClose: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
  errors: PropTypes.array,
};

export default memo(AlertMessage);
