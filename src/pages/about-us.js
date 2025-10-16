import dynamic from 'next/dynamic';
import { getPageAboutSEOAPI } from '@/api/apiService';

// Component
import SEO from '@/components/SEO';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setHeadSeo_ACTION } from '@/store/headSeoSlice';
// Dynamic import (lazy load AboutUs component)
const AboutUs = dynamic(() => import('@/components/AboutUs'), {
    ssr: false,
    loading: () => null
});
export async function getStaticProps() {
    try {
        const seoData = await getPageAboutSEOAPI();
        return {
            props: { seoData }
        };
    } catch (error) {
        console.error('SEO Fetch Error:', error);
        return {
            props: { seoData: {} }
        };
    }
}

export default function AboutUsPage({ seoData }) {
    const dispatch = useDispatch();
    useEffect(() => {
        if (seoData && Object.keys(seoData).length > 0) {
            dispatch(setHeadSeo_ACTION(seoData));
        }
    }, [seoData, dispatch]); // Dependency array ensures dispatch only on seoData change


    return (
        <>
            <SEO seoData={seoData} /> {/* SEO loads immediately in static HTML */}
            <AboutUs /> {/* Lazy-loaded on client-side */}
        </>
    );
}