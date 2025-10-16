/**
 * Utility function to handle getStaticProps with conditional revalidation
 * When NEXT_EXPORT is true, removes revalidate to enable static export
 */
export function createStaticProps(propsFunction) {
    return async (context) => {
        const result = await propsFunction(context);
        
        // Remove revalidate when exporting to static files
        if (process.env.NEXT_EXPORT && result.revalidate) {
            const { revalidate: _revalidate, ...rest } = result;
            return rest;
        }
        
        return result;
    };
}

/**
 * Helper function to create getStaticProps return object
 * Automatically handles revalidate based on export mode
 */
export function createStaticPropsReturn(props, options = {}) {
    const { revalidate: _revalidate = 60, ...otherOptions } = options;
    
    const result = {
        props,
        ...otherOptions
    };
    
    // Only add revalidate if not exporting
    if (!process.env.NEXT_EXPORT) {
        result.revalidate = _revalidate;
    }
    
    return result;
}