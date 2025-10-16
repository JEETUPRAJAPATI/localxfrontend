import dynamic from 'next/dynamic';
import { useEffect } from 'react';

import { getUserPostEditSEOAPI } from '@/api/apiAuthService';
import { useDispatch } from "react-redux";
import { setHeadSeo_ACTION } from "@/store/headSeoSlice";
// Component
import SEO from '@/components/SEO';
const UserPostEdit = dynamic(() => import('@/components/UserPostEdit'), {
    ssr: false,
    loading: () => null
});

export async function getStaticPaths() {
    // You might want to pre-generate popular posts
    return {
        paths: [], // Empty array means no pages pre-generated at build time
        fallback: 'blocking', // Server-render new pages on demand
    };
}
export async function getStaticProps() {
    try {
        const seoData = await getUserPostEditSEOAPI();
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

export default function UserPostEditPage({ seoData }) {
    const dispatch = useDispatch();
    useEffect(() => {
        if (seoData && Object.keys(seoData).length > 0) {
            dispatch(setHeadSeo_ACTION(seoData));
        }
    }, [seoData, dispatch]); // Dependency array ensures dispatch only on seoData change

    return (
        <>
            <SEO seoData={seoData} /> {/* SEO loads immediately in static HTML */}
            <UserPostEdit /> {/* Lazy-loaded on client-side */}
        </>
    );
}