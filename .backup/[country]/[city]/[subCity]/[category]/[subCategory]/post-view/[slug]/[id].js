import dynamic from 'next/dynamic';
import { unslugify } from '@/utils/helpers';
import { getPostDetailSEOAPI } from '@/api/apiService';
import SEO from '@/components/SEO';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setHeadSeo_ACTION } from '@/store/headSeoSlice';
const PostDetail = dynamic(() => import('@/components/PostDetail'), {
    ssr: false,
});

export async function getStaticPaths() {
    // You might want to pre-generate popular posts
    return {
        paths: [], // Empty array means no pages pre-generated at build time
        fallback: 'blocking', // Server-render new pages on demand
    };
}

export async function getStaticProps({ params }) {
    const {
        country,
        city,
        subCity,
        category,
        subCategory,
        id
    } = params;

    try {

        const [seoData] = await Promise.all([
            await getPostDetailSEOAPI(
                unslugify(country),
                unslugify(city),
                unslugify(subCity),
                unslugify(category),
                unslugify(subCategory),
                id,
            ),
        ]);
        // Only return notFound if it's truly invalid

        if (!seoData || !seoData.title) {
            return { notFound: true };
        }
        return {
            props: {
                seoData,
            },
            revalidate: 60
        };
    } catch (error) {
        console.error('Data fetch error:', error);
        return {
            props: {
                seoData: {},
                params: {}
            },
            revalidate: 60 // Fallback to 1 minute if error occurs
        };
    }
}

export default function PostDetailPage({ seoData }) {
    const dispatch = useDispatch();

    useEffect(() => {
        if (seoData && Object.keys(seoData).length > 0) {
            dispatch(setHeadSeo_ACTION(seoData));
        }
    }, [seoData, dispatch]);

    return (
        <>
            <SEO seoData={seoData} />
            <PostDetail />
        </>
    );
}