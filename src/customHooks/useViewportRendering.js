import { useState, useEffect, useRef } from 'react';

const useViewportRendering = (items, options = {}) => {
  const [visibleItems, setVisibleItems] = useState([]);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef(null);
  const observerRef = useRef(null);

  const {
    threshold = 0.1,
    rootMargin = '50px',
    initialRender = 5, // Render first 5 items immediately
    batchSize = 10, // Render 10 more items at a time
  } = options;

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !items || items.length === 0) return;

    // Initially render only a few items
    setVisibleItems(items.slice(0, initialRender));
    setIsIntersecting(false);

    // Set up intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
          }
        });
      },
      { threshold, rootMargin }
    );

    observerRef.current = observer;

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isClient, items, threshold, rootMargin, initialRender]);

  useEffect(() => {
    if (!isClient || !isIntersecting || !items) return;

    // Gradually render more items
    const timer = setTimeout(() => {
      setVisibleItems((prev) => {
        const nextBatch = items.slice(0, prev.length + batchSize);
        return nextBatch.length >= items.length ? items : nextBatch;
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [isClient, isIntersecting, items, batchSize]);

  // Return all items on server side to prevent hydration mismatch
  if (!isClient) {
    return {
      visibleItems: items || [],
      containerRef,
      isIntersecting: false,
    };
  }

  return {
    visibleItems,
    containerRef,
    isIntersecting,
  };
};

export default useViewportRendering;
