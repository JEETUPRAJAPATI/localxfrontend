import { getBlogDetailAPI, getBlogDetailSEOAPI } from '@/api/apiService';
import dynamic from 'next/dynamic';

import { setHeadSeo_ACTION } from '@/store/headSeoSlice';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
// Component
import SEO from '@/components/SEO';
import { setPageProps_ACTION } from '@/store/pageSlice';
// Dynamic import (lazy load PartnerList component)
const BlogDetail = dynamic(() => import('@/components/Blogs/BlogDetail'), { ssr: false });

export async function getServerSideProps({ params }) {
    try {
        const { slug = '' } = params; // Destructure from context.params
        const [seoData, blogDetail] = await Promise.all([
            getBlogDetailSEOAPI(slug).catch((err) => {
                console.error('Error fetching SEO data:', err.message);
                return {};
            }),

            getBlogDetailAPI(slug).catch((err) => {
                console.error('Error fetching blogs data:', err.message);
                return {};
            })
        ]);

        return {
            props: {
                seoData: seoData || {},
                blogDetail: blogDetail || {}
            },
        };
    } catch (error) {
        console.error('Unexpected error in getStaticProps:', error);
        return {
            props: {
                seoData: {},
                blogDetail: {}
            },
        };
    }
}

export default function BlogDetailPage({ seoData, blogDetail }) {
    const dispatch = useDispatch();
    useEffect(() => {
        if (seoData && Object.keys(seoData).length > 0) {
            dispatch(setHeadSeo_ACTION(seoData));
        }
        // Blogs
        dispatch(setPageProps_ACTION({ key: "blog_detail", data: blogDetail }));

    }, [seoData, blogDetail, dispatch]);

    return (
        <>
            <SEO seoData={seoData} blogDetail={blogDetail} />
            <BlogDetail />
        </>
    );
}