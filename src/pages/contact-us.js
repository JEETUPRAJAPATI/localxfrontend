import dynamic from 'next/dynamic';
import { getPageContactSEOAPI } from '@/api/apiService';

// Component
import SEO from '@/components/SEO';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setHeadSeo_ACTION } from '@/store/headSeoSlice';
// Dynamic import (lazy load ContactUs component)
const ContactUs = dynamic(() => import('@/components/ContactUs'), { ssr: false });

export async function getStaticProps() {
    try {
        const seoData = await getPageContactSEOAPI();
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

export default function ContactUsPage({ seoData }) {
    const dispatch = useDispatch();
    useEffect(() => {
        if (seoData && Object.keys(seoData).length > 0) {
            dispatch(setHeadSeo_ACTION(seoData));
        }
    }, [seoData, dispatch]); // Dependency array ensures dispatch only on seoData change

    return (
        <>
            <SEO seoData={seoData} /> {/* SEO loads immediately in static HTML */}
            <ContactUs /> {/* Lazy-loaded on client-side */}
        </>
    );
}