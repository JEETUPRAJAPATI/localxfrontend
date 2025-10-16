import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getUserProfileSEOAPI } from '@/api/apiAuthService';
import { setHeadSeo_ACTION } from '@/store/headSeoSlice';
import SEO from '@/components/SEO';

const UserViewProfile = dynamic(() => import('@/components/UserViewProfile'), {
    ssr: false,
    loading: () => null
});

export async function getStaticProps() {
    try {
        const seoData = await getUserProfileSEOAPI();
        return {
            props: { seoData: seoData || {} }};
    } catch (error) {
        console.error('SEO Fetch Error:', error);
        return {
            props: { seoData: {} }};
    }
}

export default function UserViewProfilePage({ seoData }) {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setHeadSeo_ACTION(seoData));
    }, [seoData, dispatch]);

    return (
        <>
            <SEO seoData={seoData} />
            <UserViewProfile />
        </>
    );
}