import { useEffect, useState, memo, useCallback, useRef } from "react";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const observerRef = useRef(null);

  const toggleVisibility = useCallback(() => {
    const scrollY = window.pageYOffset;
    setIsVisible(scrollY > 300);
  }, []);

  const scrollToTop = useCallback(() => {
    window?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    // Only run on client side to prevent hydration mismatch
    if (typeof window === 'undefined') return;
    
    // Use intersection observer to only render when needed
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldRender(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    observerRef.current = observer;
    
    // Start observing after a delay to avoid initial render
    const timer = setTimeout(() => {
      const footer = document.querySelector('.footer');
      if (footer) {
        observer.observe(footer);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!shouldRender) return;

    // Debounced scroll handler
    let timeoutId;
    const debouncedScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(toggleVisibility, 16); // ~60fps
    };

    window.addEventListener("scroll", debouncedScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", debouncedScroll);
      clearTimeout(timeoutId);
    };
  }, [shouldRender, toggleVisibility]);

  // Only render when needed
  if (!shouldRender) return null;

  return (
    <Button
      className={`scroll-to-top ${isVisible ? "visible" : ""}`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <FontAwesomeIcon icon={faArrowUp} />
    </Button>
  );
};

export default memo(ScrollToTopButton);
