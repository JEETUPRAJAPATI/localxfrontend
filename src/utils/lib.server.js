import { APP_CONFIG } from "@/utils/constant";
import { generateApiKey } from "@/utils/helpers";
import { serialize } from "cookie";
import fetch from "cross-fetch"; // Use cross-fetch instead of node-fetch

const NODE_ENV = process.env.NEXT_PUBLIC_NODE_ENV || "development";
const BASE_API_URI = APP_CONFIG[NODE_ENV]?.API_URI || "";

export async function callServerAdminApi({ req, res, method = "GET", endpoint, data = null, params = null }) {
    try {
        const session = await getAdminServerSession(req);
        if (!session) {
            console.error("Server:==> No valid admin session found");
            return null;
        }

        const { token, refreshToken } = session;
        if (!token || !refreshToken) {
            console.error("Server:==> Session missing token or refreshToken", { token, refreshToken });
            return null;
        }

        const apiKey = generateApiKey();
        // const url = `${BASE_API_URI}${endpoint}`;
        const url = new URL(`${BASE_API_URI}${endpoint}`);
        if (params) {
            Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
        }

        let response = null;

        try {
            // Fetch Debug
            const fetchConfig = {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Origin": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000", // Add Origin header
                    "User-Agent": "Next.js Server/1.0", // Optional: for server-side clarity
                    "x-api-key": apiKey,
                    ...(data && { "Content-Type": "application/json" }),
                },
                ...(data && { body: JSON.stringify(data) }),
            };
            response = await fetch(url, fetchConfig);
            if (!response.ok) {
                const errorText = await response.text(); // Capture response body
                console.error(`Server:==> HTTP error for ${endpoint}: Status ${response.status}, Body: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
            }
            const responseData = await response.json();
            console.log(`Server:==> API call to ${endpoint} succeeded`);
            console.log("Server:==> API Response:", responseData);

            return responseData;
        } catch (error) {
            if (error.message.includes("401") && !error._retry) {
                console.log("Server:==> 401 Unauthorized, attempting token refresh");
                error._retry = true;

                try {
                    const refreshResponse = await fetch(`${BASE_API_URI}/api/v1/auth/refresh-token`, {
                        method: "POST",
                        headers: {
                            "x-api-key": apiKey,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ token: refreshToken }),
                    });

                    if (!refreshResponse.ok) {
                        const errorText = await refreshResponse.text(); // Capture response body
                        console.error(`Server:==> HTTP error for Refresh Token: Status ${refreshResponse.status}, Body: ${errorText}`);
                        throw new Error(`Refresh token failed: ${refreshResponse.status}, body: ${errorText}`);
                    }

                    const refreshData = await refreshResponse.json();
                    const newToken = refreshData.data.token;
                    console.log("Server:==> Token refreshed successfully.");

                    res.setHeader(
                        "Set-Cookie",
                        serialize(
                            "adminAuth",
                            JSON.stringify({ ...session, token: newToken }),
                            {
                                secure: true,
                                path: "/",
                                maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
                            }
                        )
                    );
                    console.log("Server:==> Updated adminAuth cookie with new token");

                    // Fetch Debug
                    const fetchConfig = {
                        method,
                        headers: {
                            Authorization: `Bearer ${newToken}`,
                            "x-api-key": apiKey,
                            "Origin": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000", // Add Origin header
                            "User-Agent": "Next.js Server/1.0", // Optional: for server-side clarity
                            ...(data && { "Content-Type": "application/json" }),
                        },
                        ...(data && { body: JSON.stringify(data) }),
                    };
                    response = await fetch(url, fetchConfig);

                    if (!response.ok) {
                        throw new Error(`Retry failed: ${response.status}`);
                    }

                    if (!response.ok) {
                        const errorText = await response.text(); // Capture response body
                        console.error(`Server:==> Retry failed: for ${endpoint}: Status ${response.status}, Body: ${errorText}`);
                        throw new Error(`Retry failed! status: ${response.status}, body: ${errorText}`);
                    }

                    const retryData = await response.json();
                    console.log(`Server:==> Retry API call to ${endpoint} succeeded.`);
                    return retryData;
                } catch (refreshError) {
                    const refreshData = await refreshError.response?.json();
                    const { code, message } = refreshData || {};
                    console.error("Server:==> Refresh token failed:", message || refreshError.message);
                    if (code === "INVALID_REFRESH_TOKEN" || code === "EXPIRED_REFRESH_TOKEN") {
                        res.setHeader(
                            "Set-Cookie",
                            serialize("adminAuth", "", {
                                secure: true,
                                path: "/",
                                maxAge: 0, // Expire immediately
                            })
                        );
                        console.log("Server:==> Cleared adminAuth cookie due to invalid/expired refresh token");
                        return null;
                    }
                    throw refreshError;
                }
            } else {
                console.error(`Server:==> API error for ${endpoint}:`, error.message);
                throw error;
            }
        }
    } catch (error) {
        console.error(`Server:==> Error calling API ${endpoint}:`, error.message);
        return { data: null };
    }
}

export async function getServerSession(req) {
    if (!req) {
        console.error('Server:==> Request object is required in getServerSession');
        return null;
    }

    try {
        let auth = null;
        // Check if req.cookies is a Cookies instance (middleware/edge runtime)
        if (typeof req.cookies?.get === 'function') {
            console.log("Server:==> FROM MIDDLEWARE!!");
            auth = JSON.parse(req?.cookies?.get('auth')?.value || '{}');
        }
        // Otherwise, treat req.cookies as a plain object (Pages Router)
        else if (req.cookies && typeof req.cookies === 'object') {
            console.log("Server:==> FROM PAGES!!");
            auth = JSON.parse(req?.cookies?.auth || '{}');
        }

        if (!auth || Object.keys(auth).length === 0) {
            console.log('Server:==> No auth found in cookies');
            return null;
        }
        console.log("Server:==> Auth:", auth);
        return auth;
    } catch (error) {
        console.error('Server:==> Auth parse error:', error.message);
        return null;
    }
}

export async function getAdminServerSession(req) {
    if (!req) {
        console.error('Server:==> Request object is required in getAdminServerSession');
        return null;
    }

    try {
        let auth = null;
        // Check if req.cookies is a Cookies instance (middleware/edge runtime)
        if (typeof req.cookies?.get === 'function') {
            console.log("Server:==> FROM MIDDLEWARE!!");
            auth = JSON.parse(req?.cookies?.get('adminAuth')?.value || '{}');
        }
        // Otherwise, treat req.cookies as a plain object (Pages Router)
        else if (req.cookies && typeof req.cookies === 'object') {
            console.log("Server:==> FROM PAGES!!");
            auth = JSON.parse(req?.cookies?.adminAuth || '{}');
        }

        if (!auth || Object.keys(auth).length === 0) {
            console.log('Server:==> No admin auth found in cookies');
            return null;
        }
        console.log("Server:==> Admin Auth:", auth);
        return auth;
    } catch (error) {
        console.error('Server:==> Admin Auth parse error:', error.message);
        return null;
    }
}

export async function getAdminServerSessionData(req, res) {
    try {
        // Get session from adminAuth cookie
        const session = await getAdminServerSession(req);
        if (!session) {
            console.error("Server:==> No valid admin session found");
            return null;
        }
        const { id, token } = session;
        if (!id || !token) {
            console.error("Server:==> Session missing id or token", { id, token });
            return null;
        }
        // Fetch latest user data from DB
        const profileRes = await callServerAdminApi({
            req,
            res,
            method: "GET",
            endpoint: `/api/v1/admin/profile?from=serverSession`,
        });

        if (!profileRes || !profileRes?.data) {
            console.error("Server:==> No data returned from admin profile API");
            return null;
        }

        const { modulePermissions } = profileRes.data;
        // Update adminModulePermissions with latest modulePermissions

        // Set the updated adminModulePermissions cookie in the response
        res.setHeader("Set-Cookie", serialize("adminModulePermissions", JSON.stringify(modulePermissions || []), {
            secure: true,
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        }));
        console.log("Server:==> Updated adminModulePermissions cookie with new modulePermissions");

        return profileRes.data;
    } catch (error) {
        console.error("Server:==> Error fetching latest admin user data:", error.message);
        return null;
    }
}