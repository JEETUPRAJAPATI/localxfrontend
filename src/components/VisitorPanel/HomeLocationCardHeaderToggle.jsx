"use client";
import PropTypes from "prop-types";
import { memo, useCallback } from "react";
import styles from "@/styles/home.module.scss";

const CardHeaderToggle = memo(
  ({ mainKeyId, defaultActiveKeys, children, value, onToggle = null }) => {
    const isExpanded = defaultActiveKeys.includes(value);

    const handleClick = useCallback(() => {
      if (onToggle) onToggle(value);
    }, [value, onToggle]);
    return (
      <div
        role="button" // Add ARIA role to indicate it's a button
        id={`toggle-${mainKeyId}`} // Add ID for aria-labelledby
        aria-expanded={isExpanded}
        aria-controls={mainKeyId}
        onClick={handleClick}
        onKeyDown={(e) => {
          // Add keyboard accessibility
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className={styles.cardHeader}
        tabIndex={0} // Make the element focusable
        style={{ cursor: "pointer" }} // Visual cue for interactivity
      >
        {children}
      </div>
    );
  }
);
CardHeaderToggle.displayName = "CardHeaderToggle";
CardHeaderToggle.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired,
  onToggle: PropTypes.func,
  mainKeyId: PropTypes.string.isRequired, // Unique identifier for the main key
  defaultActiveKeys: PropTypes.arrayOf(PropTypes.string), // Array of strings
};

export default CardHeaderToggle;
