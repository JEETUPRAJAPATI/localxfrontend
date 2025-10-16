import dynamic from 'next/dynamic';
import { useEffect } from 'react';

import { getAuthResetPasswordSEOAPI } from '@/api/apiService';
import { useDispatch } from "react-redux";
import { setHeadSeo_ACTION } from "@/store/headSeoSlice";
// Component
import SEO from '@/components/SEO';
const ResetPasswordVerification = dynamic(() => import('@/components/ResetPasswordVerification'), {
    ssr: false,
    loading: () => null
});

export async function getStaticProps() {
    try {
        const seoData = await getAuthResetPasswordSEOAPI();
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

export default function ResetPasswordVerificationPage({ seoData }) {
    const dispatch = useDispatch();
    useEffect(() => {
        if (seoData && Object.keys(seoData).length > 0) {
            dispatch(setHeadSeo_ACTION(seoData));
        }
    }, [seoData, dispatch]); // Dependency array ensures dispatch only on seoData change

    return (
        <>
            <SEO seoData={seoData} /> {/* SEO loads immediately in static HTML */}
            <ResetPasswordVerification /> {/* Lazy-loaded on client-side */}
        </>
    );
}