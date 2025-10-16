import dynamic from 'next/dynamic';
import { getSearchPartnersSEOAPI } from '@/api/apiService';
import { sanitizeHTML } from "@/utils/helpers";

// Components
import SEO from '@/components/SEO';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setHeadSeo_ACTION } from '@/store/headSeoSlice';
const SearchSites = dynamic(() => import('@/components/SearchSites'), { ssr: false });

export async function getServerSideProps(context) {
    try {
        const { q: keyword = '', page = 1 } = context.query;

        const seoData = await getSearchPartnersSEOAPI({
            searchKeyword: sanitizeHTML(keyword.trim()),
            page: Number(page) || 1
        });

        return {
            props: {
                seoData: seoData || {},
                initialKeyword: keyword,
                initialPage: Number(page) || 1
            }
        };
    } catch (error) {
        console.error('Error fetching server props:', error);
        return {
            props: {
                seoData: {},
                initialKeyword: '',
                initialPage: 1
            }
        };
    }
}

export default function SearchSitesPage({ seoData, initialKeyword, initialPage }) {
    const dispatch = useDispatch();
    useEffect(() => {
        if (seoData && Object.keys(seoData).length > 0) {
            dispatch(setHeadSeo_ACTION(seoData));
        }
    }, [seoData, dispatch]);
    return (
        <>
            <SEO seoData={seoData} />
            <SearchSites
                initialKeyword={initialKeyword}
                initialPage={initialPage}
            />
        </>
    );
}