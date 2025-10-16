import dynamic from 'next/dynamic';
import { useEffect } from 'react';

import { getAuthSignUpVerificationSEOAPI } from '@/api/apiService';
import { useDispatch } from "react-redux";
import { setHeadSeo_ACTION } from "@/store/headSeoSlice";
// Component
import SEO from '@/components/SEO';
const SignupVerification = dynamic(() => import('@/components/SignupVerification'), {
    ssr: false,
    loading: () => null
});

export async function getStaticProps() {
    try {
        const seoData = await getAuthSignUpVerificationSEOAPI();
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

export default function SignupVerificationPage({ seoData }) {
    const dispatch = useDispatch();
    useEffect(() => {
        if (seoData && Object.keys(seoData).length > 0) {
            dispatch(setHeadSeo_ACTION(seoData));
        }
    }, [seoData, dispatch]); // Dependency array ensures dispatch only on seoData change

    return (
        <>
            <SEO seoData={seoData} /> {/* SEO loads immediately in static HTML */}
            <SignupVerification /> {/* Lazy-loaded on client-side */}
        </>
    );
}