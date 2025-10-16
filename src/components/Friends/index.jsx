import { lazy, memo, useCallback, useEffect, useState } from "react";

import { connect } from "react-redux";

import {
  getCategoryTopSideNavLinksAPI,
  getFriendsAdsAPI,
  getFriendsAPI,
} from "@/api/apiService.js";

import { setFriendsProps } from "@/store/friendsSlice.js";
import { setTopSideNavLinks } from "@/store/topSideNavLinksSlice.js";
import PropTypes from "prop-types";

const FixedHeader = lazy(() => import("@/components/FixedHeader/index.jsx"));
const Footer = lazy(() => import("@/components/Footer/index.jsx"));
const FriendSites = lazy(() => import("@/components/FriendSites/index.jsx"));

const Friends = (props) => {
  //:========================================
  // Component Props
  //:========================================
  const {
    setFriendsProps_ACTION,
    setTopSideNavLinks_ACTION,
    friends_DATA,
    friendsAds_DATA,
  } = props;

  //:========================================
  // States Declaration
  //:========================================
  const [isLoading, setIsLoading] = useState(false);

  //:========================================
  // Function Declaration
  //:========================================

  const fetchCommonAPI = useCallback(() => {
    const fetchAPI = async () => {
      try {
        setIsLoading(true);
        getFriendsAPI()
          .then((friends) =>
            setFriendsProps_ACTION({
              key: "list",
              data: friends,
            })
          )
          .catch((error) => {
            console.error("Error in getFriendsAPI:", error);
          })
          .finally(() => setIsLoading(false));

        getCategoryTopSideNavLinksAPI()
          .then((topSideNavLinks) => setTopSideNavLinks_ACTION(topSideNavLinks))
          .catch((error) => {
            console.error("Error in getCategoryTopSideNavLinksAPI:", error);
          });

        getFriendsAdsAPI()
          .then((ads) =>
            setFriendsProps_ACTION({
              key: "ads",
              data: ads,
            })
          )
          .catch((error) => {
            console.error("Error in getFriendsAdsAPI:", error);
          });
      } catch (error) {
        console.error("Failed to fetch common API:", error);
      }
    };
    fetchAPI();
  }, []);

  //:========================================
  // Effect Load Declaration
  //:========================================
  useEffect(() => {
    fetchCommonAPI();
  }, [fetchCommonAPI]);

  return (
    <>
      <FixedHeader />
      <div className="friends">
        <FriendSites
          className="cnt"
          isLoading={isLoading}
          friends={friends_DATA}
          ads={friendsAds_DATA}
        />
      </div>
      <Footer className="mt-4" />
    </>
  );
};

// Prop validation
Friends.propTypes = {
  // Props
  friends_DATA: PropTypes.array,
  friendsAds_DATA: PropTypes.array,
  // Functions
  setFriendsProps_ACTION: PropTypes.func,
  setTopSideNavLinks_ACTION: PropTypes.func,
};

// Map state to props
const mapStateToProps = (state) => ({
  friends_DATA: state?.friends?.list || [],
  friendsAds_DATA: state?.friends?.ads || [],
});

const mapDispatchToProps = {
  setFriendsProps_ACTION: setFriendsProps,
  setTopSideNavLinks_ACTION: setTopSideNavLinks,
};

export default connect(mapStateToProps, mapDispatchToProps)(memo(Friends));
