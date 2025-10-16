import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getUserChangeProfileSEOAPI } from '@/api/apiAuthService';
import { setHeadSeo_ACTION } from '@/store/headSeoSlice';
import SEO from '@/components/SEO';

const UserChangeProfile = dynamic(() => import('@/components/UserChangeProfile'), {
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
export async function getStaticProps() {
    try {
        const seoData = await getUserChangeProfileSEOAPI();
        return {
            props: { seoData: seoData || {} }};
    } catch (error) {
        console.error('SEO Fetch Error:', error);
        return {
            props: { seoData: {} }};
    }
}

export default function UserChangeProfilePage({ seoData }) {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setHeadSeo_ACTION(seoData));
    }, [seoData, dispatch]);

    return (
        <>
            <SEO seoData={seoData} />
            <UserChangeProfile />
        </>
    );
}