import dynamic from 'next/dynamic';
import { getPartnersSEOAPI, getPartnersAPI, getPartnersContentAPI } from '@/api/apiService';

// Component
import SEO from '@/components/SEO';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setHeadSeo_ACTION } from '@/store/headSeoSlice';
// Dynamic import (lazy load PartnerList component)
const PartnerList = dynamic(() => import('@/components/PartnerList'), { ssr: false });

export async function getStaticProps() {
    try {
        // Fetch all necessary data in parallel
        const [seoData, partners, partnersContent] = await Promise.all([
            getPartnersSEOAPI(),
            getPartnersAPI(),
            getPartnersContentAPI(),
        ]);

        return {
            props: {
                seoData,
                initialPartners: partners || [],
                initialPartnersContent: partnersContent || '',
            }
        };
    } catch (error) {
        console.error('Error fetching static props:', error);
        return {
            props: {
                seoData: {},
                initialPartners: [],
                initialPartnersContent: '',
            }
        };
    }
}

export default function SiteLinksPage({ seoData, initialPartners, initialPartnersContent }) {
    const dispatch = useDispatch();
    useEffect(() => {
        if (seoData && Object.keys(seoData).length > 0) {
            dispatch(setHeadSeo_ACTION(seoData));
        }
    }, [seoData, dispatch]);
    return (
        <>
            <SEO seoData={seoData} />
            <PartnerList initialPartners={initialPartners} initialPartnersContent={initialPartnersContent} />
        </>
    );
}