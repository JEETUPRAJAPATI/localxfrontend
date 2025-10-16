import { useState, lazy, memo, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types"; // Import PropTypes
import { Badge, Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { connect } from "react-redux";
import ReactHtmlParser from "html-react-parser";
import { sanitizeHTML } from "@/utils/helpers";
import {
  getUserNotificationsAPI,
  readUserNotificationsAPI,
} from "@/api/apiAuthService.js";
import { setAuthProps } from "@/store/authSlice.js";
import CustomPlaceholder from "@/components/CustomPlaceholder/index.jsx";

const LazyImage = lazy(() => import("@/components/LazyImage/index.jsx"));

const NotificationBell = (props) => {
  const router = useRouter();
  const currentLocationPath = router.asPath;

  const notificationItemsRef = useRef(null);
  //:========================================
  // Component Props
  //:========================================
  const {
    notifications_DATA,
    totalUnreadNotificationCount,
    notificationPagination_DATA,
    setAuthProps_ACTION,
  } = props;

  //:========================================
  // States Declaration
  //:========================================
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  //:========================================
  // Function Declaration
  //:========================================

  const fetchNotificationsAPI = useCallback((page = 1) => {
    try {
      setIsLoading(true);
      // const previousScrollTop = notificationItemsRef.current?.scrollTop || 0;

      getUserNotificationsAPI({ page, timestamp: new Date().getTime() })
        .then(({ list, pagination }) => {
          setAuthProps_ACTION({
            key: "user.notifications.list",
            data: list,
            type: page === 1 ? "" : "load_more_notifications",
          });
          setAuthProps_ACTION({
            key: "user.notifications.pagination",
            data: pagination,
          });
        })
        .catch((error) => {
          console.error("Error in getUserNotificationsAPI:", error);
        })
        .finally(() => {
          setIsLoading(false);
          // Restore scroll position once updates are complete
          // requestAnimationFrame(() => {
          //   if (notificationItemsRef.current) {
          //     notificationItemsRef.current.scrollTop = previousScrollTop;
          //   }
          // });
        });
    } catch (error) {
      console.error("Failed to fetch top notifications API:", error);
    }
  }, []);

  const handleToggleDropdown = (isOpen) => {
    setShowDropdown(isOpen);
  };

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } =
      notificationItemsRef.current;
    const { currentPage, totalPages } = notificationPagination_DATA;

    const currentPage1 = parseInt(currentPage);
    const totalPages1 = parseInt(totalPages);

    if (
      scrollHeight - scrollTop <= clientHeight + 100 &&
      !isLoading &&
      currentPage1 < totalPages1
    ) {
      const newPage = currentPage1 + 1;
      fetchNotificationsAPI(newPage);
    }
  };
  const handleReadNotification = useCallback((notificationId) => {
    readUserNotificationsAPI({ id: notificationId })
      .then(({ data }) => {
        // Update Read in Notification List
        setAuthProps_ACTION({
          key: "user.notifications.list",
          data: notificationId,
          type: "update_read_notification",
        });

        // Update Notification Count in Profile
        setAuthProps_ACTION({
          key: "user.profile",
          data: data.totalUnreadNotificationCount,
          type: "update_profile_notification_count",
        });
      })
      .catch((error) => {
        console.error("Error in readUserNotificationsAPI:", error);
      });
  }, []);

  //:========================================
  // Effect Load Declaration
  //:========================================

  useEffect(() => {
    fetchNotificationsAPI(1);
  }, [currentLocationPath, fetchNotificationsAPI]);

  return (
    <Dropdown
      onMouseEnter={() => handleToggleDropdown(true)}
      onMouseLeave={() => handleToggleDropdown(false)}
      show={showDropdown}
      className="user-notification-bell ms-1 mt-1"
    >
      <Dropdown.Toggle
        variant="link"
        as="span"
        className="text-decoration-none"
      >
        <FontAwesomeIcon icon={faBell} className="position-relative" />
        {totalUnreadNotificationCount > 0 && (
          <Badge
            bg="danger"
            pill
            className="position-absolute top-5 start-100 translate-middle"
          >
            {totalUnreadNotificationCount}
          </Badge>
        )}
      </Dropdown.Toggle>
      <Dropdown.Menu className="notification-dropdown p-2" flip="true">
        <Dropdown.Header>Notifications</Dropdown.Header>
        <div
          className="notification-items"
          onScroll={handleScroll}
          ref={notificationItemsRef}
        >
          {isLoading && notifications_DATA.length == 0 ? (
            Array.from({ length: 5 }).map((_, index) => (
              <Dropdown.Item key={index}>
                <CustomPlaceholder />
              </Dropdown.Item>
            ))
          ) : (
            <>
              {notifications_DATA.length > 0 ? (
                notifications_DATA.map((notif) => (
                  <Dropdown.Item
                    key={notif.id}
                    // as={Link}
                    // to={notif.link}
                    className="d-flex align-items-center justify-content-center"
                    active={notif.read_yn === "N"}
                    onClick={() => {
                      if (notif.read_yn === "Y") return; // Prevent action if already read
                      handleReadNotification(notif.id);
                    }}
                  >
                    <span>{notif.srNo}.</span>
                    <div className="image-container">
                      <LazyImage src={notif.image} width={40} height={40} />
                    </div>
                    <div className="text-container ms-2">
                      <strong>{notif.title}</strong>
                      <div className="mb-0 text-muted notification-description">
                        {ReactHtmlParser(sanitizeHTML(notif.description))}
                      </div>
                      <small className="text-muted">{notif.relativeTime}</small>
                    </div>
                  </Dropdown.Item>
                ))
              ) : (
                <p className="text-center my-2">No new notifications</p>
              )}
            </>
          )}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

NotificationBell.propTypes = {
  // Props
  notifications_DATA: PropTypes.array,
  notificationPagination_DATA: PropTypes.object,
  totalUnreadNotificationCount: PropTypes.number,
  // Functions
  setAuthProps_ACTION: PropTypes.func,
};

const mapStateToProps = (state) => ({
  notifications_DATA: state?.auth?.user?.notifications?.list || [],
  notificationPagination_DATA:
    state?.auth?.user?.notifications?.pagination || {},
});

const mapDispatchToProps = {
  setAuthProps_ACTION: setAuthProps,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(memo(NotificationBell));
