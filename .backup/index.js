import dynamic from 'next/dynamic';
import { 
  getHomeSEOAPI, 
  getHomeTopNoticeAPI, 
  getHomeCountriesAPI, 
  getHomeDashboardContentAPI, 
  getHomePartnersAPI, 
  getHomeSponsersAPI, 
  getPageCommonSettingsAPI 
} from '@/api/apiService.server';
// Component
import SEO from '@/components/SEO';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setHeadSeo_ACTION } from '@/store/headSeoSlice';
const Home = dynamic(() => import('@/components/Home'));
export async function getStaticProps() {
  try {
    // Fetch all data in parallel for better performance
    const [
      seoData,
      topNotice,
      countries,
      dashboardContent,
      partners,
      sponsers,
      pageSettings,
    ] = await Promise.all([
      getHomeSEOAPI().catch((error) => {
        console.error('Error in getHomeSEOAPI:', error);
        return {};
      }),
      getHomeTopNoticeAPI().catch((error) => {
        console.error('Error in getHomeTopNoticeAPI:', error);
        return '';
      }),
      getHomeCountriesAPI().catch((error) => {
        console.error('Error in getHomeCountriesAPI:', error);
        return [];
      }),
      getHomeDashboardContentAPI().catch((error) => {
        console.error('Error in getHomeDashboardContentAPI:', error);
        return '';
      }),
      getHomePartnersAPI().catch((error) => {
        console.error('Error in getHomePartnersAPI:', error);
        return [];
      }),
      getHomeSponsersAPI({ deviceWidth: 1920 }).catch((error) => {
        console.error('Error in getHomeSponsersAPI:', error);
        return [];
      }),
      getPageCommonSettingsAPI().catch((error) => {
        console.error('Error in getPageCommonSettingsAPI:', error);
        return {};
      }),
    ]);

    // Debug logging
    console.log('getStaticProps data:', {
      seoData,
      topNotice,
      countries,
      dashboardContent,
      partners,
      sponsers,
      pageSettings,
    });

    return {
      props: {
        seoData,
        headLogo: seoData?.image || '/images/logo.png',
        // Pass all data to component
        initialData: {
          topNotice,
          countries,
          dashboardContent,
          partners,
          sponsers,
          pageSettings,
        },
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Static Props Fetch Error:', error);
    return {
      props: { 
        seoData: {}, 
        headLogo: '',
        initialData: {
          topNotice: '',
          countries: [],
          dashboardContent: '',
          partners: [],
          sponsers: [],
          pageSettings: {},
        },
      },
      revalidate: 60,
    };
  }
}
export default function HomePage({ seoData, headLogo, initialData }) {
  const dispatch = useDispatch();
  useEffect(() => {
    if (seoData && Object.keys(seoData).length > 0) {
      dispatch(setHeadSeo_ACTION(seoData));
    }
  }, [seoData, dispatch]); // Dependency array ensures dispatch only on seoData change

  return (
    <>
      <SEO seoData={seoData} />
      <Home headLogo={headLogo} initialData={initialData} />
    </>
  );
}