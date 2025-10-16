// src/components/Home.js
import { getUserPostDetailAPI } from "@/api/apiAuthService.js";
import { sanitizeHTML } from "@/utils/helpers.js";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useState } from "react";
import {
  Button,
  ButtonGroup,
  Col,
  Container,
  Row,
  Table,
} from "react-bootstrap";

import FixedAuthHeader from "@/components/FixedAuthHeader";

// Redux
import { setAuthProps as setAuthProps_ACTION } from "@/store/authSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { ROUTES } from "@/utils/constant";

// Single memoized selector for Redux state
const storeSelectorData = createSelector(
  (state) => state.auth,
  (auth) => ({
    post_DATA: auth?.user?.post || {},
  })
);

// Dynamic Components
const CustomPlaceholder = dynamic(
  () => import("@/components/CustomPlaceholder/index.jsx"),
  {
    ssr: false,
  }
);
const PostView = dynamic(() => import("@/components/PostView"), {
  ssr: false,
});
const AlertMessage = dynamic(() => import("@/components/AlertMessage"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/components/Footer"), {
  ssr: false,
});

const UserPostView = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { postId } = router.query;

  //:=========================
  // Redux Stores (Memoized)
  //:=========================
  // Extracting multiple state properties with a single selector
  const { post_DATA } = useSelector(storeSelectorData);

  //:========================================
  // States Declaration
  //:========================================
  const [showPostRelativeTime, setShowPostRelativeTime] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState({
    show: false,
  });

  //:========================================
  // Function Declaration
  //:========================================

  // Toggle between relative time and actual date
  const toggleDate = useCallback(() => {
    setShowPostRelativeTime((prev) => !prev);
  }, []);

  //:========================================
  // Effect Load Declaration
  //:========================================

  useEffect(() => {
    const fetchAPI = async () => {
      setIsLoading(true);
      try {
        getUserPostDetailAPI(postId)
          .then((detail) =>
            dispatch(
              setAuthProps_ACTION({
                key: "user.post",
                data: detail,
              })
            )
          )
          .catch((error) => {
            console.error("Error in getUserPostDetailAPI:", error);
            const { message } = error?.response?.data || {};

            setAlertMessage({
              show: true,
              type: "error",
              message: message,
              showDismissible: false,
              showHeading: false,
              // className: 'm-2',
            });
          })
          .finally(() => {
            setIsLoading(false);
          });
      } catch (error) {
        console.error("An unexpected error occurred:", error);
      }
    };

    fetchAPI();
  }, [postId]);

  return (
    <>
      <FixedAuthHeader />

      <div className="userPostView">
        <Container className="cnt">
          {/* Panel Heading */}
          <div className="panel-heading">
            <h3>View Post</h3>
          </div>
          {/* Panel Body */}
          <div className="panel-body">
            <AlertMessage {...alertMessage} />
            {/* Replace with Post View Component */}
            <div className="postViewWrapper">
              {/* Buttons with icons centered */}
              <Row className="mt-3 text-center">
                <Col>
                  {isLoading ? (
                    <CustomPlaceholder />
                  ) : (
                    <ButtonGroup className="direction-btn">
                      {/* Previous Post Button */}
                      {post_DATA?.prev_post_id ? (
                        <Button
                          as={Link}
                          href={ROUTES?.userPostView?.replace(
                            ":postId",
                            post_DATA?.prev_post_id
                          )}
                          variant="primary"
                        >
                          ◀ Prev
                        </Button>
                      ) : (
                        <Button variant="primary" disabled>
                          ◀ Prev
                        </Button>
                      )}

                      {/* Post List Button */}
                      <Button
                        as={Link}
                        href={ROUTES?.userPostList}
                        variant="secondary"
                      >
                        ▲
                      </Button>

                      {/* Next Post Button */}
                      {post_DATA?.next_post_id ? (
                        <Button
                          as={Link}
                          href={ROUTES?.userPostView?.replace(
                            ":postId",
                            post_DATA?.next_post_id
                          )}
                          variant="primary"
                        >
                          Next ▶
                        </Button>
                      ) : (
                        <Button variant="primary" disabled>
                          Next ▶
                        </Button>
                      )}
                    </ButtonGroup>
                  )}
                </Col>
              </Row>

              <PostView
                isLoading={isLoading}
                title={post_DATA?.title || ""}
                description={post_DATA?.description || ""}
                postDate={post_DATA?.date || ""}
                formattedDate={post_DATA?.formattedDate || ""}
                relativeTime={post_DATA?.relativeTime || ""}
                email={post_DATA?.email || ""}
                phone={post_DATA?.phone || ""}
                images={(post_DATA?.images || []).map((item) => ({
                  ...item,
                  src: item.path,
                  alt: `${item.id} - ${post_DATA?.title || ""}`,
                }))}
                tableData={
                  <Table bordered hover>
                    <tbody>
                      <tr>
                        <th width="50%">Sex</th>
                        <td>
                          {isLoading ? (
                            <CustomPlaceholder />
                          ) : (
                            post_DATA?.sex || "-"
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th width="50%">Age</th>
                        <td>
                          {isLoading ? (
                            <CustomPlaceholder />
                          ) : (
                            post_DATA?.age || "-"
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th width="50%">Sexual Oriantation</th>
                        <td>
                          {isLoading ? (
                            <CustomPlaceholder />
                          ) : (
                            post_DATA?.sexual_oriantation || "-"
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th width="50%">Location</th>
                        <td>
                          {isLoading ? (
                            <CustomPlaceholder />
                          ) : (
                            post_DATA?.location || "-"
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                }
              />

              {/* Post ID, Posted, and Post Report Modal */}
              <Row className="mt-3">
                <Col className="post-footer">
                  <div className="ft me-4">
                    Post Id:{" "}
                    {isLoading ? (
                      <CustomPlaceholder
                        as="span"
                        className="ms-1"
                        outerStyle={{ width: "50px" }}
                      />
                    ) : (
                      post_DATA?.id || "-"
                    )}
                  </div>
                  <div className="ft me-4">
                    <strong>Posted:</strong>
                    {isLoading ? (
                      <CustomPlaceholder
                        as="span"
                        className="ms-1"
                        outerStyle={{ width: "50px" }}
                      />
                    ) : (
                      <span className="post-date ms-1" onClick={toggleDate}>
                        {showPostRelativeTime
                          ? sanitizeHTML(post_DATA?.relativeTime)
                          : sanitizeHTML(post_DATA?.formattedDate)}
                      </span>
                    )}
                  </div>
                </Col>
              </Row>
            </div>
          </div>
          {/* Panel Footer */}
          <div className="panel-footer" />
        </Container>
      </div>
      <Footer className="bottom-fixed" />
    </>
  );
};

UserPostView.propTypes = {};

export default memo(UserPostView);
