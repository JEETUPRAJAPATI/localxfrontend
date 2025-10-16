import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useState } from "react";
import {
  Badge,
  Breadcrumb,
  Button,
  ButtonGroup,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
} from "react-bootstrap";

import ReactHtmlParser from "html-react-parser";

import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons"; // Importing outline star icon
import {
  faCogs,
  faImage,
  faListUl,
  faSearch,
  faThLarge,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Custom
import {
  getCategorySponsersAPI,
  getCategoryTopSideNavLinksAPI,
  getPostAlertMessageAPI,
  getPostLeftAdsAPI,
  getPostLeftSideFiltersAPI,
  getPostRightAdsAPI,
  getPostsAPI,
  getPostSubCategoriesAPI,
  getPostSubCategoryContentAPI,
  getPostTypeAdsAPI,
  updatePostAdsClickCountAPI,
} from "@/api/apiService";
import useDeviceSize from "@/customHooks/useDeviceSize.js";
import {
  sanitizeHTML,
  slugify,
  truncatedContent,
  unslugify,
} from "@/utils/helpers";

// Dynamic Components
import CustomPlaceholder from "@/components/CustomPlaceholder/index.jsx";
const LazyImage = dynamic(() => import("@/components/LazyImage/index.jsx"), {
  ssr: false,
});
const FixedHeader = dynamic(
  () => import("@/components/FixedHeader/index.jsx"),
  {
    ssr: false,
  }
);
const Footer = dynamic(() => import("@/components/Footer/index.jsx"), {
  ssr: false,
});
const SponserSites = dynamic(
  () => import("@/components/SponserSites/index.jsx"),
  {
    ssr: false,
  }
);

const CustomPagination = dynamic(
  () => import("@/components/CustomPagination/index.jsx"),
  {
    ssr: false,
  }
);
const AlertMessage = dynamic(
  () => import("@/components/AlertMessage/index.jsx"),
  {
    ssr: false,
  }
);
const AdsCarousel = dynamic(
  () => import("@/components/AdsCarousel/index.jsx"),
  {
    ssr: false,
  }
);

// Redux
import { setPostsProps as setPostsProps_ACTION } from "@/store/postsSlice";
import { setSponsers_ACTION } from "@/store/sponsersSlice";
import { setTopSideNavLinks as setTopSideNavLinks_ACTION } from "@/store/topSideNavLinksSlice";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

// Single memoized selector for Redux state
const storeSelectorData = createSelector(
  (state) => state.posts,
  (state) => state.headSeo,
  (posts, headSeo) => ({
    postListAlertMessage_DATA: sanitizeHTML(posts?.alertMessage || ""),
    posts_DATA: posts?.list || [],
    postPagination_DATA: posts?.pagination || {},
    singleCountry_DATA: posts?.leftSideFilters?.countryDetail || {},
    singleCity_DATA: posts?.leftSideFilters?.cityDetail || {},
    singleSubCity_DATA: posts?.leftSideFilters?.subCityDetail || {},
    singleCategory_DATA: posts?.leftSideFilters?.categoryDetail || {},
    singleSubCategory_DATA: posts?.leftSideFilters?.subCategoryDetail || {},
    subCities_DATA: posts?.leftSideFilters?.subCities || [],
    categories_DATA: posts?.leftSideFilters?.categories || [],
    subCategories_DATA: posts?.leftSideFilters?.subCategories || [],
    postTypeAds_DATA: posts?.postTypeAds || [],
    leftAds_DATA: posts?.postLeftAds || [],
    rightAds_DATA: posts?.postRightAds || [],
    subCategoryContent_DATA: sanitizeHTML(posts?.postSubCategoryContent || ""),
    pageHeading_DATA: sanitizeHTML(headSeo?.pageHeading || ""),
  })
);

const PostList = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  // 1. Get URL params
  // const { country, city, subCity } = router.query;
  const { country, city, subCity, category, subCategory } = router.query;

  // 2. Get current path
  const currentPath = router.asPath;
  const { width, isMobile, isDesktop } = useDeviceSize();

  const listBgColor = {
    newPostAds: "#f0fdf6",
    featuredPostAds: "#fbecd6",
    googleAds: "#edf8f5",
    postAds: "#edf8f5",
  };

  //:=========================
  // Redux Stores (Memoized)
  //:=========================
  // Extracting multiple state properties with a single selector
  const {
    singleCountry_DATA,
    singleCity_DATA,
    singleSubCity_DATA,
    singleCategory_DATA,
    singleSubCategory_DATA,
    posts_DATA,
    postListAlertMessage_DATA,
    subCategoryContent_DATA,
    postPagination_DATA,
    subCities_DATA,
    categories_DATA,
    subCategories_DATA,
    postTypeAds_DATA,
    leftAds_DATA,
    rightAds_DATA,
    pageHeading_DATA,
  } = useSelector(storeSelectorData);

  //:========================================
  // States Declaration
  //:========================================
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState("list");
  const [filterSubCity, setFilterSubCity] = useState({ id: "", name: "" });
  const [filterCategory, setFilterCategory] = useState({ id: "", name: "" });
  const [filterSubCategory, setFilterSubCategory] = useState({
    id: "",
    name: "",
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [alertMessage, setAlertMessage] = useState({
    show: false,
  });
  const [showFilterForm, setShowFilterForm] = useState(false);
  const [isSamePostFilter, setIsSamePostFilter] = useState(false);

  //:========================================
  // Function Declaration
  //:========================================
  const handleFilterSubCity = useCallback(
    (e) => {
      const selectedId = e.target.value;
      const selectedData = subCities_DATA.find(
        (item) => parseInt(item.id) === parseInt(selectedId)
      );
      setFilterSubCity({ id: selectedId, name: selectedData?.subcity || "" });
    },
    [subCities_DATA]
  );

  const fetchSubCategoriesByCategory = useCallback((category) => {
    const fetchSubCategories = async (category) => {
      try {
        const subCategories = await getPostSubCategoriesAPI({ category });
        dispatch(
          setPostsProps_ACTION({
            key: "leftSideFilters.subCategories",
            data: subCategories,
          })
        );
      } catch (error) {
        console.error("Failed to fetch sub categories by category:", error);
      }
    };
    if (category) fetchSubCategories(category);
  }, []);

  const handleFilterCategory = useCallback(
    (e) => {
      const selectedId = e.target.value;
      const selectedData = categories_DATA.find(
        (item) => parseInt(item.id) === parseInt(selectedId)
      );
      setFilterCategory({ id: selectedId, name: selectedData?.category || "" });

      // Fetch SubCategories
      fetchSubCategoriesByCategory(selectedId);
    },
    [categories_DATA]
  );

  const handleFilterSubCategory = useCallback(
    (e) => {
      const selectedId = e.target.value;
      const selectedData = subCategories_DATA.find(
        (item) => parseInt(item.id) === parseInt(selectedId)
      );
      setFilterSubCategory({
        id: selectedId,
        name: selectedData?.subcategory || "",
      });
    },
    [subCategories_DATA]
  );

  const handleSearchKeyword = useCallback((e) => {
    setSearchKeyword(e.target.value);
  }, []);

  const handleSubmitSearch = useCallback(
    (e) => {
      e.preventDefault(); // Corrected preventing default behavior
      fetchPostList({ page: 1, searchKeyword, pageOrSearchFilter: true });
    },
    [searchKeyword]
  );

  const handleFilterFormSubmit = useCallback(
    (e) => {
      e.preventDefault(); // Corrected preventing default behavior
      const postListPath = `/p/${slugify(
        singleCountry_DATA?.country
      )}/${slugify(singleCity_DATA?.city)}/${slugify(
        filterSubCity?.name
      )}/categories/${slugify(filterCategory?.name)}/${slugify(
        filterSubCategory?.name
      )}/post-list`;

      if (
        !singleCountry_DATA?.country ||
        !singleCity_DATA?.city ||
        !filterSubCity?.name ||
        !filterCategory.name ||
        !filterSubCategory.name
      )
        return false;

      setSearchKeyword("");
      router.push({
        pathname: postListPath,
      });
    },
    [filterSubCity, filterCategory, filterSubCategory, currentPath]
  );

  const handlePageChange = useCallback(
    (pageNumber) => {
      window?.scrollTo(0, 0);
      if (pageNumber == page) return false;
      setPage(pageNumber);
      fetchPostList({
        page: pageNumber,
        searchKeyword,
        pageOrSearchFilter: true,
      });
    },
    [page, searchKeyword]
  );

  // Fetch Post Data
  const fetchPostList = useCallback(
    (options = {}) => {
      const { page, searchKeyword, pageOrSearchFilter = false } = options;
      const fetchPostAPI = async () => {
        setAlertMessage({
          show: false,
        });
        setIsLoading(true);

        try {
          const fetchPromises = [];

          const params = {
            country: unslugify(country),
            city: unslugify(city),
            subCity: unslugify(subCity),
            category: unslugify(category),
            subCategory: unslugify(subCategory),
            page,
            ...(searchKeyword
              ? { searchKeyword: sanitizeHTML(searchKeyword) }
              : {}), // Only include searchKeyword if it exists
          };

          if (!pageOrSearchFilter) {
            // SEO, Left Side Filters, and Post SubCategory Content APIs
            fetchPromises.push(
              getPostLeftSideFiltersAPI(params)
                .then((leftSideFilters) =>
                  dispatch(
                    setPostsProps_ACTION({
                      key: "leftSideFilters",
                      data: leftSideFilters,
                    })
                  )
                )
                .catch((error) => {
                  console.error("Error in getPostLeftSideFiltersAPI:", error);
                  // Optional: Handle detail API error
                }),
              getPostSubCategoryContentAPI(params)
                .then((postSubCategoryContent) =>
                  dispatch(
                    setPostsProps_ACTION({
                      key: "postSubCategoryContent",
                      data: postSubCategoryContent,
                    })
                  )
                )
                .catch((error) => {
                  console.error(
                    "Error in getPostSubCategoryContentAPI:",
                    error
                  );
                  // Optional: Handle detail API error
                })
            );
          }

          // Post List and Pagination API
          fetchPromises.push(
            getPostsAPI(params)
              .then(({ list, pagination }) => {
                dispatch(setPostsProps_ACTION({ key: "list", data: list }));
                dispatch(
                  setPostsProps_ACTION({ key: "pagination", data: pagination })
                );

                if (list.length === 0) {
                  setAlertMessage({
                    show: true,
                    type: "info",
                    message: "No Posts.",
                    showDismissible: false,
                    showHeading: false,
                    className: "text-center",
                  });
                }
              })
              .catch((error) => {
                console.error("Error in getPostsAPI:", error);
                // Optional: Handle detail API error
              })
          );

          // Wait for all promises to settle (either fulfill or reject)
          await Promise.allSettled(fetchPromises);
        } catch (error) {
          console.error("Failed to fetch home:", error);
          setAlertMessage({
            show: true,
            type: "error",
            message: "Something went wrong!!!",
            showDismissible: false,
            showHeading: false,
            className: "text-center",
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchPostAPI();
    },
    [country, city, subCity, category, subCategory]
  );

  const fetchCommonAPI = useCallback(() => {
    const fetchAPI = async () => {
      setAlertMessage({
        show: false,
      });
      setIsLoading(true);

      try {
        // Using Promise.allSettled to ensure all APIs are called, even if some fail
        const [
          alertMessageResult,
          postTypeAdsResult,
          postLeftAdsResult,
          postRightAdsResult,
          topSideNavLinksResult,
          sponsersResult,
        ] = await Promise.allSettled([
          getPostAlertMessageAPI(),
          getPostTypeAdsAPI(),
          getPostLeftAdsAPI(),
          getPostRightAdsAPI(),
          getCategoryTopSideNavLinksAPI(),
          getCategorySponsersAPI({ deviceWidth: width }),
        ]);

        // Handle each result separately
        if (alertMessageResult.status === "fulfilled") {
          dispatch(
            setPostsProps_ACTION({
              key: "alertMessage",
              data: alertMessageResult.value,
            })
          );
        } else {
          console.error(
            "Failed to fetch post alert message:",
            alertMessageResult.reason
          );
        }

        if (postTypeAdsResult.status === "fulfilled") {
          dispatch(
            setPostsProps_ACTION({
              key: "postTypeAds",
              data: postTypeAdsResult.value,
            })
          );
        } else {
          console.error(
            "Failed to fetch post type ads:",
            postTypeAdsResult.reason
          );
        }

        if (postLeftAdsResult.status === "fulfilled") {
          dispatch(
            setPostsProps_ACTION({
              key: "postLeftAds",
              data: postLeftAdsResult.value,
            })
          );
        } else {
          console.error(
            "Failed to fetch post left ads:",
            postLeftAdsResult.reason
          );
        }

        if (postRightAdsResult.status === "fulfilled") {
          dispatch(
            setPostsProps_ACTION({
              key: "postRightAds",
              data: postRightAdsResult.value,
            })
          );
        } else {
          console.error(
            "Failed to fetch post right ads:",
            postRightAdsResult.reason
          );
        }

        if (topSideNavLinksResult.status === "fulfilled") {
          dispatch(setTopSideNavLinks_ACTION(topSideNavLinksResult.value));
        } else {
          console.error(
            "Failed to fetch top side nav links:",
            topSideNavLinksResult.reason
          );
        }

        if (sponsersResult.status === "fulfilled") {
          dispatch(setSponsers_ACTION(sponsersResult.value));
        } else {
          console.error("Failed to fetch sponsers:", sponsersResult.reason);
        }
      } catch (error) {
        console.error("Failed to fetch common API:", error);
        setAlertMessage({
          show: true,
          type: "error",
          message: "Something went wrong!!!",
          showDismissible: false,
          showHeading: false,
          className: "text-center",
        });
      } finally {
        // setIsLoading(false);
      }
    };
    fetchAPI();
  }, []);

  const handleNewPostAdsClick = useCallback((item) => {
    if (!item || !item.id) {
      console.error("Invalid item provided:", item);
      return;
    }

    if (item.content) {
      try {
        // Validate the URL using the URL constructor
        const validUrl = new URL(item.content);

        updatePostAdsClickCountAPI(item.id)
          .then(() => {
            // Open the direct URL in a new tab or the same tab based on the condition
            if (item.target_blank) {
              window.open(validUrl.href, "_blank", "noopener,noreferrer");
            } else {
              window.location.href = validUrl.href;
            }
          })
          .catch((error) => {
            console.error("Error in updatePostAdsClickCountAPI:", error);
          });
      } catch (error) {
        console.error("Invalid URL:", item.content, error);
      }
    } else {
      console.error("No direct URL found for item:", item);
    }
  }, []);

  const handleToggleFilterForm = useCallback(() => {
    setShowFilterForm((prev) => !prev);
  }, []);

  const handlePostDetailUrl = useCallback(
    (item) => {
      const title = truncatedContent(sanitizeHTML(item.title), 60);
      return `/${country}/${city}/${subCity}/${category}/${subCategory}/post-view/${slugify(
        title
      )}/${item.id}.html`;
    },
    [country, city, subCity, category, subCategory]
  );

  //:========================================
  // Effect Load Declaration
  //:========================================

  useEffect(() => {
    // Check if the current URL matches the post filter
    const checkIsSamePostFilter =
      singleCountry_DATA?.country?.trim()?.toLowerCase() ===
        unslugify(country)?.trim()?.toLowerCase() &&
      singleCity_DATA?.city?.trim()?.toLowerCase() ===
        unslugify(city).trim()?.toLowerCase() &&
      singleSubCity_DATA?.subcity?.trim()?.toLowerCase() ===
        unslugify(subCity)?.trim()?.toLowerCase() &&
      singleCategory_DATA?.category?.trim()?.toLowerCase() ===
        unslugify(category)?.trim()?.toLowerCase() &&
      singleSubCategory_DATA?.subcategory?.trim()?.toLowerCase() ===
        unslugify(subCategory)?.trim()?.toLowerCase();

    // Update the state based on the comparison
    setIsSamePostFilter(checkIsSamePostFilter);
  }, [country, city, subCity, category, subCategory]);

  useEffect(() => {
    fetchCommonAPI();
  }, [fetchCommonAPI]);

  useEffect(() => {
    fetchPostList();
  }, [fetchPostList]);

  useEffect(() => {
    setFilterSubCity({
      id: singleSubCity_DATA?.id,
      name: singleSubCity_DATA?.subcity,
    });
    setFilterCategory({
      id: singleCategory_DATA?.id,
      name: singleCategory_DATA?.category,
    });
    setFilterSubCategory({
      id: singleSubCategory_DATA?.id,
      name: singleSubCategory_DATA?.subcategory,
    });
  }, [singleSubCity_DATA, singleCategory_DATA, singleSubCategory_DATA]);

  return (
    <>
      <FixedHeader />
      <div className="postList">
        <Row className="g-1 m-2">
          <LeftAdsPanel isMobile={isMobile} leftAds_DATA={leftAds_DATA} />
          <Col lg={10} md={10} sm={12} xs={12}>
            <Container className="pstlst-cnt">
              <BreadcrumbSection
                subCity={subCity}
                category={category}
                subCategory={subCategory}
              />
              <Row className="mt-3 g-3">
                <FilterPanel
                  isDesktop={isDesktop}
                  handleFilterFormSubmit={handleFilterFormSubmit}
                  filterSubCity={filterSubCity}
                  handleFilterSubCity={handleFilterSubCity}
                  subCities_DATA={subCities_DATA}
                  filterCategory={filterCategory}
                  handleFilterCategory={handleFilterCategory}
                  categories_DATA={categories_DATA}
                  filterSubCategory={filterSubCategory}
                  handleFilterSubCategory={handleFilterSubCategory}
                  subCategories_DATA={subCategories_DATA}
                  handleToggleFilterForm={handleToggleFilterForm}
                  showFilterForm={showFilterForm}
                />
                <Col lg={10}>
                  <div className="right-panel">
                    {ReactHtmlParser(pageHeading_DATA || "")}
                    <SearchBar
                      handleSubmitSearch={handleSubmitSearch}
                      searchKeyword={searchKeyword}
                      handleSearchKeyword={handleSearchKeyword}
                    />
                    <ViewToggle view={view} setView={setView} />
                    <PostListContainer
                      view={view}
                      postListAlertMessage_DATA={postListAlertMessage_DATA}
                      alertMessage={alertMessage}
                      isLoading={isLoading}
                      isSamePostFilter={isSamePostFilter}
                      posts_DATA={posts_DATA}
                      listBgColor={listBgColor}
                      handleNewPostAdsClick={handleNewPostAdsClick}
                      handlePostDetailUrl={handlePostDetailUrl}
                      postPagination_DATA={postPagination_DATA}
                      handlePageChange={handlePageChange}
                    />
                    <PostTypeAds postTypeAds_DATA={postTypeAds_DATA} />
                    <SubCategoryContent
                      subCategoryContent_DATA={subCategoryContent_DATA}
                    />
                  </div>
                </Col>
              </Row>
            </Container>
          </Col>
          <RightAdsPanel isMobile={isMobile} rightAds_DATA={rightAds_DATA} />
        </Row>
        <SponserSites className="mt-4" />
      </div>
      <Footer className="mt-4" />
    </>
  );
};
PostList.propTypes = {};

const LeftAdsPanel = memo(({ isMobile, leftAds_DATA }) => {
  return (
    <>
      {!isMobile && (
        <Col lg={1} md={1} sm={12} xs={12}>
          <div className="left-ads">
            <AdsCarousel adsList={leftAds_DATA} />
          </div>
        </Col>
      )}
    </>
  );
});

const RightAdsPanel = memo(({ isMobile, rightAds_DATA }) => {
  return (
    <>
      {!isMobile && (
        <Col lg={1} md={1} sm={12} xs={12}>
          <div className="right-ads">
            <AdsCarousel adsList={rightAds_DATA} />
          </div>
        </Col>
      )}
    </>
  );
});

const BreadcrumbSection = memo(({ subCity, category, subCategory }) => {
  return (
    <Row className="mt-3">
      <Col>
        <Breadcrumb className="breadcrumb-area">
          <Breadcrumb.Item active>{unslugify(subCity)}</Breadcrumb.Item>
          <Breadcrumb.Item active>{unslugify(category)}</Breadcrumb.Item>
          <Breadcrumb.Item active>{unslugify(subCategory)}</Breadcrumb.Item>
        </Breadcrumb>
      </Col>
    </Row>
  );
});

const FilterPanel = memo(
  ({
    isDesktop,
    handleFilterFormSubmit,
    filterSubCity,
    handleFilterSubCity,
    subCities_DATA,
    filterCategory,
    handleFilterCategory,
    categories_DATA,
    filterSubCategory,
    handleFilterSubCategory,
    subCategories_DATA,
    handleToggleFilterForm,
    showFilterForm,
  }) => {
    const FilterForm = () => (
      <Form className="filterForm" onSubmit={handleFilterFormSubmit}>
        <Form.Group className="mb-2" controlId="subcity">
          <Form.Select
            aria-label="Default select example"
            size="sm"
            value={filterSubCity?.id || ""}
            onChange={handleFilterSubCity}
          >
            <option value={""}>Select Sub City</option>
            {subCities_DATA &&
              subCities_DATA.map((subCity) => (
                <option key={subCity.id} value={subCity.id}>
                  {subCity.subcity}
                </option>
              ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-2" controlId="category">
          <Form.Select
            aria-label="Default select example"
            size="sm"
            value={filterCategory?.id || ""}
            onChange={handleFilterCategory}
          >
            <option value={""}>Select Category</option>
            {categories_DATA &&
              categories_DATA.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.category}
                </option>
              ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-2" controlId="subCategory">
          <Form.Select
            aria-label="Default select example"
            size="sm"
            value={filterSubCategory?.id || ""}
            onChange={handleFilterSubCategory}
          >
            <option value={""}>Select Sub Category</option>
            {subCategories_DATA &&
              subCategories_DATA.map((subCategory) => (
                <option key={subCategory.id} value={subCategory.id}>
                  {subCategory.subcategory}
                </option>
              ))}
          </Form.Select>
        </Form.Group>

        <div className="d-grid mt-2">
          <Button
            variant="primary"
            size="sm"
            type="submit"
            className="filter_btn"
          >
            Filter
          </Button>
        </div>
      </Form>
    );

    return (
      <Col lg={2}>
        {isDesktop ? (
          <div className="left-panel h-100">
            <FilterForm />
          </div>
        ) : (
          <>
            <Button
              className={`filter-toggle-btn mb-2`}
              onClick={handleToggleFilterForm}
            >
              <FontAwesomeIcon icon={faCogs} /> Filter
            </Button>
            {showFilterForm && (
              <div className="left-panel h-0">
                <FilterForm />
              </div>
            )}
          </>
        )}
      </Col>
    );
  }
);

const SearchBar = memo(
  ({ handleSubmitSearch, searchKeyword, handleSearchKeyword }) => {
    return (
      <Row>
        <Col>
          <Form onSubmit={handleSubmitSearch}>
            <InputGroup className="search-input-group">
              <Form.Control
                placeholder="Search"
                aria-label="Search"
                aria-describedby="basic-addon2"
                className="search-input"
                value={searchKeyword}
                onChange={handleSearchKeyword}
              />
              <InputGroup.Text
                id="basic-addon2"
                className="search-button-container"
              >
                <Button
                  variant="primary"
                  className="search-button"
                  type="submit"
                >
                  <FontAwesomeIcon icon={faSearch} />
                </Button>
              </InputGroup.Text>
            </InputGroup>
          </Form>
        </Col>
      </Row>
    );
  }
);

const ViewToggle = memo(({ view, setView }) => {
  return (
    <Row className="mt-4">
      <Col>
        <ButtonGroup className="listBtnGroup">
          <Button
            className={`${view === "list" ? "active" : ""}`}
            onClick={() => setView("list")}
          >
            <FontAwesomeIcon icon={faListUl} /> List
          </Button>
          <Button
            className={`${view === "thumb" ? "active" : ""}`}
            onClick={() => setView("thumb")}
          >
            <FontAwesomeIcon icon={faImage} /> Thumb
          </Button>
          <Button
            className={`${view === "gallery" ? "active" : ""}`}
            onClick={() => setView("gallery")}
          >
            <FontAwesomeIcon icon={faThLarge} /> Gallery
          </Button>
        </ButtonGroup>
      </Col>
    </Row>
  );
});

const PostListView = memo(
  ({
    isLoading,
    isSamePostFilter,
    posts_DATA,
    listBgColor,
    handleNewPostAdsClick,
    handlePostDetailUrl,
  }) => {
    return (
      <>
        {isLoading && (!isSamePostFilter || posts_DATA.length === 0) ? (
          Array.from({ length: 5 }).map((_, index) => (
            <Row key={`${index}`} className="list-row">
              <Col>
                <div
                  className="list-item"
                  style={{
                    backgroundColor: `${listBgColor[""]}`,
                  }}
                >
                  <CustomPlaceholder key={index} />
                </div>
              </Col>
            </Row>
          ))
        ) : (
          <>
            {posts_DATA.map((item) => (
              <Row key={`${item?.postAdsType}-${item.id}`} className="list-row">
                <Col>
                  <div
                    className="list-item"
                    style={{
                      backgroundColor: `${
                        listBgColor[item?.postAdsType || ""]
                      }`,
                    }}
                  >
                    {/* Conditionally render the "Featured" badge */}
                    {item?.postAdsType === "featuredPostAds" ? (
                      <Badge pill bg="warning">
                        Featured
                        <FontAwesomeIcon
                          className="ms-1"
                          style={{ fontSize: "11px" }}
                          icon={faStarRegular}
                        />
                      </Badge>
                    ) : item?.postAdsType === "newPostAds" ? (
                      <></>
                    ) : item?.postAdsType === "googleAds" ? (
                      <></>
                    ) : item?.postAdsType === "postAds" ? (
                      <Badge pill bg="warning">
                        Post Ads <FontAwesomeIcon icon={faStarRegular} />
                      </Badge>
                    ) : (
                      <>
                        <FontAwesomeIcon
                          icon={faStarRegular}
                          style={{ fontSize: "11px" }}
                          className="icon"
                        />
                        <span className="date ms-1">{item.postDate}</span>
                      </>
                    )}

                    {/* Content */}
                    {item?.postAdsType === "newPostAds" ? (
                      <Link
                        href={"/"}
                        onClick={(e) => {
                          e.preventDefault(); // Prevent default navigation behavior
                          handleNewPostAdsClick(item); // Pass the item to the function
                        }}
                        className="content-link ms-1"
                      >
                        <FontAwesomeIcon
                          className="ml-1"
                          style={{ fontSize: "10px" }}
                          icon={faStarRegular}
                        />{" "}
                        {sanitizeHTML(item.title)}
                      </Link>
                    ) : item?.postAdsType === "postAds" ? (
                      <a
                        href={item?.target_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <LazyImage
                          src={item?.thumbnail}
                          alt={sanitizeHTML(item?.title) || "post-ads-img"}
                        />
                      </a>
                    ) : item?.postAdsType === "googleAds" ? (
                      <>
                        <span className="content-link">
                          {ReactHtmlParser(item?.content)}
                        </span>
                      </>
                    ) : (
                      <Link
                        href={handlePostDetailUrl(item)}
                        className="content-link ms-1"
                      >
                        {sanitizeHTML(item.title)}
                      </Link>
                    )}
                    {/* Location && Image */}
                    <div className="location ms-1 d-inline-flex">
                      {`${
                        item.city || item.subCity
                          ? `(${item.city || ""}${
                              item.city && item.subCity ? ", " : ""
                            }${item.subCity || ""})`
                          : ""
                      }`.trim()}

                      <span className="ms-1 text-success">{`${
                        item?.hasImg || ""
                      }`}</span>
                    </div>
                  </div>
                </Col>
              </Row>
            ))}
          </>
        )}
      </>
    );
  }
);

const PostThumbView = memo(
  ({
    isLoading,
    isSamePostFilter,
    posts_DATA,
    listBgColor,
    handlePostDetailUrl,
  }) => {
    return (
      <>
        {isLoading && (!isSamePostFilter || posts_DATA.length === 0) ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`${index}`}
              className="thumb-item d-flex align-items-center"
              style={{
                backgroundColor: `${listBgColor[""]}`,
              }}
            >
              <div className="img-col">
                <CustomPlaceholder className="small-thumb" />
              </div>
              <div className="content-col w-100">
                <CustomPlaceholder className="content-link ms-1" />
              </div>
            </div>
          ))
        ) : (
          <>
            {posts_DATA.map((item) => (
              <div
                key={`${item?.postAdsType}-${item.id}`}
                className="thumb-item d-flex align-items-center"
                style={{
                  backgroundColor: `${listBgColor[item?.postAdsType || ""]}`,
                }}
              >
                <div className="img-col">
                  {item?.postAdsType === "newPostAds" ||
                  item?.postAdsType === "googleAds" ||
                  item?.postAdsType === "postAds" ? (
                    <div className="small-thumb" style={{ border: 0 }} />
                  ) : (
                    <div className="small-thumb">
                      <LazyImage src={item.thumbnail} alt="post-image" />
                    </div>
                  )}
                </div>
                <div className="content-col">
                  {/* Conditionally render the "Featured" badge */}
                  {item?.postAdsType === "featuredPostAds" ? (
                    <Badge pill bg="warning">
                      Featured
                      <FontAwesomeIcon
                        className="ms-1"
                        style={{ fontSize: "11px" }}
                        icon={faStarRegular}
                      />
                    </Badge>
                  ) : item?.postAdsType === "newPostAds" ? (
                    <></>
                  ) : item?.postAdsType === "googleAds" ? (
                    <></>
                  ) : item?.postAdsType === "postAds" ? (
                    <Badge pill bg="warning">
                      Post Ads <FontAwesomeIcon icon={faStarRegular} />
                    </Badge>
                  ) : (
                    <>
                      <FontAwesomeIcon
                        icon={faStarRegular}
                        style={{ fontSize: "11px" }}
                        className="icon"
                      />
                      <span className="date ms-1">{item.postDate}</span>
                    </>
                  )}

                  {/* Content */}
                  {item?.postAdsType === "newPostAds" ? (
                    <Link
                      href={`/advisment-click/${item.id}`}
                      target={item?.target_blank ? "_blank" : undefined}
                      rel={
                        item?.target_blank ? "noopener noreferrer" : undefined
                      }
                      className="content-link ms-1"
                    >
                      <FontAwesomeIcon
                        className="ml-1"
                        style={{ fontSize: "10px" }}
                        icon={faStarRegular}
                      />{" "}
                      {sanitizeHTML(item.title)}
                    </Link>
                  ) : item?.postAdsType === "postAds" ? (
                    <a href={item?.target_url} target="_blank" rel="noreferrer">
                      <LazyImage
                        src={item?.thumbnail}
                        alt={item?.title || "post-ads-img"}
                      />
                    </a>
                  ) : item?.postAdsType === "googleAds" ? (
                    <>
                      <span className="content-link">
                        {ReactHtmlParser(item?.content)}
                      </span>
                    </>
                  ) : (
                    <Link
                      href={handlePostDetailUrl(item)}
                      className="content-link ms-1"
                    >
                      {sanitizeHTML(item.title)}
                    </Link>
                  )}
                  <div className="location ms-1 d-inline-flex">
                    {`${
                      item.city || item.subCity
                        ? `(${item.city || ""}${
                            item.city && item.subCity ? ", " : ""
                          }${item.subCity || ""})`
                        : ""
                    }`.trim()}
                    <span className="ms-1 text-success">{`${
                      item?.hasImg || ""
                    }`}</span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </>
    );
  }
);

const PostGalleryView = memo(
  ({
    isLoading,
    isSamePostFilter,
    posts_DATA,
    listBgColor,
    handlePostDetailUrl,
  }) => {
    return (
      <>
        {isLoading && (!isSamePostFilter || posts_DATA.length === 0) ? (
          <Row className="gallery-row">
            {Array.from({ length: 3 }).map((_, index) => (
              <Col key={`${index}`} lg={4}>
                <div
                  className="gallery-item py-2"
                  style={{
                    backgroundColor: `${listBgColor[""]}`,
                  }}
                >
                  <Col className="d-flex align-items-center justify-content-center ">
                    <CustomPlaceholder className="gallery-img" />
                  </Col>
                  <Col>
                    <div className="text-center mt-2">
                      <CustomPlaceholder className="content-link ms-1" />
                      <CustomPlaceholder
                        widths={{ md: 2, xs: 2, sm: 2 }}
                        className="location ms-1"
                      />
                    </div>
                  </Col>
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <Row className="gallery-row">
            {posts_DATA.map((item) => (
              <Col key={`${item?.postAdsType}-${item.id}`} lg={4}>
                <div
                  className="gallery-item py-2"
                  style={{
                    backgroundColor: `${listBgColor[item?.postAdsType || ""]}`,
                  }}
                >
                  <Col className="d-flex align-items-center justify-content-center ">
                    {item?.postAdsType === "newPostAds" ||
                    item?.postAdsType === "googleAds" ||
                    item?.postAdsType === "postAds" ? (
                      <div className="gallery-img" />
                    ) : (
                      <div className="gallery-img">
                        <LazyImage src={item.thumbnail} alt="post-image" />
                      </div>
                    )}
                  </Col>
                  <Col>
                    <div className="text-center mt-2">
                      {/* Conditionally render the "Featured" badge */}
                      {item?.postAdsType === "featuredPostAds" ? (
                        <Badge pill bg="warning">
                          Featured
                          <FontAwesomeIcon
                            className="ms-1"
                            style={{ fontSize: "11px" }}
                            icon={faStarRegular}
                          />
                        </Badge>
                      ) : item?.postAdsType === "newPostAds" ? (
                        <></>
                      ) : item?.postAdsType === "googleAds" ? (
                        <></>
                      ) : item?.postAdsType === "postAds" ? (
                        <Badge pill bg="warning">
                          Post Ads <FontAwesomeIcon icon={faStarRegular} />
                        </Badge>
                      ) : (
                        <>
                          <FontAwesomeIcon
                            icon={faStarRegular}
                            style={{ fontSize: "11px" }}
                            className="icon"
                          />
                          <span className="date ms-1">{item.postDate}</span>
                        </>
                      )}

                      {/* Content */}
                      {item?.postAdsType === "newPostAds" ? (
                        <Link
                          href={`/advisment-click/${item.id}`}
                          target={item?.target_blank ? "_blank" : undefined}
                          rel={
                            item?.target_blank
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="content-link ms-1"
                        >
                          <FontAwesomeIcon
                            className="ml-1"
                            style={{ fontSize: "10px" }}
                            icon={faStarRegular}
                          />{" "}
                          {truncatedContent(sanitizeHTML(item.title), 80)}
                        </Link>
                      ) : item?.postAdsType === "postAds" ? (
                        <a
                          href={item?.target_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <LazyImage
                            src={item?.thumbnail}
                            alt={item?.title || "post-ads-img"}
                          />
                        </a>
                      ) : item?.postAdsType === "googleAds" ? (
                        <>
                          <span className="content-link">
                            {ReactHtmlParser(item?.content)}
                          </span>
                        </>
                      ) : (
                        <Link
                          href={handlePostDetailUrl(item)}
                          className="content-link ms-1"
                        >
                          {truncatedContent(sanitizeHTML(item.title), 80)}
                        </Link>
                      )}

                      <div className="d-inline-flex location ms-1">
                        {`${
                          item.city || item.subCity
                            ? `(${item.city || ""}${
                                item.city && item.subCity ? ", " : ""
                              }${item.subCity || ""})`
                            : ""
                        }`.trim()}
                        <span className="ms-1 text-success">{`${
                          item?.hasImg || ""
                        }`}</span>
                      </div>
                    </div>
                  </Col>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </>
    );
  }
);

const PostListContainer = memo(
  ({
    view,
    postListAlertMessage_DATA,
    alertMessage,
    isLoading,
    isSamePostFilter,
    posts_DATA,
    listBgColor,
    handleNewPostAdsClick,
    handlePostDetailUrl,
    postPagination_DATA,
    handlePageChange,
  }) => {
    return (
      <>
        <Row className="mt-4">
          <Col>
            {postListAlertMessage_DATA && (
              <Col>
                <div className="alert-msg">
                  {ReactHtmlParser(postListAlertMessage_DATA)}
                </div>
              </Col>
            )}

            <div className="mt-2">
              <AlertMessage {...alertMessage} />
              {view === "list" && (
                <PostListView
                  isLoading={isLoading}
                  isSamePostFilter={isSamePostFilter}
                  posts_DATA={posts_DATA}
                  listBgColor={listBgColor}
                  handleNewPostAdsClick={handleNewPostAdsClick}
                  handlePostDetailUrl={handlePostDetailUrl}
                />
              )}
              {view === "thumb" && (
                <PostThumbView
                  isLoading={isLoading}
                  isSamePostFilter={isSamePostFilter}
                  posts_DATA={posts_DATA}
                  listBgColor={listBgColor}
                  handlePostDetailUrl={handlePostDetailUrl}
                />
              )}
              {view === "gallery" && (
                <PostGalleryView
                  isLoading={isLoading}
                  isSamePostFilter={isSamePostFilter}
                  posts_DATA={posts_DATA}
                  listBgColor={listBgColor}
                  handlePostDetailUrl={handlePostDetailUrl}
                />
              )}
            </div>
          </Col>
        </Row>

        <Row>
          <Col>
            {!isLoading && postPagination_DATA?.totalPosts > 0 && (
              <CustomPagination
                totalItems={postPagination_DATA?.totalPosts || 0}
                itemsPerPage={postPagination_DATA?.perPageLimit || 0}
                activePage={parseInt(postPagination_DATA?.currentPage || 1)}
                onPageChange={handlePageChange}
              />
            )}
          </Col>
        </Row>
      </>
    );
  }
);

const PostTypeAds = memo(({ postTypeAds_DATA }) => {
  return (
    <>
      {postTypeAds_DATA && (
        <Row className="mt-3">
          {postTypeAds_DATA.map((ads) => (
            <Col lg={12} key={ads.id} className="text-center">
              <a
                href={ads?.target_url}
                target={ads?.target_blank ? "_blank" : undefined}
                rel={ads?.target_blank ? "noopener noreferrer" : undefined}
              >
                <LazyImage
                  src={ads?.path}
                  alt={ads?.title || "post-ads"}
                  className="img-fluid"
                  isDynamic={false}
                />
              </a>
            </Col>
          ))}
        </Row>
      )}
    </>
  );
});

const SubCategoryContent = memo(({ subCategoryContent_DATA }) => {
  return (
    <>
      {subCategoryContent_DATA && (
        <Row className="px-3 py-2 mt-4">
          <Col className="about_section">
            {ReactHtmlParser(subCategoryContent_DATA)}
          </Col>
        </Row>
      )}
    </>
  );
});

export default memo(PostList);
