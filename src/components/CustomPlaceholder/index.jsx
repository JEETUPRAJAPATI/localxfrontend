import { memo } from 'react';
import PropTypes from 'prop-types';

import { Placeholder } from 'react-bootstrap';

const CustomPlaceholder = ({
  as = 'div',
  type = '', // "button" for Placeholder.Button, empty for Placeholder
  widths = {}, // Object with multiple width properties (e.g., { xs: 6, lg: 12 })
  // variant = 'primary', // Variant for Placeholder.Button
  className = 'custom', // Additional class names
  size = 'lg', // Size for Placeholder.Button
  style = {}, // Inline styles
  outerStyle = {}, // Inline styles
  animation = 'glow', // animation e.g. glow, wave
  bg = 'light', // Background for Placeholder
  InnerBg = 'secondary', // Background for Placeholder
  ...props
}) => {
  return (
    <>
      {type === 'button' ? (
        <Placeholder.Button
          {...props}
          // variant={variant}
          // size={size}
          // {...widths} // Spread all width props dynamically
        />
      ) : (
        <Placeholder as={as} animation={animation} className={className} bg={bg} style={outerStyle}>
          <Placeholder
            bg={InnerBg}
            className={`h-100 ${Object.keys(widths).length === 0 ? 'w-100' : ''}`}
            {...widths}
            style={{ borderRadius: '3px', ...style }}
            size={size}
          />
        </Placeholder>
      )}{' '}
    </>
  );
};

CustomPlaceholder.propTypes = {
  type: PropTypes.string, // "button" for Placeholder.Button
  as: PropTypes.string, // HTML element (e.g., 'div', 'span') for Placeholder
  widths: PropTypes.object, // Object containing width properties (e.g., { xs: 6, lg: 12 })
  size: PropTypes.string, // Size for Placeholder.Button (e.g., 'sm', 'lg')
  animation: PropTypes.string, // animation for Placeholder (e.g., 'glow', 'wave')
  bg: PropTypes.string, // Background color for Placeholder
  InnerBg: PropTypes.string, // Background color for Placeholder
  variant: PropTypes.string, // Variant for Placeholder.Button
  className: PropTypes.string, // Additional CSS class names
  style: PropTypes.object, // Inline styles
  outerStyle: PropTypes.object, // Inline styles
};

export default memo(CustomPlaceholder);
