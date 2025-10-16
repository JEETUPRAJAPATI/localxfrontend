import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { getUserDashboardSEOAPI } from '@/api/apiAuthService';
import { setHeadSeo_ACTION } from '@/store/headSeoSlice';
import SEO from '@/components/SEO';

const UserDashboard = dynamic(() => import('@/components/UserDashboard'), {
    ssr: false,
    loading: () => null,
});

export async function getStaticProps() {
    try {
        const seoData = await getUserDashboardSEOAPI();
        return {
            props: { seoData },
            revalidate: 60,
        };
    } catch (error) {
        console.error('SEO Fetch Error:', error);
        return {
            props: { seoData: {} },
            revalidate: 60,
        };
    }
}

export default function UserDashboardPage({ seoData }) {
    const dispatch = useDispatch();

    useEffect(() => {
        if (seoData && Object.keys(seoData).length > 0) {
            dispatch(setHeadSeo_ACTION(seoData));
        }
    }, [seoData, dispatch]);

    return (
        <>
            <SEO seoData={seoData} />
            <UserDashboard />
        </>
    );
}