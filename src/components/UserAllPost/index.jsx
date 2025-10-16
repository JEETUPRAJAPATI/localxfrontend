import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { memo, Suspense, useCallback, useEffect, useState } from "react";
import { Button, Col, Container, Row, Table } from "react-bootstrap";

import { faEdit, faEye, faTimes } from "@fortawesome/free-solid-svg-icons"; // Import icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { deleteUserPostAPI, getUserAllPostAPI } from "@/api/apiAuthService.js";

import FixedAuthHeader from "@/components/FixedAuthHeader";

// Redux
import { setAuthProps as setAuthProps_ACTION } from "@/store/authSlice.js";
import { ROUTES } from "@/utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

// Single memoized selector for Redux state
const storeSelectorData = createSelector(
  (state) => state.auth,
  (auth) => ({
    posts_DATA: auth?.user?.posts?.list || [],
    postPagination_DATA: auth?.user?.posts?.pagination || {},
  })
);

// Dynamic Components
const CustomPlaceholder = dynamic(
  () => import("@/components/CustomPlaceholder/index.jsx"),
  {
    ssr: false,
  }
);
const CustomPagination = dynamic(
  () => import("@/components/CustomPagination"),
  {
    ssr: false,
  }
);
const AlertMessage = dynamic(() => import("@/components/AlertMessage"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/components/Footer"), {
  ssr: false,
});

const UserAllPost = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { CODE, MESSAGE } = router.query;

  //:=========================
  // Redux Stores (Memoized)
  //:=========================
  // Extracting multiple state properties with a single selector
  const { posts_DATA, postPagination_DATA } = useSelector(storeSelectorData);

  //:========================================
  // States Declaration
  //:========================================
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  const [alertMessage, setAlertMessage] = useState({
    show: false,
  });

  //:========================================
  // Function Declaration
  //:========================================
  const fetchPostListAPI = useCallback((options = {}) => {
    const { page = 1 } = options;
    setIsLoading(true);
    getUserAllPostAPI({ page })
      .then(({ list, pagination }) => {
        dispatch(setAuthProps_ACTION({ key: "user.posts.list", data: list }));
        dispatch(
          setAuthProps_ACTION({
            key: "user.posts.pagination",
            data: pagination,
          })
        );
      })
      .catch((error) => {
        console.error("Error in getUserAllPostAPI:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handlePageChange = useCallback(
    (pageNumber) => {
      window?.scrollTo(0, 0);
      if (pageNumber == page) return false;
      setPage(pageNumber);
      fetchPostListAPI({
        page: pageNumber,
      });
    },
    [page]
  );

  const handleDeletePost = useCallback((e, id) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return false;
    }

    deleteUserPostAPI({ id })
      .then(({ message, data, code }) => {
        router.push({
          pathname: router.pathname,
          query: { MESSAGE: message, DATA: data, CODE: code },
        });

        fetchPostListAPI({
          page: 1,
        });
      })
      .catch((error) => {
        console.error("Error in deleteUserPostAPI:", error);
        const { message, data, code } = error?.response?.data || {};

        const error_code = code || "";
        let error_data = data || "";
        let error_message = message || "";
        let errors = [];

        if (message) {
          if (error_code == "VALIDATION_ERRORS") {
            errors = error_data || [];
          }

          setAlertMessage({
            show: true,
            type: "error",
            message: error_message,
            errors,
            showDismissible: false,
            showHeading: false,
          });
        }
      })
      .finally(() => {
        window.scrollTo(0, 0);
        setTimeout(() => {
          setAlertMessage({
            show: false,
          });
        }, 15000);
      });
  }, []);

  //:========================================
  // Effect Load Declaration
  //:========================================
  useEffect(() => {
    fetchPostListAPI();
  }, [fetchPostListAPI]);

  // Handle query parameter changes
  useEffect(() => {
    if (CODE && MESSAGE) {
      // Clear query params without reloading
      router.replace(router.pathname, undefined, { shallow: true });
      setAlertMessage({
        show: true,
        type: "success",
        showDismissible: false,
        showHeading: true,
        message: MESSAGE,
      });
      setTimeout(() => {
        setAlertMessage({
          show: false,
        });
      }, 15000);
    }
  }, [CODE, MESSAGE, router]);

  return (
    <>
      <FixedAuthHeader />
      <div className="userAllPost">
        <Container className="cnt">
          <AlertMessage {...alertMessage} />
          {/* Panel Heading */}
          <div className="panel-heading">
            <h3>All Post</h3>
          </div>
          {/* Panel Body */}
          <div className="panel-body">
            <Table bordered className="table_bordered">
              <thead>
                <tr style={{ fontWeight: "bold" }}>
                  <th width="5%">SL No.</th>
                  <th width="8%">Date</th>
                  <th width="15%">Title</th>
                  <th>Country</th>
                  <th>City</th>
                  <th>Sub City</th>
                  <th>Category</th>
                  <th>Sub Category</th>
                  <th>Status</th>
                  <th width="13%">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      <td colSpan={10}>
                        <CustomPlaceholder />
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    {posts_DATA.length > 0 ? (
                      <>
                        {posts_DATA.map((item) => (
                          <tr key={item.id}>
                            <td>{item.srNo}</td>
                            <td>{item.formattedDate}</td>
                            <td>{item.title}</td>
                            <td>{item.country}</td>
                            <td>{item.city}</td>
                            <td>{item.subcity}</td>
                            <td>{item.category}</td>
                            <td>{item.subcategory}</td>
                            <td>
                              <strong
                                style={{
                                  color: item.status_text_color,
                                }}
                              >
                                {item.status_text}
                              </strong>
                            </td>
                            <td>
                              <div className="d-flex align-items-center justify-content-center">
                                <Button
                                  variant="info"
                                  as={Link}
                                  href={ROUTES.userPostView.replace(
                                    ":postId",
                                    item.id
                                  )}
                                  className="me-1"
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </Button>
                                <Button
                                  variant="primary"
                                  as={Link}
                                  href={ROUTES.userPostEdit.replace(
                                    ":postId",
                                    item.id
                                  )}
                                  className="me-1"
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </Button>
                                <Button
                                  variant="danger"
                                  onClick={(e) => handleDeletePost(e, item.id)}
                                >
                                  <FontAwesomeIcon icon={faTimes} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </>
                    ) : (
                      <>
                        <tr>
                          <td colSpan={10}>No Records Found</td>
                        </tr>
                      </>
                    )}
                  </>
                )}
              </tbody>
            </Table>
            <Row>
              <Col>
                {!isLoading && postPagination_DATA?.totalPosts > 0 && (
                  <Suspense fallback={<CustomPlaceholder />}>
                    <CustomPagination
                      totalItems={postPagination_DATA?.totalPosts || 0}
                      itemsPerPage={postPagination_DATA?.perPageLimit || 0}
                      activePage={parseInt(
                        postPagination_DATA?.currentPage || 1
                      )}
                      onPageChange={handlePageChange}
                    />
                  </Suspense>
                )}
              </Col>
            </Row>
          </div>
          {/* Panel Footer */}
          <div className="panel-footer" />
        </Container>
      </div>
      <Footer className="bottom-fixed" />
    </>
  );
};

UserAllPost.propTypes = {};

export default memo(UserAllPost);
