// src/components/CustomLazyLoadContent/index.jsx
import { InView } from "react-intersection-observer";

const LazyContent = ({ content, as = "div", height = "45px", ...props }) => {
  return (
    <InView
      as={as}
      triggerOnce={true}
      rootMargin="300px 0px" // Load earlier to reduce delay
      threshold={0.1} // Trigger when 10% of element is visible
      {...props}
    >
      {({ inView, ref }) => (
        <div
          ref={ref}
          style={{
            minHeight: height, // Use minHeight to ensure space is reserved
            background: "transparent",
            transition: "opacity 0.3s ease-in-out", // Smooth fade-in
            opacity: inView ? 1 : 0.2, // Fade from slight opacity to full
          }}
          aria-hidden={!inView} // Hide placeholder from screen readers
        >
          {inView && content} {/* Render content only when in view */}
        </div>
      )}
    </InView>
  );
};

export default LazyContent;

// Use in your component
{
  /* <div className="about-section">
  <LazyContent content={dashboardContent_DATA} />
</div> */
}
