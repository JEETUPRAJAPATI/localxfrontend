import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { memo, useEffect, useRef, useState } from "react"; // Import React
import { Button, Card, Col, Row } from "react-bootstrap";

import { ROUTES } from "@/utils/constant";
import { base64ToBlob, blobToBase64, resizeImage } from "@/utils/helpers";
import PropTypes from "prop-types"; // Import PropTypes for validation

const PostImages = ({ formData, nextStep, setPostImages }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const resizedImageBlob = await resizeImage(file, 500);
      const base64Image = await blobToBase64(resizedImageBlob);

      // Update state with functional updates
      setImages((prev) => [...prev, resizedImageBlob]);
      setPostImages((prev) => [...prev, resizedImageBlob]);

      // Update sessionStorage in a single operation
      sessionStorage.setItem(
        "postForm",
        JSON.stringify({
          ...JSON.parse(sessionStorage.getItem("postForm") || "{}"),
          images: [
            ...(JSON.parse(sessionStorage.getItem("postForm") || "{}").images ||
              []),
            base64Image,
          ],
        })
      );
    } catch {
      setError("Image resizing failed");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index) => {
    // Update state
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPostImages((prev) => prev.filter((_, i) => i !== index));

    // Update sessionStorage
    const postForm = JSON.parse(sessionStorage.getItem("postForm") || "{}");
    sessionStorage.setItem(
      "postForm",
      JSON.stringify({
        ...postForm,
        images: (postForm.images || []).filter((_, i) => i !== index),
      })
    );
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    setPostImages([]);
  }, []);

  useEffect(() => {
    const imagesBase64 = formData?.images || [];
    if (imagesBase64.length > 0) {
      const imagesBlobs = imagesBase64.map((base64) => {
        const [, imageData] = base64.split(",");
        const mimeType = base64.match(/data:([^;]+)/)?.[1] || "image/jpeg";
        return base64ToBlob(imageData, mimeType);
      });
      setImages(imagesBlobs);
      setPostImages(imagesBlobs);
    }
  }, [formData]);

  return (
    <>
      <Button onClick={triggerFileInput} variant="primary">
        Add Images
      </Button>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
      {loading && <p>Uploading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Row className="mt-4">
        {images.map((image, index) => (
          <Col
            xs={12}
            sm={2}
            md={2}
            lg={2}
            xl={1}
            xxl={1}
            key={index}
            className="d-flex align-items-center justify-content-center mb-2"
          >
            <Card className="post-img-card">
              <Card.Img
                className="post-img"
                variant="top"
                src={URL.createObjectURL(image)}
              />
              <Button
                variant="danger"
                onClick={() => removeImage(index)}
                className="position-absolute top-0 end-0 close-button"
              >
                <FontAwesomeIcon icon={faTimesCircle} />
              </Button>
            </Card>
          </Col>
        ))}
        <Col lg={12} className="mt-4 mb-3 text-center">
          <Button variant="primary" onClick={nextStep}>
            Continue
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
    </>
  );
};

// PropTypes validation
PostImages.propTypes = {
  formData: PropTypes.object,
  nextStep: PropTypes.func.isRequired,
  setPostImages: PropTypes.func.isRequired,
};

export default memo(PostImages);
