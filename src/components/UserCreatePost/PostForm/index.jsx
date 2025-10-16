import { Editor } from "@tinymce/tinymce-react";
import { ErrorMessage, Formik } from "formik";
import ReactHtmlParser from "html-react-parser";
import Link from "next/link";
import PropTypes from "prop-types";
import { memo, useCallback, useMemo, useState } from "react";
import { Button, Col, Form, Row, Spinner } from "react-bootstrap";

import { ROUTES } from "@/utils/constant";
import {
  removeATags,
  removeScriptTags,
  sanitizeFields,
  sanitizeHTML,
} from "@/utils/helpers";
import { addPostFormSchema } from "@/utils/yupValidationSchema";

// Redux
import { useSelector } from "react-redux";
import { createSelector } from "reselect";

// Single memoized selector for Redux state
const storeSelectorData = createSelector(
  (state) => state.auth,
  (auth) => ({
    others_DATA: auth?.user?.post?.add?.others || {},
  })
);

const PostForm = ({ formData, onChange, nextStep }) => {
  //:=========================
  // Redux Stores (Memoized)
  //:=========================
  // Extracting multiple state properties with a single selector
  const { others_DATA } = useSelector(storeSelectorData);
  const APP_TINYMCE_API_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "";

  const {
    balance = "",
    total_balance = "",
    featureAds = [],
    extendedAds = [],
    notice = "",
  } = others_DATA;

  //:================================================================
  // Data Updation or Manipulation Declaration (Computation Logic)
  //:================================================================
  // Set Form Initial Value
  const initialForm = useMemo(
    () => ({
      title: formData?.title || "",
      location: formData?.subCity?.name || "",
      description: formData?.description || "",
      email: formData?.email || "",
      phone: formData?.phone || "",
      sex: formData?.sex || "",
      age: formData?.age || "",
      sexualOrientation: formData?.sexualOrientation || "",
      featured_ad: formData?.featured_ad || "",
      extended_ad: formData?.extended_ad || "",
    }),
    [formData]
  );

  const [isEditorLoaded, setEditorLoaded] = useState(false);

  //:========================================
  // Function Declaration
  //:========================================
  const handleAddPostSubmit = useCallback((values) => {
    const sanitizedValues = sanitizeFields(values);

    // Loop through the sanitizedValues object
    Object.entries(sanitizedValues).forEach(([key, value]) => {
      onChange({ name: key, value: value });
    });

    nextStep();
  }, []);

  const handleEditorInit = (editor) => {
    console.log("Editor is initialized!", editor, isEditorLoaded);
    // You can perform actions like setting content or binding events here
    setEditorLoaded(true);
  };

  return (
    <Formik
      initialValues={initialForm}
      enableReinitialize
      validationSchema={addPostFormSchema}
      onSubmit={handleAddPostSubmit} // Formik submission handler
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
      }) => (
        <>
          <Form className="new-post-form" onSubmit={handleSubmit}>
            {others_DATA && typeof balance === "number" && balance <= 0 && (
              <Row>
                <Col>
                  <strong>Your Current Balance: {total_balance}</strong>
                  <Link
                    className="btn btn-primary ms-2"
                    href={ROUTES.userRechargeBalance}
                  >
                    Recharge Now
                  </Link>
                </Col>
              </Row>
            )}

            <Row className="mt-2">
              <Col lg={8}>
                <Form.Group className="form-group">
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Enter Title..."
                    className="req"
                    name="title"
                    value={values.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <ErrorMessage
                    name="title"
                    component="div"
                    className="text-danger"
                  />
                </Form.Group>
              </Col>
              <Col lg={4}>
                <Form.Group className="form-group">
                  <Form.Control
                    size="sm"
                    type="text"
                    name="location"
                    value={values.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    readOnly
                  />
                  <ErrorMessage
                    name="location"
                    component="div"
                    className="text-danger"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mt-3">
              <Col lg={12}>
                <Form.Group className="form-group">
                  <h3>Posting Body</h3>
                  {!isEditorLoaded && (
                    <>
                      <textarea
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        style={{ width: "100%", height: "300px" }}
                        className="req form-control form-control-sm"
                      />
                    </>
                  )}
                  {APP_TINYMCE_API_KEY && (
                    <>
                      <div
                        className="req"
                        // style={{ border: '1px solid', borderRadius: '10px' }}
                      >
                        <Editor
                          textareaName="description"
                          apiKey={APP_TINYMCE_API_KEY} // Your TinyMCE API Key
                          init={{
                            invalid_elements: "script,iframe,a",
                            plugins: [],
                            anchor_top: false,
                            menubar: false,
                            toolbar: false, // Disable the default toolbar
                            statusbar: false,
                            toolbar_sticky: false,
                            autosave_ask_before_unload: true,
                            autosave_interval: "30s",
                            autosave_prefix: "{path}{query}-{id}-",
                            autosave_restore_when_empty: false,
                            autosave_retention: "2m",
                            height: 300,
                            branding: false,
                          }}
                          onInit={handleEditorInit}
                          value={values.description}
                          // Update Formik's value on change

                          onEditorChange={(content) =>
                            setFieldValue(
                              "description",
                              removeScriptTags(removeATags(content))
                            )
                          }
                          // Mark the field as touched on blur
                          onBlur={() => setFieldTouched("description", true)}
                        />
                      </div>
                    </>
                  )}

                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-danger"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-4">
              <Col lg={6}>
                <Form.Group className="form-group">
                  <Form.Control
                    size="sm"
                    type="email"
                    placeholder="Enter Email..."
                    className="req"
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
              </Col>
              <Col lg={6}>
                <Form.Group className="form-group">
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Enter Phone..."
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <ErrorMessage
                    name="phone"
                    component="div"
                    className="text-danger"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="sexual-orientation">
              <Form.Group as={Col} lg={2} className="form-group">
                <Form.Label>Sex:</Form.Label>
                <Form.Control
                  size="sm"
                  as="select"
                  className="req"
                  name="sex"
                  value={values.sex}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="">-Select-</option>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Others</option>
                </Form.Control>
                <ErrorMessage
                  name="sex"
                  component="div"
                  className="text-danger"
                />
              </Form.Group>
              <Form.Group as={Col} lg={2} className="form-group">
                <Form.Label>Age:</Form.Label>
                <Form.Control
                  size="sm"
                  as="select"
                  className="req"
                  name="age"
                  value={values.age}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="">-Select-</option>
                  {[...Array(83)].map((_, i) => (
                    <option key={i} value={i + 18}>
                      {i + 18}
                    </option>
                  ))}
                </Form.Control>
                <ErrorMessage
                  name="age"
                  component="div"
                  className="text-danger"
                />
              </Form.Group>
              <Form.Group as={Col} lg={2} className="form-group">
                <Form.Label>Sexual Orientation:</Form.Label>
                <Form.Control
                  size="sm"
                  as="select"
                  name="sexualOrientation"
                  value={values.sexualOrientation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="">-Select-</option>
                  <option value="bisexual">Bisexual</option>
                  <option value="homosexual/guy">Homosexual/guy</option>
                  <option value="Hetersexual/straight">
                    hetersexual/straight
                  </option>
                  <option value="asexual">Asexual</option>
                </Form.Control>
                <ErrorMessage
                  name="sexualOrientation"
                  component="div"
                  className="text-danger"
                />
              </Form.Group>
            </Row>
            <Row className="mt-3 promote-ads">
              <Col lg={12}>
                <h3>
                  <strong>Promote your ad</strong>
                </h3>
              </Col>
              <Col lg={6}>
                <div className="border-top pt-1">
                  <strong>Featured Ad</strong>
                  <p>
                    Featured ads are placed top-most in each category and are
                    shown highlighted. Select the appropraite option from below
                    if you want to make this a featured ad.
                  </p>
                  <Form.Control
                    size="sm"
                    as="select"
                    className="mt-1"
                    name="featured_ad"
                    value={values.featured_ad}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <option>-Select Package-</option>
                    {featureAds.map((ads) => (
                      <option key={ads.value} value={ads.value}>
                        {ads.label}
                      </option>
                    ))}
                  </Form.Control>
                  <ErrorMessage
                    name="featured_ad"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="border-top pt-1">
                  <strong>Extended Ad</strong>
                  <p>
                    Want to have your ad running longer? Consider buying one of
                    the following promotions.
                  </p>
                  <Form.Control
                    size="sm"
                    as="select"
                    className="mt-1"
                    name="extended_ad"
                    value={values.extended_ad}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <option>-Select Package-</option>
                    {extendedAds.map((ads) => (
                      <option key={ads.value} value={ads.value}>
                        {ads.label}
                      </option>
                    ))}
                  </Form.Control>
                  <ErrorMessage
                    name="extended_ad"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </Col>
            </Row>
            <Row>
              <Col lg={12}>
                <div className="notice">
                  {ReactHtmlParser(sanitizeHTML(notice))}
                </div>
              </Col>

              <Col lg={12} className="mt-4 mb-3">
                <Button type="submit" variant="primary" disabled={isSubmitting}>
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
                    "Continue"
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
              </Col>
            </Row>
          </Form>
        </>
      )}
    </Formik>
  );
};

PostForm.propTypes = {
  formData: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  nextStep: PropTypes.func,
};
export default memo(PostForm);
