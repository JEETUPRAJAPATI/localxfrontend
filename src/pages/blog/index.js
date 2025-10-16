import dynamic from 'next/dynamic';
import { getBlogCategoriesAPI, getBlogsAPI, getBlogsSEOAPI } from '@/api/apiService';

import { useDispatch } from 'react-redux';
import { setHeadSeo_ACTION } from '@/store/headSeoSlice';
import { useEffect } from 'react';
// Component
import SEO from '@/components/SEO';
import { setPageProps_ACTION } from '@/store/pageSlice';
// Dynamic import (lazy load PartnerList component)
const BlogList = dynamic(() => import('@/components/Blogs'), { ssr: false });

export async function getServerSideProps(context) {
    try {
        const { page, keyword } = context.query;
        const params = {
            ...(page && { page }),
            ...(keyword && { keyword })
        };
        const [seoData, blogCategories, blogs] = await Promise.all([
            getBlogsSEOAPI().catch((err) => {
                console.error('Error fetching SEO data:', err.message);
                return {};
            }),
            getBlogCategoriesAPI().catch((err) => {
                console.error('Error fetching blog categories data:', err.message);
                return [];
            }),
            getBlogsAPI(params).catch((err) => {
                console.error('Error fetching blogs data:', err.message);
                return [];
            })
        ]);

        return {
            props: {
                seoData: seoData || {},
                blogCategories: blogCategories || [],
                blogs: blogs || []
            },
        };
    } catch (error) {
        console.error('Unexpected error in getStaticProps:', error);
        return {
            props: {
                seoData: {},
                blogCategories: [],
                blogs: []
            },
        };
    }
}

export default function BlogListPage({ seoData, blogCategories, blogs }) {
    const dispatch = useDispatch();
    useEffect(() => {
        if (seoData && Object.keys(seoData).length > 0) {
            dispatch(setHeadSeo_ACTION(seoData));
        }
        // Blog Categories
        dispatch(setPageProps_ACTION({ key: "blogCategories", data: blogCategories }));

        // Blogs
        dispatch(setPageProps_ACTION({ key: "blog_list", data: blogs.list }));
        dispatch(setPageProps_ACTION({ key: "blog_list_pagination", data: blogs.pagination }));

    }, [seoData, blogCategories, blogs, dispatch]);

    return (
        <>
            <SEO seoData={seoData} />
            <BlogList />
        </>
    );
}