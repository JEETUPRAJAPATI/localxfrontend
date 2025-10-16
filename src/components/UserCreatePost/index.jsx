import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  getUserAddPostFetchCategoriesAPI,
  getUserAddPostFetchCitiesAPI,
  getUserAddPostFetchCountriesAPI,
  getUserAddPostFetchOtherDataAPI,
  getUserAddPostFetchSubCategoriesAPI,
  getUserAddPostFetchSubCitiesAPI,
} from "@/api/apiAuthService.js";
import { setAuthProps as setAuthProps_ACTION } from "@/store/authSlice.js";
import { CREATE_POST_STEPS_USER_PANEL, ROUTES } from "@/utils/constant.js";
import { base64ToBlob, unslugify } from "@/utils/helpers";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Breadcrumb,
  Col,
  Container,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import { useDispatch } from "react-redux";

// Dynamic Components
import FixedAuthHeader from "@/components/FixedAuthHeader";
import { faHourglassHalf } from "@fortawesome/free-solid-svg-icons";

const CountrySelection = dynamic(
  () => import("@/components/UserCreatePost/CountrySelection"),
  {
    ssr: false,
  }
);
const CitySelection = dynamic(
  () => import("@/components/UserCreatePost/CitySelection"),
  {
    ssr: false,
  }
);
const SubCitySelection = dynamic(
  () => import("@/components/UserCreatePost/SubCitySelection"),
  {
    ssr: false,
  }
);
const CategorySelection = dynamic(
  () => import("@/components/UserCreatePost/CategorySelection"),
  {
    ssr: false,
  }
);
const SubCategorySelection = dynamic(
  () => import("@/components/UserCreatePost/SubCategorySelection"),
  {
    ssr: false,
  }
);
const PostForm = dynamic(() => import("@/components/UserCreatePost/PostForm"), {
  ssr: false,
});
const PostImages = dynamic(
  () => import("@/components/UserCreatePost/PostImages"),
  {
    ssr: false,
  }
);
const PostPreview = dynamic(
  () => import("@/components/UserCreatePost/PostPreview"),
  {
    ssr: false,
  }
);
const Footer = dynamic(() => import("@/components/Footer"), {
  ssr: false,
});

// Main Component
const UserCreatePost = () => {
  const dispatch = useDispatch();

  const router = useRouter();
  const { actionType } = router.query;

  //:================================================================
  // Data Updation or Manipulation Declaration (Computation Logic)
  //:================================================================
  const initialFormData = {
    country: null,
    city: null,
    subCity: null,
    category: null,
    subCategory: null,
    title: "",
    description: "",
    email: "",
    phone: "",
    sex: "",
    age: "",
    sexualOrientation: "",
    extended_ad: "",
    featured_ad: "",
    googleCaptcha: "",
    location: "",
    images: [],
  };
  // Check Session Storage Post Form Any Changes
  const postFormStorage = JSON.parse(sessionStorage.getItem("postForm")) || {};
  const updatedFormData = useMemo(
    () => ({
      ...initialFormData,
      ...postFormStorage, // Merge stored data into formData
    }),
    [postFormStorage]
  );

  //:========================================
  // States Declaration
  //:========================================
  const [timeLeft, setTimeLeft] = useState(0); // Countdown duration
  const [isCooldown, setIsCooldown] = useState(true); // Button cooldown state

  const [step, setStep] = useState(0); // Manages which step we are on
  const [postImages, setPostImages] = useState([]);
  const [formData, setFormData] = useState(initialFormData);

  //:========================================
  // Function Declaration
  //:========================================
  const handleSelect = useCallback((type, value) => {
    setFormData((prev) => ({ ...prev, [type]: value }));
    sessionStorage.setItem(
      "postForm",
      JSON.stringify({
        ...JSON.parse(sessionStorage.getItem("postForm") || "{}"),
        [type]: value,
      })
    );
  }, []);

  const goToNextStep = useCallback(() => {
    const nextStep = parseInt(step) + 1;
    let redirect = CREATE_POST_STEPS_USER_PANEL[nextStep].route;
    router.push(redirect);
  }, [step]);

  const handleBreadcrumbClick = useCallback((stepNumber) => {
    const prevStep = stepNumber > 0 ? parseInt(stepNumber) - 1 : 0;
    let redirect = CREATE_POST_STEPS_USER_PANEL[prevStep].route;
    router.push(redirect);
  }, []);

  const fetchCommonAPI = useCallback(() => {
    const fetchAPI = async () => {
      try {
        getUserAddPostFetchCountriesAPI()
          .then((countries) =>
            dispatch(
              setAuthProps_ACTION({
                key: "user.post.add.countries",
                data: countries,
              })
            )
          )
          .catch((error) => {
            console.error("Error in getUserAddPostFetchCountriesAPI:", error);
          });
      } catch (error) {
        console.error("Failed to fetch common API:", error);
      }
    };
    fetchAPI();
  }, []);

  const handleFormChange = useCallback(({ name, value }) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value, // Use the field name as the key
    }));

    // Fetch the current object or create a new one if it doesn't exist
    const postFormStorage =
      JSON.parse(sessionStorage.getItem("postForm")) || {};
    postFormStorage[name] = value;
    sessionStorage.setItem("postForm", JSON.stringify(postFormStorage));
  }, []);

  const steps = [
    <CountrySelection
      formData={formData}
      onSelect={(value) => handleSelect("country", value)}
      nextStep={goToNextStep}
      key="0"
    />,
    <CitySelection
      formData={formData}
      onSelect={(value) => handleSelect("city", value)}
      nextStep={goToNextStep}
      key="1"
    />,
    <SubCitySelection
      formData={formData}
      onSelect={(value) => handleSelect("subCity", value)}
      nextStep={goToNextStep}
      key="2"
    />,
    <CategorySelection
      formData={formData}
      onSelect={(value) => handleSelect("category", value)}
      nextStep={goToNextStep}
      key="3"
    />,
    <SubCategorySelection
      formData={formData}
      onSelect={(value) => handleSelect("subCategory", value)}
      nextStep={goToNextStep}
      key="4"
    />,
    <PostForm
      formData={formData}
      onChange={handleFormChange}
      nextStep={goToNextStep}
      key="5"
    />,
    <PostImages
      formData={formData}
      nextStep={goToNextStep}
      setPostImages={setPostImages}
      key="6"
    />,
    <PostPreview formData={formData} postImages={postImages} key="7" />,
  ];

  const formatTimeLeft = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  }, []);

  //:========================================
  // Effect Load Declaration
  //:========================================
  useEffect(() => {
    fetchCommonAPI();
  }, [fetchCommonAPI]);

  useEffect(() => {
    // Display remaining time from localStorage
    const updateCountdown = () => {
      const now = Date.now();
      const savedTime = localStorage.getItem("countdownEnd");
      if (savedTime && !isNaN(parseInt(savedTime))) {
        const remainingTime = Math.max(
          0,
          Math.floor((parseInt(savedTime) - now) / 1000)
        );
        setTimeLeft(remainingTime);
        setIsCooldown(remainingTime > 0);
        if (remainingTime < 0) sessionStorage.removeItem("postForm");
      } else {
        setTimeLeft(0);
        setIsCooldown(false);
      }
    };

    updateCountdown(); // Initial update
    const timer = setInterval(updateCountdown, 1000); // Update every second

    // Redirect to step 0 if needed
    const replaceToStep0 = () => {
      router.replace(
        CREATE_POST_STEPS_USER_PANEL[0]?.route || ROUTES.userDashboard
      );
    };

    // Validate action type and step
    const postActionDetail = CREATE_POST_STEPS_USER_PANEL.find(
      (item) => item.actionType === actionType
    );
    if (!postActionDetail) {
      replaceToStep0();
      return;
    }

    const mainStep = postActionDetail.step || 0;

    // Update form state
    setStep(mainStep);
    setFormData(updatedFormData);

    // Convert base64 images to blobs
    const imagesBase64 = updatedFormData?.images || [];
    if (imagesBase64.length > 0) {
      const addedPostFormImgs = imagesBase64.map((base64) => {
        const [, imageData] = base64.split(",");
        const mimeType = base64.match(/data:([^;]+)/)?.[1] || "image/jpeg";
        return base64ToBlob(imageData, mimeType);
      });
      setPostImages(addedPostFormImgs);
    }

    // Fetch data based on step
    const fetchData = async () => {
      try {
        switch (mainStep.toString()) {
          case "0":
            break;

          case "1": {
            if (!updatedFormData?.country) return replaceToStep0();
            const cities = await getUserAddPostFetchCitiesAPI(
              updatedFormData.country.id
            );
            dispatch(
              setAuthProps_ACTION({ key: "user.post.add.cities", data: cities })
            );
            break;
          }

          case "2": {
            if (!updatedFormData?.country || !updatedFormData?.city)
              return replaceToStep0();
            const subCities = await getUserAddPostFetchSubCitiesAPI(
              updatedFormData.country.id,
              updatedFormData.city.id
            );
            dispatch(
              setAuthProps_ACTION({
                key: "user.post.add.subCities",
                data: subCities,
              })
            );
            break;
          }

          case "3": {
            if (
              !updatedFormData?.country ||
              !updatedFormData?.city ||
              !updatedFormData?.subCity
            )
              return replaceToStep0();
            const categories = await getUserAddPostFetchCategoriesAPI();
            dispatch(
              setAuthProps_ACTION({
                key: "user.post.add.categories",
                data: categories,
              })
            );
            break;
          }

          case "4": {
            if (
              !updatedFormData?.country ||
              !updatedFormData?.city ||
              !updatedFormData?.subCity ||
              !updatedFormData?.category
            )
              return replaceToStep0();
            const subCategories = await getUserAddPostFetchSubCategoriesAPI(
              updatedFormData.category.id
            );
            dispatch(
              setAuthProps_ACTION({
                key: "user.post.add.subCategories",
                data: subCategories,
              })
            );
            break;
          }

          case "5": {
            if (
              !updatedFormData?.country ||
              !updatedFormData?.city ||
              !updatedFormData?.subCity ||
              !updatedFormData?.category ||
              !updatedFormData?.subCategory
            )
              return replaceToStep0();
            const others = await getUserAddPostFetchOtherDataAPI();
            dispatch(
              setAuthProps_ACTION({ key: "user.post.add.others", data: others })
            );
            break;
          }

          case "6":
          case "7":
            if (
              !updatedFormData?.country ||
              !updatedFormData?.city ||
              !updatedFormData?.subCity ||
              !updatedFormData?.category ||
              !updatedFormData?.subCategory ||
              !updatedFormData?.title
            )
              return replaceToStep0();
            break;

          default:
            sessionStorage.removeItem("postForm");
            return replaceToStep0();
        }
      } catch (error) {
        console.error(`Error in step ${mainStep} API:`, error);
      }
    };

    fetchData();

    // Cleanup
    return () => {
      clearInterval(timer);
      setStep(0);
      setPostImages([]);
      setFormData(initialFormData);
    };
  }, [actionType]);

  return (
    <>
      <FixedAuthHeader />
      <div className="userCreatePost">
        <Container className="cntry-cnt">
          {step > 0 && (
            <Row>
              <Col className="mb-3">
                <Breadcrumb className="breadcrumb-area">
                  {formData.country?.name && (
                    <Breadcrumb.Item
                      // active={step === 1}
                      onClick={() => handleBreadcrumbClick(1)}
                    >
                      {unslugify(formData.country.name)}
                    </Breadcrumb.Item>
                  )}
                  {formData.city?.name && step >= 2 && (
                    <Breadcrumb.Item
                      // active={step === 2}
                      onClick={() => handleBreadcrumbClick(2)}
                    >
                      {unslugify(formData.city.name)}
                    </Breadcrumb.Item>
                  )}
                  {formData.subCity?.name && step >= 3 && (
                    <Breadcrumb.Item
                      // active={step === 3}
                      onClick={() => handleBreadcrumbClick(3)}
                    >
                      {unslugify(formData.subCity.name)}
                    </Breadcrumb.Item>
                  )}
                  {formData.category?.name && step >= 4 && (
                    <Breadcrumb.Item
                      // active={step === 4}
                      onClick={() => handleBreadcrumbClick(4)}
                    >
                      {unslugify(formData.category.name)}
                    </Breadcrumb.Item>
                  )}
                  {formData.subCategory?.name && step >= 5 && (
                    <Breadcrumb.Item
                      // active={step === 5}
                      onClick={() => handleBreadcrumbClick(5)}
                    >
                      {unslugify(formData.subCategory.name)}
                    </Breadcrumb.Item>
                  )}
                </Breadcrumb>
              </Col>
            </Row>
          )}
          <PostStepsDisplay
            isCooldown={isCooldown}
            steps={steps}
            step={step}
            timeLeft={timeLeft}
            formatTimeLeft={formatTimeLeft}
          />
        </Container>
      </div>
      <Footer className="bottom-fixed" />
    </>
  );
};

const PostStepsDisplay = memo(
  ({ isCooldown, steps, step, formatTimeLeft, timeLeft }) => {
    const tooltip = (
      <Tooltip id="badge-tooltip">
        Time until you can create a new post.
      </Tooltip>
    );

    // Dynamic message based on timeLeft
    const getCooldownMessage = (seconds) => {
      if (seconds > 60) {
        return `Please wait ${formatTimeLeft(seconds)} to create a new post.`;
      } else if (seconds > 30) {
        return `Almost ready! Wait ${formatTimeLeft(
          seconds
        )} for another post.`;
      } else if (seconds > 0) {
        return `Just ${formatTimeLeft(seconds)} left to start a new post!`;
      } else {
        return `Ready! You can now create a new post.`;
      }
    };

    return (
      <div className="postStepsWrapper">
        {isCooldown ? (
          <div className="d-flex justify-content-center align-items-center">
            <OverlayTrigger placement="top" overlay={tooltip}>
              <Badge
                bg="warning"
                className="d-inline-flex align-items-center gap-2 py-2 px-3 fs-5"
                aria-live="polite"
                role="status"
              >
                <FontAwesomeIcon
                  icon={faHourglassHalf}
                  className="rotating-icon"
                  aria-hidden="true"
                />
                {getCooldownMessage(timeLeft)}
              </Badge>
            </OverlayTrigger>
          </div>
        ) : (
          <div className="step-content">{steps[step] || "Unknown Step"}</div>
        )}
      </div>
    );
  }
);

UserCreatePost.propTypes = {};

export default memo(UserCreatePost);
