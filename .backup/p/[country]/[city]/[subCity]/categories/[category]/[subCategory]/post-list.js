import dynamic from 'next/dynamic';
import {
    getPostSEOAPI,
} from '@/api/apiService';
import SEO from '@/components/SEO';
import { unslugify } from '@/utils/helpers';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setHeadSeo_ACTION } from '@/store/headSeoSlice';

const PostList = dynamic(() => import('@/components/PostList'), {
    ssr: false,
});

// Updated automatically after a specific interval ✅
// 1. Generate static paths for all possible combinations
export async function getStaticPaths() {
    // You might want to pre-generate popular posts
    return {
        paths: [], // Empty array means no pages pre-generated at build time
        fallback: 'blocking', // Server-render new pages on demand
    };
}


// 2. Fetch data for each static path with ISR
export async function getStaticProps({ params }) {
    console.log("Generating page for:", params);

    try {
        const { country, city, subCity, category, subCategory } = params;
        // Validate params early
        if (!country || !city || !subCity || !category || !subCategory) {
            return { notFound: true };
        }

        // Convert URL slugs back to original names
        const paramsObj = {
            country: unslugify(country),
            city: unslugify(city),
            subCity: unslugify(subCity),
            category: unslugify(category),
            subCategory: unslugify(subCategory)
        };

        // Fetch data in parallel
        const [seoData] = await Promise.all([
            await getPostSEOAPI(paramsObj),
        ]);
        // Only return notFound if it's truly invalid

        if (!seoData || !seoData.title) {
            return { notFound: true };
        }
        return {
            props: {
                seoData,
                params: paramsObj
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

// export async function getServerSideProps({ params }) {
//     const { country, city, subCity, category, subCategory } = params;

//     const paramsObj = {
//         country: unslugify(country),
//         city: unslugify(city),
//         subCity: unslugify(subCity),
//         category: unslugify(category),
//         subCategory: unslugify(subCategory)
//     };

//     // Fetch data in parallel
//     const seoData = await getPostSEOAPI(paramsObj);

//     return { props: { seoData } };
// }



export default function PostListPage({ seoData }) {
    const dispatch = useDispatch();
    useEffect(() => {
        if (seoData && Object.keys(seoData).length > 0) {
            dispatch(setHeadSeo_ACTION(seoData));
        }
    }, [seoData, dispatch]);
    return (
        <>
            <SEO seoData={seoData} />
            <PostList />
        </>
    );
}
