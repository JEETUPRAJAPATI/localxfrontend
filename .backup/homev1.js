// src/pages/homev1.js
import { getHomeCountriesV2API, getHomeDashboardContentAPI, getHomePartnersAPI, getHomeSEOAPI, getHomeSponsersAPI, getHomeTopNoticeAPI, getPageCommonSettingsAPI } from '@/api/apiService';
import SEO from '@/components/SEO';
import { setHeadSeo_ACTION } from '@/store/headSeoSlice';
import { setHomeProps_ACTION } from '@/store/homeSlice';
import { setPageProps_ACTION } from '@/store/pageSlice';
import { setPartners_ACTION } from '@/store/partnersSlice';
import { setSponsers_ACTION } from '@/store/sponsersSlice';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Home from '@/components/VisitorPanel/Home';


export async function getStaticProps() {
  try {
    const [seoData, topNotice, countryData, dashboardContent, partners, sponserData, pageSettings] = await Promise.all([
      getHomeSEOAPI(),
      getHomeTopNoticeAPI(),
      getHomeCountriesV2API(),
      getHomeDashboardContentAPI(),
      getHomePartnersAPI(),
      getHomeSponsersAPI({ deviceWidth: 1280 }), // Default to desktop width (1280px)
      getPageCommonSettingsAPI(),
    ]);

    console.log({sponserData});
    

    return {
      props: {
        seoData,
        topNotice,
        countryData,
        dashboardContent,
        partners,
        sponserData,
        pageSettings,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('SEO Fetch Error:', error);
    return {
      props: {
        seoData: {},
        topNotice: '',
        countryData: {},
        dashboardContent: '',
        partners: [],
        sponserData: {},
        pageSettings: {},
      },
      revalidate: 60,
    };
  }
}

export default function HomePage({
  seoData,
  topNotice,
  countryData,
  dashboardContent,
  partners,
  sponserData,
  pageSettings,
}) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Batch all Redux dispatches in a single useEffect
    const actions = [];

    if (seoData && Object.keys(seoData).length > 0) {
      actions.push(setHeadSeo_ACTION(seoData));
    }
    if (topNotice) {
      actions.push(setHomeProps_ACTION({ key: 'topNotice', data: topNotice }));
    }
    if (countryData) {
      actions.push(setHomeProps_ACTION({ key: 'countryData', data: countryData }));
    }
    if (dashboardContent) {
      actions.push(setHomeProps_ACTION({ key: 'dashboardContent', data: dashboardContent }));
    }
    if (partners && partners.length > 0) {
      actions.push(setPartners_ACTION(partners));
    }
    if (sponserData && Object.keys(sponserData).length > 0) {
      actions.push(setSponsers_ACTION(sponserData));
    }
    if (pageSettings && Object.keys(pageSettings).length > 0) {
      actions.push(setPageProps_ACTION({ key: 'pageSettings', data: pageSettings }));
    }

    // Dispatch all actions at once
    actions.forEach(action => dispatch(action));
    }, [seoData, topNotice, countryData, dashboardContent, partners, sponserData, pageSettings, dispatch]);

  return (
    <>
      <SEO />
      <Home />
    </>
  );
}