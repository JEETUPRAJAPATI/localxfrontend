import {
  getCategorySponsersAPI,
  getCategoryTopSideNavLinksAPI,
} from "@/api/apiService";
import FixedHeader from "@/components/FixedHeader";
import useDeviceSize from "@/customHooks/useDeviceSize";
import { setSponsers_ACTION } from "@/store/sponsersSlice";
import { setTopSideNavLinks } from "@/store/topSideNavLinksSlice";
import { ROUTES } from "@/utils/constant";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { memo, useCallback, useEffect, useState } from "react";
import {
  Breadcrumb,
  Button,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
} from "react-bootstrap";
import { connect } from "react-redux";

const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });
const SponserSites = dynamic(() => import("@/components/SponserSites"), {
  ssr: false,
});

const AlertMessage = dynamic(() => import("@/components/AlertMessage"), {
  ssr: false,
});
const CustomPagination = dynamic(
  () => import("@/components/CustomPagination/index.jsx"),
  {
    ssr: false,
  }
);
const NextImage = dynamic(() => import("@/components/NextImage/index.jsx"), {
  ssr: false,
});

// Individual Blog Post Component
const BlogPost = memo(({ post }) => (
  <Col xs="12" sm="12" md="4">
    <div className="blog_post_items">
      <div className="blog_img">
        <Link href={ROUTES.blogDetail.replace(":slug", post.slug)}>
          <NextImage
            src={post.image}
            alt={`Featured image for ${post.title}`}
            aspectRatio="16/9"
            priority
            quality={75}
            sizes="(max-width: 768px) 100vw, 720px"
          />
        </Link>
      </div>
      <div className="blog_post_content">
        <Link href={ROUTES.blogDetail.replace(":slug", post.slug)}>
          <h2>{post.title}</h2>
        </Link>
        <p>{post.excerpt}</p>
      </div>
      <div className="blog_read_more">
        <span>
          <svg
            width="22"
            height="24"
            viewBox="0 0 22 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.1994 5.29594L18.6832 2.77688C18.3174 2.41073 17.7245 2.41073 17.3588 2.77688C16.9932 3.14302 16.9931 3.73659 17.3588 4.10269L17.9548 4.69931L16.7326 5.92284C15.1417 4.59412 13.2073 3.792 11.1438 3.6053V1.875H11.9866C12.5038 1.875 12.923 1.45528 12.923 0.9375C12.923 0.419719 12.5038 0 11.9866 0H8.42808C7.91087 0 7.49162 0.419719 7.49162 0.9375C7.49162 1.45528 7.91087 1.875 8.42808 1.875H9.27088V3.6053C4.13332 4.07011 0 8.38912 0 13.7812C0 19.4288 4.56525 24 10.2073 24C15.8486 24 20.4147 19.4296 20.4147 13.7812C20.4147 11.3667 19.5833 9.08034 18.057 7.24866L19.2791 6.02512L19.8751 6.62175C20.2408 6.98784 20.8337 6.98789 21.1994 6.62175C21.5651 6.25566 21.5651 5.66208 21.1994 5.29594ZM10.2073 22.125C5.61174 22.125 1.87291 18.382 1.87291 13.7812C1.87291 9.18052 5.61174 5.4375 10.2073 5.4375C14.8029 5.4375 18.5418 9.18052 18.5418 13.7812C18.5418 18.382 14.803 22.125 10.2073 22.125ZM15.0733 13.7812C15.0733 14.299 14.654 14.7188 14.1368 14.7188H10.2074C9.69018 14.7188 9.27093 14.299 9.27093 13.7812V8.26523C9.27093 7.74745 9.69018 7.32773 10.2074 7.32773C10.7246 7.32773 11.1438 7.74745 11.1438 8.26523V12.8438H14.1368C14.654 12.8438 15.0733 13.2635 15.0733 13.7812Z"
              fill="#9FA9B1"
            ></path>
          </svg>
          {post.read_time}
        </span>
        <Link href={ROUTES.blogDetail.replace(":slug", post.slug)}>
          Read More
          <svg
            width="24"
            height="12"
            viewBox="0 0 24 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 5.25C0.585786 5.25 0.25 5.58579 0.25 6C0.25 6.41421 0.585786 6.75 1 6.75L1 5.25ZM23.5303 6.53033C23.8232 6.23743 23.8232 5.76256 23.5303 5.46967L18.7574 0.696698C18.4645 0.403804 17.9896 0.403804 17.6967 0.696698C17.4038 0.989591 17.4038 1.46446 17.6967 1.75736L21.9393 6L17.6967 10.2426C17.4038 10.5355 17.4038 11.0104 17.6967 11.3033C17.9896 11.5962 18.4645 11.5962 18.7574 11.3033L23.5303 6.53033ZM1 6.75L23 6.75L23 5.25L1 5.25L1 6.75Z"
              fill="#3579F7"
            />
          </svg>
        </Link>
      </div>
    </div>
  </Col>
));

const BlogList = ({
  setSponsers_ACTION,
  setTopSideNavLinks_ACTION,
  blogCategory_DATA,
  blogs_DATA,
  blogPagination_DATA,
}) => {
  const router = useRouter();
  const { width } = useDeviceSize();
  const { MESSAGE, CODE } = router.query;

  // States
  const [keyword, setKeyword] = useState("");
  const [alertMessage, setAlertMessage] = useState({ show: false });

  // Handle search
  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      const trimmedKeyword = keyword.trim();
      router.push({
        pathname: ROUTES.blogs,
        ...(trimmedKeyword ? { query: { keyword: trimmedKeyword } } : {}),
      });
    },
    [keyword, router]
  );

  const handlePageChange = useCallback(
    (pageNumber) => {
      router.push({
        pathname: ROUTES.blogs,
        query: { ...router.query, page: pageNumber },
      });
    },
    [router]
  );

  // Handle input change
  const handleInputChange = useCallback((e) => {
    setKeyword(e.target.value);
  }, []);

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

  // Handle alert message
  useEffect(() => {
    if (CODE) {
      setAlertMessage({
        show: true,
        type: "success",
        showDismissible: false,
        showHeading: true,
        message: MESSAGE,
      });
      const timer = setTimeout(() => setAlertMessage({ show: false }), 15000);
      return () => clearTimeout(timer);
    }
  }, [CODE, MESSAGE]);

  return (
    <>
      <FixedHeader />
      <div className="blogList">
        <Container className="blogcnt">
          <Row className="mt-3">
            <Col>
              <Breadcrumb className="breadcrumb-area">
                <Breadcrumb.Item linkAs={Link} href={ROUTES.home || "/"}>
                  Home
                </Breadcrumb.Item>
                <Breadcrumb.Item linkAs={Link} href={ROUTES.blogs || "/"}>
                  Blogs
                </Breadcrumb.Item>
                <Breadcrumb.Item active>
                  {blogCategory_DATA?.name || "Article"}
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col>
              <Form onSubmit={handleSearch}>
                <AlertMessage {...alertMessage} />
                <InputGroup className="search-input-group">
                  <Form.Control
                    placeholder="Search"
                    aria-label="Search"
                    aria-describedby="basic-addon2"
                    className="search-input"
                    value={keyword}
                    onChange={handleInputChange}
                  />
                  <InputGroup.Text
                    id="basic-addon2"
                    className="search-button-container"
                  >
                    <Button
                      variant="primary"
                      type="submit"
                      className="search-button"
                    >
                      <FontAwesomeIcon icon={faSearch} />
                    </Button>
                  </InputGroup.Text>
                </InputGroup>
              </Form>
            </Col>
          </Row>
          <div className="category text-center mt-4">
            <h1>{blogCategory_DATA?.name || "Articles"} </h1>
          </div>
          <Row className="blog_list mt-5">
            {blogs_DATA.length > 0 ? (
              blogs_DATA.map((post) => <BlogPost key={post.id} post={post} />)
            ) : (
              <h5 className="text-center">No Blogs Available</h5>
            )}
          </Row>

          <Row>
            <Col>
              {blogPagination_DATA?.totalRecords > 0 && (
                <CustomPagination
                  totalItems={blogPagination_DATA?.totalRecords || 0}
                  itemsPerPage={blogPagination_DATA?.perPageLimit || 0}
                  activePage={parseInt(blogPagination_DATA?.currentPage || 1)}
                  onPageChange={handlePageChange}
                />
              )}
            </Col>
          </Row>
        </Container>
        <SponserSites className="mt-4" />
      </div>
      <Footer className="mt-4" />
    </>
  );
};

// Prop validation
BlogList.propTypes = {
  blogs_DATA: PropTypes.array,
  blogCategory_DATA: PropTypes.object,
  blogPagination_DATA: PropTypes.object,

  setSponsers_ACTION: PropTypes.func,
  setTopSideNavLinks_ACTION: PropTypes.func,
};

// Map state to props
const mapStateToProps = (state) => ({
  blogs_DATA: state?.page?.blog_list || [],
  blogPagination_DATA: state?.page?.blog_list_pagination || {},
  blogCategory_DATA: state?.page?.blog_list_category || {},
});

const mapDispatchToProps = {
  setSponsers_ACTION,
  setTopSideNavLinks_ACTION: setTopSideNavLinks,
};

export default connect(mapStateToProps, mapDispatchToProps)(memo(BlogList));
