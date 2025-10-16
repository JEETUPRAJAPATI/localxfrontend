import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { getUserAddPostSEOAPI } from '@/api/apiAuthService';
import { setHeadSeo_ACTION } from '@/store/headSeoSlice';
import SEO from '@/components/SEO';

const UserPostSaveMessage = dynamic(() => import('@/components/UserPostSaveMessage'), {
    ssr: false,
    loading: () => null,
});

export async function getStaticProps() {
    try {
        const seoData = await getUserAddPostSEOAPI();
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

export default function UserPostSaveMessagePage({ seoData }) {
    const dispatch = useDispatch();

    useEffect(() => {
        if (seoData && Object.keys(seoData).length > 0) {
            dispatch(setHeadSeo_ACTION(seoData));
        }
    }, [seoData, dispatch]);

    return (
        <>
            <SEO seoData={seoData} />
            <UserPostSaveMessage />
        </>
    );
}