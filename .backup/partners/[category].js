import dynamic from 'next/dynamic';
import { getPartnersByCategoryAPI, getPartnersByCategorySEOAPI } from '@/api/apiService';
import { unslugify } from '@/utils/helpers';

// Component
import SEO from '@/components/SEO';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setHeadSeo_ACTION } from '@/store/headSeoSlice';
import { setPartnersByCategoryProps } from '@/store/partnersByCategorySlice';
// Dynamic import (lazy load PartnerCategories component)
const PartnerCategories = dynamic(() => import('@/components/PartnerCategories'), {
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
        const { category } = params; // Destructure from context.params

        const [seoData, partnerData] = await Promise.all([
            getPartnersByCategorySEOAPI(unslugify(category)).catch((err) => {
                console.error('Error fetching SEO data:', err.message);
                return {};
            }),
            getPartnersByCategoryAPI(unslugify(category)).catch((err) => {
                console.error('Error fetching partners:', err.message);
                return {};
            }),
        ]);

        return {
            props: {
                seoData: seoData || {},
                partners: partnerData?.list || [],
                partnerContent: partnerData?.content || "",

            },
            revalidate: 60, // Regenerate page every 60 seconds
        };
    } catch (error) {
        console.error('SEO Fetch Error:', error);
        return {
            props: { seoData: {}, partners: [], partnerContent: '' },
            revalidate: 60, // Still revalidate on error to retry
        };
    }
}

export default function PartnerCategoriesPage({ seoData, partners, partnerContent }) {
    const dispatch = useDispatch();
    useEffect(() => {
        if (seoData && Object.keys(seoData).length > 0) {
            dispatch(setHeadSeo_ACTION(seoData));
        }

        dispatch(setPartnersByCategoryProps({
            key: "list",
            data: partners,
        }));
        dispatch(setPartnersByCategoryProps({
            key: "content",
            data: partnerContent,
        }));

    }, [seoData, partners, partnerContent, dispatch]);
    return (
        <>
            <SEO seoData={seoData} /> {/* SEO loads immediately in static HTML */}
            <PartnerCategories /> {/* Lazy-loaded on client-side */}
        </>
    );
}