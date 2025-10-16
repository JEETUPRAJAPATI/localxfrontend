import dynamic from 'next/dynamic';
import { getPartnersAddSEOAPI } from '@/api/apiService';

// Component
import SEO from '@/components/SEO';
// Dynamic import (lazy load PartnerAdd component)
const PartnerAdd = dynamic(() => import('@/components/PartnerAdd'), {
    ssr: false,
    loading: () => null
});
export async function getStaticProps() {
    try {
        const seoData = await getPartnersAddSEOAPI();
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

export default function PartnerAddPage({ seoData }) {
    return (
        <>
            <SEO seoData={seoData} /> {/* SEO loads immediately in static HTML */}
            <PartnerAdd /> {/* Lazy-loaded on client-side */}
        </>
    );
}