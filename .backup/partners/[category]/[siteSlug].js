import dynamic from 'next/dynamic';
import { getDetailPartnerByCategorySEOAPI } from '@/api/apiService';
import { unslugify } from "@/utils/helpers";

// Component
import SEO from '@/components/SEO';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setHeadSeo_ACTION } from '@/store/headSeoSlice';
// Dynamic import (lazy load PartnerCategoryDetail component)
const PartnerCategoryDetail = dynamic(() => import('@/components/PartnerCategoryDetail'), {
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

export async function getStaticProps({ params }) {
    try {
        const { category, siteSlug } = params; // Destructure from context.params

        const seoData = await getDetailPartnerByCategorySEOAPI(unslugify(category), unslugify(siteSlug));

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

export default function PartnerCategoryDetailPage({ seoData }) {
    const dispatch = useDispatch();
    useEffect(() => {
        if (seoData && Object.keys(seoData).length > 0) {
            dispatch(setHeadSeo_ACTION(seoData));
        }
    }, [seoData, dispatch]);

    return (
        <>
            <SEO seoData={seoData} /> {/* SEO loads immediately in static HTML */}
            <PartnerCategoryDetail /> {/* Lazy-loaded on client-side */}
        </>
    );
}