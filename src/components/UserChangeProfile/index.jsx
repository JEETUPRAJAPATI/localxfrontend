import {
  updateNewPasswordAPI,
  updateUserProfileAPI,
  verifyEmailUpdateVerificationCodeAPI,
} from "@/api/apiAuthService.js";
import FixedAuthHeader from "@/components/FixedAuthHeader";
import { base64ToBlob, sanitizeFields } from "@/utils/helpers.js";
import {
  changePasswordFormSchema,
  changeProfileFormSchema,
  updateEmailVerificationFormSchema,
} from "@/utils/yupValidationSchema.js";
import { ErrorMessage, Formik } from "formik";
import dynamic from "next/dynamic";
import { memo, useCallback, useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";

// Redux
import { setAuthProps as setAuthProps_ACTION } from "@/store/authSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

// Single memoized selector for Redux state
const storeSelectorData = createSelector(
  (state) => state.auth,
  (auth) => ({
    profile_DATA: auth?.user?.profile || {},
  })
);

// Dynamic Components
const AlertMessage = dynamic(() => import("@/components/AlertMessage"), {
  ssr: false,
});
const LazyImage = dynamic(() => import("@/components/LazyImage"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/components/Footer"), {
  ssr: false,
});

const ImageCropper = dynamic(() => import("@/components/ImageCroppie"), {
  ssr: false,
});

const UserChangeProfile = () => {
  const dispatch = useDispatch();
  //:=========================
  // Redux Stores (Memoized)
  //:=========================
  const { profile_DATA } = useSelector(storeSelectorData);

  //:========================================
  // States Declaration
  //:========================================
  const [alertMessage, setAlertMessage] = useState({
    show: false,
  });
  const [
    emailVerificationCodeAlertMessage,
    setEmailVerificationCodeAlertMessage,
  ] = useState({
    show: false,
  });
  const [changePasswordAlertMessage, setChangePasswordAlertMessage] = useState({
    show: false,
  });
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState("");
  const [changeProfileFormInitialValues, setchangeProfileFormInitialValues] =
    useState({
      email: "",
      profilePic: "",
      oldProfilePicPath: profile_DATA?.path || "",
    });
  const [showVerificationEmailModal, setVerificationEmailModal] =
    useState(false);
  const [
    emailVerificationFormInitialValues,
    setemailVerificationFormInitialValues,
  ] = useState({
    new_email: "",
    verification_code: "",
  });
  const [changePasswordFormInitialValues] = useState({
    old_password: "",
    new_password: "",
  });
  //:========================================
  // Function Declaration
  //:========================================
  const handleChangePasswordModalOpen = useCallback(
    () => setShowChangePasswordModal(true),
    []
  );
  const handleChangePasswordModalClose = useCallback(
    () => setShowChangePasswordModal(false),
    []
  );
  const handleVerificationEmailModalOpen = useCallback(
    () => setVerificationEmailModal(true),
    []
  );
  const handleVerificationEmailModalClose = useCallback(
    () => setVerificationEmailModal(false),
    []
  );
  const handleImageChange = useCallback(
    async (event, setFieldValue, setFieldTouched, validateForm) => {
      const file = event.target.files[0];
      if (file) {
        setSelectedFileName(file.name); // Update file name
        await setFieldValue("profilePic", file);
        await setFieldTouched("profilePic", true, true);
      }
      // Validate the form or specific field after setting the value
      const errors = await validateForm(); // Validate the entire form
      // Check if there are any errors
      if (Object.keys(errors).length > 0) {
        console.error("Validation errors:", errors);
      } else {
        // Proceed with any further actions if there are no validation errors
        setSelectedImage(URL.createObjectURL(file)); // Set image URL
        setShowCropper(true); // Show the cropper
        setFieldValue("profilePic", "");
      }
    },
    []
  );

  const handleCrop = useCallback((croppedImg, setFieldValue) => {
    setFieldValue("profilePic", croppedImg);
    setCroppedImage(croppedImg); // Update with the cropped image
    setShowCropper(false); // Hide the cropper
    setSelectedImage(null); // Reset selected image URL to allow re-selection of the same file
  }, []);

  const handleSubmitUpdatePassword = useCallback(
    (values, { setSubmitting, resetForm }) => {
      const sanitizedValues = sanitizeFields(values);
      updateNewPasswordAPI(sanitizedValues)
        .then(({ message }) => {
          // Success
          setChangePasswordAlertMessage({
            show: true,
            type: "success",
            message: message,
            showDismissible: false,
            showHeading: false,
          });
          // Reset isSubmitting to false after the form is processed
          resetForm();
          setTimeout(() => {
            // Close the modal
            handleChangePasswordModalClose();
          }, 5000);
        })
        .catch((error) => {
          console.error("Error in updateNewPasswordAPI:", error);
          const { message, data, code } = error?.response?.data || {};
          const error_code = code || "";
          let error_data = data || "";
          let error_message = message || "";
          let errors = [];
          if (message) {
            if (error_code == "VALIDATION_ERRORS") {
              errors = error_data || [];
            }
            setChangePasswordAlertMessage({
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
          setTimeout(() => {
            setChangePasswordAlertMessage({
              show: false,
            });
          }, 15000);
          window.scrollTo(0, 0);
          setSubmitting(false);
        });
    },
    []
  );

  const handleUpdateProfile = useCallback(
    (values, { setSubmitting, resetForm }) => {
      const { profilePic, oldProfilePicPath, ...otherValues } = values;
      if (!profilePic) {
        setSelectedFileName("");
      }
      let formData = new FormData();
      Object.entries(otherValues).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (oldProfilePicPath) {
        formData.append("oldProfilePicPath", oldProfilePicPath);
      }
      if (profilePic) {
        const imageData = profilePic.split(",")[1];
        const mimeType = profilePic.split(";")[0].split(":")[1];
        const blob = base64ToBlob(imageData, mimeType);
        formData.append("profilePic", blob, "profile-image.jpg");
      }
      updateUserProfileAPI(formData)
        .then(async ({ message, data }) => {
          const { path, fullPath, emailVerificationModal } = data || {};
          if (profilePic) {
            // Update Images in Profile
            dispatch(
              setAuthProps_ACTION({
                key: "user.profile",
                data: { path, fullPath },
                type: "update_profile_pic",
              })
            );
          }

          // Show Email Verification Modal
          if (emailVerificationModal) {
            handleVerificationEmailModalOpen();
            setemailVerificationFormInitialValues({
              new_email: values?.email || "",
              verification_code: "",
            });

            // Success
            setEmailVerificationCodeAlertMessage({
              show: true,
              type: "success",
              message: message,
              showDismissible: false,
              showHeading: false,
            });
          } else {
            // Success
            setAlertMessage({
              show: true,
              type: "success",
              message: message || "Profile updated successfully!",
              showDismissible: false,
              showHeading: false,
            });
          }
          // Reset isSubmitting to false after the form is processed
          resetForm();
          setSelectedImage(null);
          setSelectedFileName("");
        })
        .catch((error) => {
          console.error("Error in updateUserProfileAPI:", error);
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
    },
    []
  );

  const handleSubmitVerificationCode = useCallback(
    (values, { setSubmitting, resetForm }) => {
      const sanitizedValues = sanitizeFields(values);

      verifyEmailUpdateVerificationCodeAPI(sanitizedValues)
        .then(({ message }) => {
          // Reset isSubmitting to false after the form is processed
          resetForm();

          // Success
          setAlertMessage({
            show: true,
            type: "success",
            message: message || "New email updated successfully!",
            showDismissible: false,
            showHeading: false,
          });

          // Close the modal
          handleVerificationEmailModalClose();

          // Update the email in the profile
          dispatch(
            setAuthProps_ACTION({
              key: "user.profile",
              data: { email: sanitizedValues.new_email },
              type: "update_profile_email",
            })
          );
        })
        .catch((error) => {
          console.error(
            "Error in verifyEmailUpdateVerificationCodeAPI:",
            error
          );
          const { message, data, code } = error?.response?.data || {};

          const error_code = code || "";
          let error_data = data || "";
          let error_message = message || "";
          let errors = [];

          if (message) {
            if (error_code == "VALIDATION_ERRORS") {
              errors = error_data || [];
            }

            setEmailVerificationCodeAlertMessage({
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
            setEmailVerificationCodeAlertMessage({
              show: false,
            });
          }, 15000);
          window.scrollTo(0, 0);
          setSubmitting(false);
        });
    },
    []
  );

  const handleCloseCropperModal = useCallback(() => {
    setShowCropper(false);
  }, []);

  //:========================================
  // Effect Load Declaration
  //:========================================

  // Update croppedImage whenever profile_DATA.path changes
  useEffect(() => {
    if (profile_DATA?.fullPath) {
      setCroppedImage(profile_DATA.fullPath);
    }
    setchangeProfileFormInitialValues({
      email: profile_DATA?.email || "",
      profilePic: "",
      oldProfilePicPath: profile_DATA?.path || "",
    });
  }, [profile_DATA]);

  return (
    <>
      <FixedAuthHeader />

      <div className="userChangeProfile">
        <Container className="cnt">
          <AlertMessage {...alertMessage} className="m-0 mb-1" />
          {/* Panel Heading */}
          <div className="panel-heading d-flex align-items-center justify-content-between">
            <h3>Change Profile</h3>
            <Button variant="primary" onClick={handleChangePasswordModalOpen}>
              Change Password
            </Button>
          </div>
          {/* Panel Body */}
          <div className="panel-body">
            <Formik
              initialValues={changeProfileFormInitialValues}
              enableReinitialize
              validationSchema={changeProfileFormSchema}
              onSubmit={handleUpdateProfile} // Formik submission handler
            >
              {({
                handleSubmit,
                handleChange,
                handleBlur,
                values,
                // errors,
                // touched,
                isSubmitting,
                setFieldValue,
                setFieldTouched,
                validateForm,
              }) => (
                <>
                  <Form
                    method="post"
                    encType="multipart/form-data"
                    onSubmit={handleSubmit}
                  >
                    <Row className="justify-content-center">
                      {/* Center the form */}
                      <Col sm={8}>
                        {" "}
                        {/* Adjust column width if needed */}
                        <Form.Group className="form-group">
                          <Form.Label>Username</Form.Label>
                          <Form.Control
                            type="text"
                            value={profile_DATA?.username || ""}
                            readOnly
                          />
                        </Form.Group>
                        <Form.Group className="form-group">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="text"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          <ErrorMessage
                            name="email"
                            component="div"
                            className="text-danger"
                          />
                        </Form.Group>
                        <Form.Group className="form-group">
                          <Form.Label>Upload Image</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleImageChange(
                                e,
                                setFieldValue,
                                setFieldTouched,
                                validateForm
                              )
                            }
                            key={selectedFileName} // Force re-render on filename change
                          />
                          <Form.Control
                            type="hidden"
                            name="oldProfilePicPath"
                            value={values.oldProfilePicPath}
                          />

                          <ErrorMessage
                            name="profilePic"
                            component="div"
                            className="text-danger"
                          />
                          {selectedFileName && (
                            <div className="file-name-display mt-2">
                              {selectedFileName}
                            </div>
                          )}
                        </Form.Group>
                        <Button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isSubmitting}
                        >
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
                            "Update"
                          )}
                        </Button>
                        <div className="cropped-image-output mt-3">
                          {croppedImage && (
                            <LazyImage
                              src={croppedImage}
                              alt="Cropped"
                              id="img_output"
                              style={{ maxWidth: "100%", height: "auto" }}
                            />
                          )}
                        </div>
                      </Col>
                    </Row>

                    {/* Image Cropper Modal */}
                    <ImageCropper
                      showModal={showCropper}
                      handleClose={handleCloseCropperModal}
                      onCrop={(croppedImage) =>
                        handleCrop(croppedImage, setFieldValue)
                      }
                      imageToCrop={selectedImage} // Pass the selected image to ImageCropper
                    />
                  </Form>
                </>
              )}
            </Formik>

            {/* Change Password Modal */}
            <Modal
              show={showChangePasswordModal}
              size="md"
              onHide={handleChangePasswordModalClose}
              backdrop="static"
              keyboard={false}
              className="change-password-modal"
            >
              <Modal.Header closeButton>
                <Modal.Title>Change Password</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <AlertMessage {...changePasswordAlertMessage} />
                <Formik
                  initialValues={changePasswordFormInitialValues}
                  enableReinitialize
                  validationSchema={changePasswordFormSchema(
                    profile_DATA?.hasSetPassword || 0
                  )}
                  onSubmit={handleSubmitUpdatePassword} // Formik submission handler
                >
                  {({
                    handleSubmit,
                    handleChange,
                    handleBlur,
                    values,
                    // errors,
                    // touched,
                    isSubmitting,
                  }) => (
                    <>
                      <Form onSubmit={handleSubmit} method="post">
                        {profile_DATA?.hasSetPassword === 1 && (
                          <Form.Group className="form-group">
                            <Form.Label>Old Password</Form.Label>
                            <Form.Control
                              type="password"
                              placeholder="Enter old password"
                              name="old_password"
                              value={values.old_password}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                            <ErrorMessage
                              name="old_password"
                              component="div"
                              className="text-danger"
                            />
                          </Form.Group>
                        )}

                        <Form.Group className="form-group">
                          <Form.Label>New Password</Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="Enter new password"
                            name="new_password"
                            value={values.new_password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          <ErrorMessage
                            name="new_password"
                            component="div"
                            className="text-danger"
                          />
                        </Form.Group>
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={isSubmitting}
                        >
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
                            "Change"
                          )}
                        </Button>
                      </Form>
                    </>
                  )}
                </Formik>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="default"
                  onClick={handleChangePasswordModalClose}
                >
                  Close
                </Button>
              </Modal.Footer>
            </Modal>

            {/* Email Verification Code */}
            <Modal
              show={showVerificationEmailModal}
              size="sm"
              onHide={handleVerificationEmailModalClose}
              backdrop="static"
              keyboard={false}
              className="change-password-modal"
            >
              <Modal.Header closeButton>
                <Modal.Title>Email Update Verification Code</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <AlertMessage {...emailVerificationCodeAlertMessage} />
                <Formik
                  initialValues={emailVerificationFormInitialValues}
                  enableReinitialize
                  validationSchema={updateEmailVerificationFormSchema}
                  onSubmit={handleSubmitVerificationCode} // Formik submission handler
                >
                  {({
                    handleSubmit,
                    handleChange,
                    handleBlur,
                    values,
                    errors,
                    touched,
                    isSubmitting,
                  }) => (
                    <>
                      <Form
                        method="post"
                        encType="multipart/form-data"
                        onSubmit={handleSubmit}
                      >
                        <Form.Group className="form-group">
                          <Form.Label>New Email</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="New Email Address"
                            name="new_email"
                            value={values.new_email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            readOnly
                          />

                          {/* Display error message for new_email */}
                          {errors.new_email && touched.new_email && (
                            <div className="text-danger">
                              {errors.new_email}
                            </div>
                          )}
                        </Form.Group>
                        <Form.Group className="form-group">
                          <Form.Label>Verification Code</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Verificaion Code"
                            name="verification_code"
                            value={values.verification_code}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          {/* Display error message for verification_code */}
                          {errors.verification_code &&
                            touched.verification_code && (
                              <div className="text-danger">
                                {errors.verification_code}
                              </div>
                            )}
                        </Form.Group>

                        <Button
                          variant="primary"
                          type="submit"
                          disabled={isSubmitting}
                        >
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
                            "Submit"
                          )}
                        </Button>
                      </Form>
                    </>
                  )}
                </Formik>
              </Modal.Body>
            </Modal>
          </div>
          {/* Panel Footer */}
          <div className="panel-footer" />
        </Container>
      </div>
      <Footer className="mt-4" />
    </>
  );
};

// Prop validation
UserChangeProfile.propTypes = {};

export default memo(UserChangeProfile);
