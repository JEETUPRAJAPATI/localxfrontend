import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useDispatch } from "react-redux";
import { getCategorySEOAPI } from '@/api/apiService';
import { unslugify } from '@/utils/helpers';
import { setHeadSeo_ACTION } from "@/store/headSeoSlice";

// Component
import SEO from '@/components/SEO';
const CategoryList = dynamic(() => import('@/components/CategoriesList'), { ssr: false });
export function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking'
  };
}
export async function getStaticProps({ params }) {
  console.log("Generating page for:", params);
  // Destructuring MUST match your folder names exactly:
  const { country, city, subCity } = params;

  // Validate params early
  if (!country || !city || !subCity) {
    return { notFound: true };
  }

  try {
    // Fetch SEO data for this specific location
    const [seoData] = await Promise.all([
      getCategorySEOAPI(unslugify(country), unslugify(city), unslugify(subCity)),
    ]);

    // Only return notFound if it's truly invalid
    if (!seoData || !seoData.title) {
      return { notFound: true };
    }

    return {
      props: {
        seoData,
        params: {
          country: unslugify(country),
          city: unslugify(city),
          subCity: unslugify(subCity),
        },
      }};
  } catch (error) {
    console.error('SEO Fetch Error:', error);

    return {
      props: {
        seoData: {},
        params: {
          country: unslugify(country),
          city: unslugify(city),
          subCity: unslugify(subCity),
        },
      }};
  }
}
export default function CategoryListPage({ seoData }) {
  const dispatch = useDispatch();
  useEffect(() => {
    if (seoData && Object.keys(seoData).length > 0) {
      dispatch(setHeadSeo_ACTION(seoData));
    }
  }, [seoData, dispatch]); // Dependency array ensures dispatch only on seoData change

  return (
    <>
      <SEO seoData={seoData} />
      <CategoryList />
    </>
  );
}
