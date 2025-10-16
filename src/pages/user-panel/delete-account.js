import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getUserDeleteAccountSEOAPI } from '@/api/apiAuthService';
import { setHeadSeo_ACTION } from '@/store/headSeoSlice';
import SEO from '@/components/SEO';

const UserDeleteAccount = dynamic(() => import('@/components/UserDeleteAccount'), {
    ssr: false,
    loading: () => null
});

export async function getStaticProps() {
    try {
        const seoData = await getUserDeleteAccountSEOAPI();
        return {
            props: { seoData: seoData || {} }};
    } catch (error) {
        console.error('SEO Fetch Error:', error);
        return {
            props: { seoData: {} }};
    }
}

export default function UserDeleteAccountPage({ seoData }) {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setHeadSeo_ACTION(seoData));
    }, [seoData, dispatch]);

    return (
        <>
            <SEO seoData={seoData} />
            <UserDeleteAccount />
        </>
    );
}