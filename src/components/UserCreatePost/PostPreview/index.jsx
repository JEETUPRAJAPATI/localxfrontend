import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button, Form, Spinner, Table } from "react-bootstrap";
import ReCAPTCHA from "react-google-recaptcha";
import PropTypes from "prop-types"; // Import PropTypes for validation
import { Formik } from "formik";
import { addPostFinalFormSchema } from "@/utils/yupValidationSchema.js";
import { sanitizeFields } from "@/utils/helpers.js";
import { addUserPostSaveAPI } from "@/api/apiAuthService.js";
import { ROUTES } from "@/utils/constant.js";
import PostView from "@/components/PostView";
const AlertMessage = dynamic(() => import("@/components/AlertMessage"), {
  ssr: false,
});

const PostPreview = ({ formData, postImages }) => {
  const router = useRouter();
  const recaptchaRef = useRef(null);
  const APP_RECAPTCHA_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_KEY || "";

  //:========================================
  // Component Props
  //:========================================
  const { title, description, age, sex, email, phone, sexualOrientation } =
    formData;

  //:========================================
  // States Declaration
  //:========================================
  const [alertMessage, setAlertMessage] = useState({
    show: false,
  });
  const [recaptchakey, setRecaptchaKey] = useState(1); // Used to force re-render the reCAPTCHA
  const [addPostFinalFormInitialValues] = useState({
    googleCaptcha: "",
  });

  //:========================================
  // Function Declaration
  //:========================================
  const onCaptchaChange = useCallback((value, setFieldValue) => {
    setFieldValue("googleCaptcha", value);
  }, []);

  const handleSavePost = useCallback(async (values, { setSubmitting }) => {
    const finalFormData = {
      title: formData?.title || "",
      country_id: formData?.country?.id || "",
      city_id: formData?.city?.id || "",
      subcity_id: formData?.subCity?.id || "",
      category_id: formData?.category?.id || "",
      subcategory_id: formData?.subCategory?.id || "",
      // default_ad_displayed_for:formData?.subCategory?.id || '',
      extended_ad: formData?.extended_ad || "",
      featured_ad: formData?.featured_ad || "",
      location: formData?.location || "",
      post_code: "",
      description: formData?.description || "",
      email: formData?.email || "",
      phone: formData?.phone || "",
      sex: formData?.sex || "",
      age: formData?.age || "",
      sexual_orientation: formData?.sexualOrientation || "",
      googleCaptcha: values?.googleCaptcha || "",
    };

    const sanitizedValues = sanitizeFields(finalFormData);

    // resetForm();

    let setformData = new FormData();
    Object.entries(sanitizedValues).forEach(([key, value]) => {
      setformData.append(key, value);
    });

    if (postImages && postImages.length > 0) {
      // Fetch and append blob images to FormData
      for (let index = 0; index < postImages.length; index++) {
        setformData.append("images", postImages[index], `image-${index}.jpg`);
      }
    }

    console.log(setformData);

    addUserPostSaveAPI(setformData)
      .then(async ({ message, code }) => {
        if (code === "POST_SAVED") {
          localStorage.removeItem("countdownEnd"); // Clear countdown
          sessionStorage.removeItem("postForm"); // Clear postForm
          router.push({
            pathname: ROUTES.userSavedPostMsg,
            query: { MESSAGE: message, CODE: code },
          });
        }

        setAlertMessage({
          show: true,
          type: "info",
          message,
          showDismissible: false,
          showHeading: false,
        });
      })
      .catch((error) => {
        console.error("Error in addUserPostSaveAPI:", error);
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
        window.scrollTo(0, 0);
      })
      .finally(() => {
        setTimeout(() => {
          setAlertMessage({
            show: false,
          });
        }, 15000);
        setSubmitting(false);
        window.scrollTo(0, 0);
      });
  }, []);

  // Use useMemo to create object URLs
  const newPostImages = useMemo(
    () =>
      postImages.map((image) => ({
        src: URL.createObjectURL(image),
      })),
    [postImages]
  );

  return (
    <div className="postPreviewWrapper">
      <AlertMessage {...alertMessage} />
      <PostView
        title={title}
        description={description}
        email={email}
        phone={phone}
        images={newPostImages}
        formattedDate={new Date()?.toISOString() || "N/A"}
        relativeTime={new Date()?.toLocaleDateString() || "N/A"}
        tableData={
          <Table bordered hover>
            <tbody>
              <tr>
                <th>Sex</th>
                <td>{sex || "-"}</td>
              </tr>
              <tr>
                <th>Age</th>
                <td>{age || "-"}</td>
              </tr>
              <tr>
                <th>Sexual Orientation</th>
                <td>{sexualOrientation || "-"}</td>
              </tr>
            </tbody>
          </Table>
        }
      />

      <Formik
        initialValues={addPostFinalFormInitialValues}
        validationSchema={addPostFinalFormSchema}
        onSubmit={handleSavePost} // Formik submission handler
      >
        {({
          handleSubmit,
          // handleChange,
          // handleBlur,
          // values,
          errors,
          touched,
          isSubmitting,
          setFieldValue,
          // setFieldTouched,
        }) => (
          <>
            <Form onSubmit={handleSubmit}>
              {/* Google reCAPTCHA component */}
              <div className="google-recaptcha-section">
                <div className="mt-3 d-flex justify-content-center">
                  <ReCAPTCHA
                    key={recaptchakey}
                    ref={recaptchaRef}
                    sitekey={APP_RECAPTCHA_KEY} // Replace with your reCAPTCHA site key
                    onChange={(value) => onCaptchaChange(value, setFieldValue)}
                    onExpired={() => {
                      console.warn("Captcha expired.");
                      if (recaptchaRef.current) {
                        recaptchaRef.current.reset();
                      }
                      setFieldValue("googleCaptcha", "");
                      setRecaptchaKey((prevKey) => prevKey + 1); // Re-render on expiry
                    }}
                    onErrored={() => {
                      console.error("Captcha error.");
                      if (recaptchaRef.current) {
                        recaptchaRef.current.reset();
                      }
                      setFieldValue("googleCaptcha", "");
                      setRecaptchaKey((prevKey) => prevKey + 1); // Re-render on error
                    }}
                  />
                </div>
                {/* Display error message for googleCaptcha */}
                {errors.googleCaptcha && touched.googleCaptcha && (
                  <div className="text-danger text-center">
                    {errors.googleCaptcha}
                  </div>
                )}
              </div>

              <div className="mt-3 mb-3 d-flex justify-content-center">
                {/* Submit Button */}
                <Button type="submit" variant="success" disabled={isSubmitting}>
                  {/* Conditionally render spinner */}
                  {isSubmitting ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Submitting...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </Button>
                <Button
                  variant="danger"
                  className="ms-1"
                  as={Link}
                  href={ROUTES.userDashboard}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </>
        )}
      </Formik>
    </div>
  );
};

// PropTypes validation
PostPreview.propTypes = {
  formData: PropTypes.object,
  postImages: PropTypes.array,
};

export default memo(PostPreview);
