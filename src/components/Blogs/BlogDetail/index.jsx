import {
  getCategorySponsersAPI,
  getCategoryTopSideNavLinksAPI,
} from "@/api/apiService";
import FixedHeader from "@/components/FixedHeader";
import useDeviceSize from "@/customHooks/useDeviceSize";
import { setSponsers_ACTION } from "@/store/sponsersSlice";
import { setTopSideNavLinks } from "@/store/topSideNavLinksSlice";
import { ROUTES } from "@/utils/constant";
import { removeScriptTags, sanitizeHTML } from "@/utils/helpers";
import ReactHtmlParser from "html-react-parser";
import dynamic from "next/dynamic";
import Link from "next/link";
import PropTypes from "prop-types";
import { memo, useCallback, useEffect } from "react";
import { Breadcrumb, Col, Container, Row } from "react-bootstrap";
import { connect } from "react-redux";

const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });
const SponserSites = dynamic(() => import("@/components/SponserSites"), {
  ssr: false,
});

const NextImage = dynamic(() => import("@/components/NextImage/index.jsx"), {
  ssr: false,
});

const BlogList = ({
  setSponsers_ACTION,
  setTopSideNavLinks_ACTION,
  blog_DATA,
}) => {
  const { width } = useDeviceSize();

  // Fetch additional data (sponsers and topSideNavLinks)
  const fetchCommonAPI = useCallback(() => {
    const fetchAPI = async () => {
      try {
        await Promise.all([
          getCategoryTopSideNavLinksAPI()
            .then((topSideNavLinks) =>
              setTopSideNavLinks_ACTION(topSideNavLinks)
            )
            .catch((error) => {
              console.error("Error in getCategoryTopSideNavLinksAPI:", error);
            }),
          getCategorySponsersAPI({ deviceWidth: width })
            .then((sponsers) => setSponsers_ACTION(sponsers))
            .catch((error) => {
              console.error("Error in getCategorySponsersAPI:", error);
            }),
        ]);
      } catch (error) {
        console.error("Failed to fetch common API:", error);
      }
    };
    fetchAPI();
  }, [width, setSponsers_ACTION, setTopSideNavLinks_ACTION]);

  // Run fetchCommonAPI on mount and when width changes
  useEffect(() => {
    fetchCommonAPI();
  }, [fetchCommonAPI]);

  return (
    <>
      <FixedHeader />
      <div className="blogList">
        <Container className="blogcnt">
          {blog_DATA?.blogId ? (
            <>
              <Row className="mt-3">
                <Col>
                  <Breadcrumb className="breadcrumb-area">
                    <Breadcrumb.Item linkAs={Link} href={ROUTES.home || "/"}>
                      Home
                    </Breadcrumb.Item>
                    <Breadcrumb.Item linkAs={Link} href={ROUTES.blogs || "/"}>
                      Blogs
                    </Breadcrumb.Item>
                    <Breadcrumb.Item
                      linkAs={Link}
                      href={ROUTES.blogsByCategory.replace(
                        ":category",
                        blog_DATA.categorySlug
                      )}
                    >
                      {blog_DATA.category || "N/A"}
                    </Breadcrumb.Item>
                    <Breadcrumb.Item active>
                      {blog_DATA?.title || "Article"}
                    </Breadcrumb.Item>
                  </Breadcrumb>
                </Col>
              </Row>
              <div className="text-center mt-5">
                <header className="blog-detail-header">
                  <h1 className="blog-title" itemProp="headline">
                    {blog_DATA?.title || "Articles"}
                  </h1>{" "}
                </header>
              </div>
              <Row className="blog_detail mt-5">
                <Col>
                  <article
                    id={blog_DATA?.blogId}
                    itemScope
                    itemType="https://schema.org/BlogPosting"
                  >
                    <div className="featured_image w-100">
                      <NextImage
                        src={blog_DATA.image}
                        alt={`Featured image for ${blog_DATA.title}`}
                        aspectRatio="16/9"
                        priority
                        quality={75}
                        sizes="100vw"
                        className="img-fluid w-100"
                        loading="eager"
                        itemProp="image"
                      />
                    </div>
                    <div className="entry-content" itemProp="text">
                      <div className="image_author_section-row">
                        <div className="image_author_section">
                          <div className="author_image">
                            <NextImage
                              src={blog_DATA?.authorPic}
                              alt={blog_DATA?.author}
                              width={96}
                              height={96}
                              className="avatar avatar-96 photo"
                              sizes="(max-width: 768px) 64px, 96px"
                              quality={85}
                            />
                          </div>
                          <div className="last_updated_post">
                            <Link
                              href={ROUTES.blogsByCategory.replace(
                                ":category",
                                blog_DATA.categorySlug
                              )}
                            >
                              <p className="author_name">
                                {blog_DATA?.author}{" "}
                              </p>
                            </Link>
                            <div className="last_updated">
                              <span>
                                <svg
                                  width="27"
                                  height="24"
                                  viewBox="0 0 27 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M22.5404 1.311H19.4639V0.873999C19.4639 0.6422 19.3719 0.419895 19.208 0.255988C19.0441 0.0920817 18.8217 0 18.59 0C18.3582 0 18.1358 0.0920817 17.9719 0.255988C17.808 0.419895 17.716 0.6422 17.716 0.873999V1.311H8.50401V0.873999C8.50401 0.6422 8.41192 0.419895 8.24802 0.255988C8.08411 0.0920817 7.86181 0 7.63001 0C7.39821 0 7.1759 0.0920817 7.012 0.255988C6.84809 0.419895 6.75601 0.6422 6.75601 0.873999V1.311H3.67953C2.70437 1.31331 1.76981 1.70171 1.08026 2.39126C0.390713 3.0808 0.00230809 4.01537 0 4.99053V20.3205C0.00230809 21.2956 0.390713 22.2302 1.08026 22.9197C1.76981 23.6093 2.70437 23.9977 3.67953 24H22.5404C23.5156 23.9977 24.4501 23.6093 25.1397 22.9197C25.8292 22.2302 26.2176 21.2956 26.22 20.3205V4.99053C26.2176 4.01537 25.8292 3.0808 25.1397 2.39126C24.4501 1.70171 23.5156 1.31331 22.5404 1.311ZM3.67953 3.059H6.75601V3.49599C6.75601 3.72779 6.84809 3.9501 7.012 4.114C7.1759 4.27791 7.39821 4.36999 7.63001 4.36999C7.86181 4.36999 8.08411 4.27791 8.24802 4.114C8.41192 3.9501 8.50401 3.72779 8.50401 3.49599V3.059H17.716V3.49599C17.716 3.72779 17.808 3.9501 17.9719 4.114C18.1358 4.27791 18.3582 4.36999 18.59 4.36999C18.8217 4.36999 19.0441 4.27791 19.208 4.114C19.3719 3.9501 19.4639 3.72779 19.4639 3.49599V3.059H22.5404C23.0527 3.059 23.544 3.2625 23.9062 3.62473C24.2685 3.98696 24.472 4.47826 24.472 4.99053V7.06191H1.748V4.99053C1.748 4.47826 1.9515 3.98696 2.31373 3.62473C2.67596 3.2625 3.16726 3.059 3.67953 3.059ZM22.5404 22.287H3.67953C3.42291 22.287 3.16885 22.2359 2.9322 22.1367C2.69555 22.0374 2.48105 21.892 2.30122 21.7089C2.1214 21.5258 1.97986 21.3088 1.88487 21.0704C1.78988 20.832 1.74335 20.577 1.748 20.3205V8.80991H24.472V20.3205C24.4766 20.577 24.4301 20.832 24.3351 21.0704C24.2401 21.3088 24.0986 21.5258 23.9187 21.7089C23.7389 21.892 23.5244 22.0374 23.2878 22.1367C23.0511 22.2359 22.797 22.287 22.5404 22.287Z"
                                    fill="#3579F7"
                                  ></path>
                                </svg>
                                {blog_DATA?.publishedDate || "N/A"}
                              </span>
                              <span>
                                <svg
                                  width="25"
                                  height="28"
                                  viewBox="0 0 25 28"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M24.6807 6.17859L21.7512 3.23969C21.3255 2.81252 20.6352 2.81252 20.2094 3.23969C19.7837 3.66685 19.7836 4.35936 20.2094 4.78647L20.9033 5.48253L19.4804 6.90998C17.6282 5.35981 15.3761 4.424 12.9738 4.20618V2.1875H13.955C14.5571 2.1875 15.0452 1.69783 15.0452 1.09375C15.0452 0.489672 14.5571 0 13.955 0H9.8121C9.20996 0 8.72187 0.489672 8.72187 1.09375C8.72187 1.69783 9.20996 2.1875 9.8121 2.1875H10.7933V4.20618C4.81207 4.74846 0 9.78731 0 16.0781C0 22.667 5.31494 28 11.8835 28C18.4512 28 23.7671 22.6679 23.7671 16.0781C23.7671 13.2611 22.7992 10.5937 21.0222 8.45677L22.4451 7.02931L23.1389 7.72538C23.5646 8.15248 24.2549 8.15254 24.6807 7.72538C25.1064 7.29827 25.1064 6.60576 24.6807 6.17859ZM11.8835 25.8125C6.53328 25.8125 2.18047 21.4456 2.18047 16.0781C2.18047 10.7106 6.53328 6.34375 11.8835 6.34375C17.2338 6.34375 21.5866 10.7106 21.5866 16.0781C21.5866 21.4456 17.2339 25.8125 11.8835 25.8125ZM17.5486 16.0781C17.5486 16.6822 17.0605 17.1719 16.4583 17.1719H11.8836C11.2815 17.1719 10.7934 16.6822 10.7934 16.0781V9.64277C10.7934 9.0387 11.2815 8.54902 11.8836 8.54902C12.4857 8.54902 12.9738 9.0387 12.9738 9.64277V14.9844H16.4583C17.0605 14.9844 17.5486 15.474 17.5486 16.0781Z"
                                    fill="#3579F7"
                                  ></path>
                                </svg>
                                {blog_DATA?.readTime || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="blog-side">
                          <div className="blog-side-box">
                            <div className="blog-side-box-inner">
                              <div className="bulk-delete-head">
                                Connect with straight, gay, bi and curious!
                              </div>
                              <div className="subscribe-to-unlock">
                                <Link className="button" href={ROUTES.login}>
                                  Sign up now
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="blog-single-content">
                        <div className="blog-single-left">
                          {ReactHtmlParser(
                            sanitizeHTML(
                              removeScriptTags(blog_DATA?.description || "")
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                </Col>
              </Row>
            </>
          ) : (
            <div className="text-center">
              <h3>No Blog Found</h3>
              <Link href={ROUTES.blogs}> Back To Blog</Link>
            </div>
          )}
        </Container>
        <SponserSites className="mt-4" />
      </div>
      <Footer className="mt-4" />
    </>
  );
};

// Prop validation
BlogList.propTypes = {
  blog_DATA: PropTypes.object,

  setSponsers_ACTION: PropTypes.func,
  setTopSideNavLinks_ACTION: PropTypes.func,
};

// Map state to props
const mapStateToProps = (state) => ({
  blog_DATA: state?.page?.blog_detail || {},
});

const mapDispatchToProps = {
  setSponsers_ACTION,
  setTopSideNavLinks_ACTION: setTopSideNavLinks,
};

export default connect(mapStateToProps, mapDispatchToProps)(memo(BlogList));
