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
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Link from "next/link";
import PropTypes from "prop-types";
import ReactHtmlParser from "html-react-parser";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  getCategorySponsersAPI,
  getCategoryTopSideNavLinksAPI,
} from "@/api/apiService";
import { setPartners_ACTION } from "@/store/partnersSlice";
import { setSponsers_ACTION } from "@/store/sponsersSlice";
import { setTopSideNavLinks } from "@/store/topSideNavLinksSlice";
import { setPageProps_ACTION } from "@/store/pageSlice";
import { sanitizeHTML } from "@/utils/helpers";
import CustomPlaceholder from "@/components/CustomPlaceholder";
import { ROUTES } from "@/utils/constant";
import useDeviceSize from "@/customHooks/useDeviceSize";
import FixedHeader from "@/components/FixedHeader";
import { connect } from "react-redux";

const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });
const SponserSites = dynamic(() => import("@/components/SponserSites"), {
  ssr: false,
});
const PartnerCard = dynamic(() => import("@/components/Partners/PartnerCard"), {
  ssr: false,
});
const AlertMessage = dynamic(() => import("@/components/AlertMessage"), {
  ssr: false,
});

const PartnerList = ({
  initialPartners,
  initialPartnersContent,
  setSponsers_ACTION,
  setPartners_ACTION,
  setPageProps_ACTION,
  setTopSideNavLinks_ACTION,
  partners_DATA,
  partners_content_DATA,
  pageHeading_DATA,
}) => {
  const router = useRouter();
  const { width } = useDeviceSize();
  const { MESSAGE, CODE } = router.query;

  // States
  const [isLoading, setIsLoading] = useState({
    partner_list: true, // Start with loading true
    sponser_list: false,
  });
  const [keyword, setKeyword] = useState("");
  const [alertMessage, setAlertMessage] = useState({ show: false });

  // Handle search
  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      const trimmedKeyword = keyword.trim();
      if (trimmedKeyword) {
        router.push({
          pathname: ROUTES.siteLinkSearch || "/search",
          query: { q: trimmedKeyword },
        });
      }
    },
    [keyword, router]
  );

  // Handle input change
  const handleInputChange = useCallback((e) => {
    setKeyword(e.target.value);
  }, []);

  // Fetch additional data (sponsers and topSideNavLinks)
  const fetchCommonAPI = useCallback(() => {
    const fetchAPI = async () => {
      try {
        setIsLoading((prev) => ({ ...prev, sponser_list: true }));

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
      } finally {
        setIsLoading((prev) => ({ ...prev, sponser_list: false }));
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

  // Initialize Redux store with initial data and stop loading
  useEffect(() => {
    if (initialPartners) {
      setPartners_ACTION(initialPartners);
      setIsLoading((prev) => ({ ...prev, partner_list: false }));
    }
    if (initialPartnersContent) {
      setPageProps_ACTION({ key: "partners", data: initialPartnersContent });
    }
  }, [
    initialPartners,
    initialPartnersContent,
    setPartners_ACTION,
    setPageProps_ACTION,
  ]);

  return (
    <>
      <FixedHeader />
      <div className="partnerList">
        <Container className="plcnt">
          <Row className="mt-3">
            <Col>
              <Breadcrumb className="breadcrumb-area">
                <Breadcrumb.Item linkAs={Link} href={ROUTES.home || "/"}>
                  Home
                </Breadcrumb.Item>
                <Breadcrumb.Item active>Partners</Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col>
              {ReactHtmlParser(pageHeading_DATA || "")}
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

          <Row className="mt-3 g-2">
            {isLoading.partner_list ? (
              // Show 4 placeholder items
              Array.from({ length: 4 }).map((_, index) => (
                <Col lg={3} md={4} sm={6} xs={12} key={`placeholder-${index}`}>
                  <CustomPlaceholder height="300px" />
                </Col>
              ))
            ) : partners_DATA.length > 0 ? (
              // Show actual partner data
              partners_DATA.map((partner, partnerIndex) => (
                <Col lg={3} md={4} sm={6} xs={12} key={partnerIndex}>
                  <PartnerCard partner={partner} height={330} itemSize={35} />
                </Col>
              ))
            ) : (
              // Show empty state
              <Col>
                <div className="text-center py-4">No partners found.</div>
              </Col>
            )}
          </Row>
        </Container>
        {partners_content_DATA && (
          <Container className="pldesccnt mt-3">
            <Row>
              <Col className="partnerListDesc">
                {ReactHtmlParser(sanitizeHTML(partners_content_DATA || ""))}
              </Col>
            </Row>
          </Container>
        )}
        <SponserSites className="mt-4" />
      </div>
      <Footer className="mt-4" />
    </>
  );
};

// Prop validation
PartnerList.propTypes = {
  initialPartners: PropTypes.array,
  initialPartnersContent: PropTypes.string,
  partners_DATA: PropTypes.array,
  partners_content_DATA: PropTypes.string,
  pageHeading_DATA: PropTypes.string,
  setPageProps_ACTION: PropTypes.func,
  setPartners_ACTION: PropTypes.func,
  setSponsers_ACTION: PropTypes.func,
  setTopSideNavLinks_ACTION: PropTypes.func,
};

// Map state to props
const mapStateToProps = (state) => ({
  partners_DATA: state?.partners || [],
  partners_content_DATA: state?.page?.partners || "",
  pageHeading_DATA: sanitizeHTML(state?.headSeo?.pageHeading || ""),
});

const mapDispatchToProps = {
  setPageProps_ACTION,
  setPartners_ACTION,
  setSponsers_ACTION,
  setTopSideNavLinks_ACTION: setTopSideNavLinks,
};

export default connect(mapStateToProps, mapDispatchToProps)(memo(PartnerList));
