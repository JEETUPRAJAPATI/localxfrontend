import dynamic from 'next/dynamic';
import { getBlogsAPI, getBlogsSEOAPI } from '@/api/apiService';

import { useDispatch } from 'react-redux';
import { setHeadSeo_ACTION } from '@/store/headSeoSlice';
import { useEffect } from 'react';
// Component
import SEO from '@/components/SEO';
import { setPageProps_ACTION } from '@/store/pageSlice';
// Dynamic import (lazy load PartnerList component)
const BlogList = dynamic(() => import('@/components/Blogs/BlogsByCategory'), { ssr: false });

export async function getServerSideProps({ query, params }) {
    try {
        const { page, keyword } = query;
        const { category } = params; // Destructure from context.params

        const blogQparams = {
            ...(page && { page }),
            ...(keyword && { keyword }),
            ...(category && { category })
        };

        const blogSeoQparams = {
            ...(page && { page }),
            ...(keyword && { keyword }),
            ...(category && { category })
        };
        const [seoData, blogs] = await Promise.all([
            getBlogsSEOAPI(blogSeoQparams).catch((err) => {
                console.error('Error fetching SEO data:', err.message);
                return {};
            }),

            getBlogsAPI(blogQparams).catch((err) => {
                console.error('Error fetching blogs data:', err.message);
                return [];
            })
        ]);

        return {
            props: {
                seoData: seoData || {},
                blogs: blogs || []
            },
        };
    } catch (error) {
        console.error('Unexpected error in getStaticProps:', error);
        return {
            props: {
                seoData: {},
                blogs: []
            },
        };
    }
}

export default function BlogListByCategoryPage({ seoData, blogs }) {
    const dispatch = useDispatch();
    useEffect(() => {
        if (seoData && Object.keys(seoData).length > 0) {
            dispatch(setHeadSeo_ACTION(seoData));
        }
        // Blogs
        dispatch(setPageProps_ACTION({ key: "blog_list", data: blogs.list }));
        dispatch(setPageProps_ACTION({ key: "blog_list_pagination", data: blogs.pagination }));
        dispatch(setPageProps_ACTION({ key: "blog_list_category", data: blogs.category }));

    }, [seoData, blogs, dispatch]);

    return (
        <>
            <SEO seoData={seoData} />
            <BlogList />
        </>
    );
}