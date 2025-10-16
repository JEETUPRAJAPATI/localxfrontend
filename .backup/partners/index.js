import dynamic from 'next/dynamic';
import { getPartnersSEOAPI, getPartnersAPI, getPartnersContentAPI } from '@/api/apiService';

// Component
import SEO from '@/components/SEO';
import { useDispatch } from 'react-redux';
import { setHeadSeo_ACTION } from '@/store/headSeoSlice';
import { useEffect } from 'react';
// Dynamic import (lazy load PartnerList component)
const PartnerList = dynamic(() => import('@/components/PartnerList'), { ssr: false });

export async function getStaticProps() {
    try {
        const [seoData, partners, partnersContent] = await Promise.all([
            getPartnersSEOAPI().catch((err) => {
                console.error('Error fetching SEO data:', err.message);
                return {};
            }),
            getPartnersAPI().catch((err) => {
                console.error('Error fetching partners:', err.message);
                return [];
            }),
            getPartnersContentAPI().catch((err) => {
                console.error('Error fetching partners content:', err.message);
                return '';
            }),
        ]);

        return {
            props: {
                seoData: seoData || {},
                initialPartners: partners || [],
                initialPartnersContent: partnersContent || '',
            },
            revalidate: 60,
        };
    } catch (error) {
        console.error('Unexpected error in getStaticProps:', error);
        return {
            props: {
                seoData: {},
                initialPartners: [],
                initialPartnersContent: '',
            },
            revalidate: 60,
        };
    }
}

export default function PartnerListPage({ seoData, initialPartners, initialPartnersContent }) {
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