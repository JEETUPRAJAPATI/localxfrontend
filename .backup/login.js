import dynamic from 'next/dynamic';
import { useEffect } from 'react';

import { getAuthLoginSEOAPI } from '@/api/apiService';
import { useDispatch } from "react-redux";
import { setHeadSeo_ACTION } from "@/store/headSeoSlice";
// Component
import SEO from '@/components/SEO';

// Dynamic import (lazy load Login component)
const Login = dynamic(() => import('@/components/Login'), {
    ssr: false,
    loading: () => null
});

export async function getStaticProps() {
    try {
        const seoData = await getAuthLoginSEOAPI();
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

export default function LoginPage({ seoData }) {
    const dispatch = useDispatch();
    useEffect(() => {
        if (seoData && Object.keys(seoData).length > 0) {
            dispatch(setHeadSeo_ACTION(seoData));
        }
    }, [seoData, dispatch]); // Dependency array ensures dispatch only on seoData change

    return (
        <>
            <SEO seoData={seoData} /> {/* SEO loads immediately in static HTML */}
            <Login /> {/* Lazy-loaded on client-side */}
        </>
    );
}