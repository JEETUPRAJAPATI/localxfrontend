import { useFormik } from "formik";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";

import { userSaveManualRechargeBalanceAPI } from "@/api/apiAuthService.js";
import FixedAuthHeader from "@/components/FixedAuthHeader";
import { ROUTES } from "@/utils/constant.js";
import { resizeImage, sanitizeFields } from "@/utils/helpers";
import { saveManualRechargePaymentMethodFormYupSchema } from "@/utils/yupValidationSchema";

// Dynamic Imports
const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });
const AlertMessage = dynamic(() => import("@/components/AlertMessage"), {
  ssr: false,
});

// Payment Amount Options
const PAYMENT_AMOUNTS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const UserManualRechargeBalance = ({
  initialManualMethodData: manualMethod_DATA,
}) => {
  const router = useRouter();
  const { manualPaymentMethodId } = router.query;

  // State for alert messages
  const [alertMessage, setAlertMessage] = useState({ show: false });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      manual_method_id: manualMethod_DATA?.id || "",
      payment_amount: "",
      transaction_id: "",
      screenshot_file: null,
      description: "",
    },
    validationSchema: saveManualRechargePaymentMethodFormYupSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const { screenshot_file, ...otherValues } = values;
        const sanitizedValues = sanitizeFields(otherValues);

        const formData = new FormData();
        Object.entries(sanitizedValues).forEach(([key, value]) => {
          formData.append(key, value);
        });

        if (screenshot_file) {
          formData.append(
            "ssAttachmentImg",
            screenshot_file,
            "paymentSSAttachmentImg.jpg"
          );
        }

        const { message, data, code } = await userSaveManualRechargeBalanceAPI(
          formData
        );
        setAlertMessage({
          show: true,
          type: "success",
          message,
          showDismissible: false,
          showHeading: false,
          data,
          code,
        });

        resetForm();
        router.push({
          pathname: ROUTES.userRechargeBalanceHistories,
          query: { MESSAGE: message, CODE: code, DATA: data },
        });
      } catch (error) {
        console.error("Error in userSaveManualRechargeBalanceAPI:", error);
        const {
          message = "An error occurred",
          data,
          code,
        } = error?.response?.data || {};
        const errors = code === "VALIDATION_ERRORS" ? data || [] : [];

        setAlertMessage({
          show: true,
          type: "error",
          message,
          errors,
          showDismissible: false,
          showHeading: false,
        });
        window.scrollTo(0, 0);
      } finally {
        setTimeout(() => setAlertMessage({ show: false }), 5000); // Reduced timeout
        setSubmitting(false);
      }
    },
    enableReinitialize: true, // Reinitialize form when manualMethod_DATA changes
  });

  // Handle image change with debounce
  const handleImageChange = useCallback(
    async (event) => {
      const file = event?.currentTarget?.files[0];
      if (file) {
        try {
          const resizedImageBlob = await resizeImage(file, 500);
          formik.setFieldValue("screenshot_file", resizedImageBlob);
        } catch (error) {
          console.error("Image resize error:", error);
          formik.setFieldError("screenshot_file", "Failed to process image");
        }
      }
    },
    [formik]
  );

  // Handle invalid manualPaymentMethodId
  useEffect(() => {
    if (!manualPaymentMethodId) {
      setAlertMessage({
        show: true,
        type: "error",
        message: "Invalid payment method ID",
      });
      router.replace(ROUTES.userRechargeBalance);
      return;
    }
  }, [manualPaymentMethodId, router]);

  // Memoized payment amount options
  const paymentAmountOptions = useMemo(
    () =>
      PAYMENT_AMOUNTS.map((value) => (
        <option key={value} value={value}>
          {value}$
        </option>
      )),
    []
  );

  return (
    <>
      <FixedAuthHeader />
      <div className="wrapper userManualRechargeBalance">
        <AlertMessage {...alertMessage} />
        <Container className="h-100 cnt">
          <div className="panel-heading">
            <h3>Manually Recharge Balance</h3>
          </div>
          <div className="panel-body">
            <Row>
              <Col className="px-4">
                <Form onSubmit={formik.handleSubmit} noValidate>
                  <Form.Group as={Col} sm="12" className="form-group">
                    <Form.Label>Payment Method Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={manualMethod_DATA?.method_name || "N/A"}
                      readOnly
                      disabled
                      aria-readonly="true"
                    />
                  </Form.Group>

                  <Form.Group as={Col} sm="12" className="form-group">
                    <Form.Label>Payment Method Details</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      value={manualMethod_DATA?.method_details || "N/A"}
                      readOnly
                      disabled
                      aria-readonly="true"
                    />
                  </Form.Group>

                  <Form.Group as={Col} sm="12" className="form-group">
                    <Form.Label>
                      Payment Amount <span className="error">*</span>
                    </Form.Label>
                    <Form.Control
                      as="select"
                      name="payment_amount"
                      value={formik.values.payment_amount}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      isInvalid={
                        formik.touched.payment_amount &&
                        formik.errors.payment_amount
                      }
                      aria-required="true"
                    >
                      <option value="">-Select-</option>
                      {paymentAmountOptions}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.payment_amount}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} sm="12" className="form-group">
                    <Form.Label>
                      Payment Transaction ID <span className="error">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="transaction_id"
                      maxLength="255"
                      value={formik.values.transaction_id}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      isInvalid={
                        formik.touched.transaction_id &&
                        formik.errors.transaction_id
                      }
                      aria-required="true"
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.transaction_id}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} sm="12" className="form-group">
                    <Form.Label>Payment Transaction Screenshot</Form.Label>
                    <Form.Control
                      type="file"
                      id="upload_image"
                      name="screenshot_file"
                      accept="image/*, .pdf"
                      onChange={handleImageChange}
                      isInvalid={
                        formik.touched.screenshot_file &&
                        formik.errors.screenshot_file
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.screenshot_file}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} sm="12" className="form-group">
                    <Form.Label>Description (if any)</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="description"
                      rows={3}
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      isInvalid={
                        formik.touched.description && formik.errors.description
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.description}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group
                    as={Col}
                    sm="12"
                    className="text-center form-group"
                  >
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => formik.resetForm()}
                      disabled={formik.isSubmitting}
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="ms-1"
                      disabled={formik.isSubmitting}
                      aria-disabled={formik.isSubmitting}
                    >
                      {formik.isSubmitting ? (
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
                        "Save"
                      )}
                    </Button>
                  </Form.Group>
                </Form>
              </Col>
            </Row>
          </div>
          <div className="panel-footer" />
        </Container>
      </div>
      <Footer className="bottom-fixed" />
    </>
  );
};

export default memo(UserManualRechargeBalance);
