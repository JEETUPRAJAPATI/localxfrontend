import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { getUserRechargeBalanceSEOAPI } from '@/api/apiAuthService';
import { setHeadSeo_ACTION } from '@/store/headSeoSlice';
import SEO from '@/components/SEO';

const UserRechargeBalance = dynamic(() => import('@/components/UserRechargeBalance'), {
    ssr: false,
    loading: () => null,
});

export async function getStaticProps() {
    try {
        const seoData = await getUserRechargeBalanceSEOAPI();
        return {
            props: { seoData }};
    } catch (error) {
        console.error('SEO Fetch Error:', error);
        return {
            props: { seoData: {} }};
    }
}

export default function UserRechargeBalancePage({ seoData }) {
    const dispatch = useDispatch();

    useEffect(() => {
        if (seoData && Object.keys(seoData).length > 0) {
            dispatch(setHeadSeo_ACTION(seoData));
        }
    }, [seoData, dispatch]);

    return (
        <>
            <SEO seoData={seoData} />
            <UserRechargeBalance />
        </>
    );
}