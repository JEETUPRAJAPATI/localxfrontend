import dynamic from 'next/dynamic';
import { getPageTermsSEOAPI } from '@/api/apiService';

// Component
import SEO from '@/components/SEO';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setHeadSeo_ACTION } from '@/store/headSeoSlice';
// Dynamic import (lazy load Terms component)
const Terms = dynamic(() => import('@/components/Terms'), {
    ssr: false,
    loading: () => null
});
export async function getStaticProps() {
    try {
        const seoData = await getPageTermsSEOAPI();
        return {
            props: { seoData },
            revalidate: 60, // Regenerate page every 60 seconds
        };
    } catch (error) {
        console.error('SEO Fetch Error:', error);
        return {
            props: { seoData: {} },
            revalidate: 60, // Still revalidate on error to retry
        };
    }
}

export default function TermsPage({ seoData }) {
    const dispatch = useDispatch();
    useEffect(() => {
        if (seoData && Object.keys(seoData).length > 0) {
            dispatch(setHeadSeo_ACTION(seoData));
        }
    }, [seoData, dispatch]); // Dependency array ensures dispatch only on seoData change

    return (
        <>
            <SEO seoData={seoData} /> {/* SEO loads immediately in static HTML */}
            <Terms /> {/* Lazy-loaded on client-side */}
        </>
    );
}