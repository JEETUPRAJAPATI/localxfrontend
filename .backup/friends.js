import dynamic from 'next/dynamic';
import { getFriendsSEOAPI } from '@/api/apiService';
import { createStaticPropsReturn } from '@/utils/staticProps';

// Component
import SEO from '@/components/SEO';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setHeadSeo_ACTION } from '@/store/headSeoSlice';
// Dynamic import (lazy load Friends component)
const Friends = dynamic(() => import('@/components/Friends'), {
    ssr: false,
    loading: () => null
});

export async function getStaticProps() {
    try {
        const seoData = await getFriendsSEOAPI();
        return createStaticPropsReturn({ seoData }, { revalidate: 60 });
    } catch (error) {
        console.error('SEO Fetch Error:', error);
        return createStaticPropsReturn({ seoData: {} }, { revalidate: 60 });
    }
}

export default function FriendsPage({ seoData }) {
    const dispatch = useDispatch();
    useEffect(() => {
        if (seoData && Object.keys(seoData).length > 0) {
            dispatch(setHeadSeo_ACTION(seoData));
        }
    }, [seoData, dispatch]); // Dependency array ensures dispatch only on seoData change
    return (
        <>
            <SEO seoData={seoData} /> {/* SEO loads immediately in static HTML */}
            <Friends /> {/* Lazy-loaded on client-side */}
        </>
    );
}