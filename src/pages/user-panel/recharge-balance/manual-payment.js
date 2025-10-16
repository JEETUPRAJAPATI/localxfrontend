import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { getUserRechargeBalanceSEOAPI, getUserManualPaymentDetailAPI } from '@/api/apiAuthService';
import { setHeadSeo_ACTION } from '@/store/headSeoSlice';
import SEO from '@/components/SEO';
import { ROUTES } from '@/utils/constant.js';

// Dynamic Import for UserManualRechargeBalance
const UserManualRechargeBalance = dynamic(() => import('@/components/UserManualRechargeBalance'), {
    ssr: false,
    loading: () => <div className="text-center my-5">Loading payment form...</div>,
});

export async function getServerSideProps(context) {
    const authCookie = context?.req?.cookies?.auth;
    const authObj = JSON.parse(authCookie);
    if (!authObj.token) {
        return {
            redirect: {
                destination: ROUTES.login,
                permanent: false,
            },
        };
    }

    const { manualPaymentMethodId } = context.query;
    try {
        // Fetch SEO data
        const seoData = await getUserRechargeBalanceSEOAPI();
        // Fetch manual payment method data if manualPaymentMethodId is provided
        let initialManualMethodData = {};
        if (manualPaymentMethodId) {
            initialManualMethodData = await getUserManualPaymentDetailAPI({
                manualPaymentMethodId,
                authToken: authObj?.token || '',
            });
        } else {
            return {
                redirect: {
                    destination: ROUTES.userRechargeBalance,
                    permanent: false,
                },
            };
        }

        return {
            props: {
                seoData: seoData || {},
                initialManualMethodData: initialManualMethodData || {},
            },
        };
    } catch (error) {
        console.error('Server-Side Error:', error);
        return {
            props: {
                seoData: {},
                initialManualMethodData: {},
            },
        };
    }
}

function UserManualRechargeBalancePage({ seoData, initialManualMethodData }) {
    const dispatch = useDispatch();
    useEffect(() => {
        if (seoData && Object.keys(seoData).length > 0) {
            dispatch(setHeadSeo_ACTION(seoData));
        }
    }, [seoData, dispatch]);

    return (
        <>
            <SEO seoData={seoData} />
            <UserManualRechargeBalance initialManualMethodData={initialManualMethodData} />
        </>
    );
}

export default UserManualRechargeBalancePage;