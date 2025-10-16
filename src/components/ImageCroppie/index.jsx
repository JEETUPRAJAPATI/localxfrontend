import { useEffect, useRef, memo } from "react";
import { Modal, Button } from "react-bootstrap";
import "croppie/croppie.css";
import Croppie from "croppie";
import PropTypes from "prop-types";

const ImageCroppie = ({ showModal, handleClose, onCrop, imageToCrop }) => {
  const croppieRef = useRef(null);
  const croppieInstance = useRef(null);

  useEffect(() => {
    if (showModal && croppieRef.current) {
      const modalWidth = 350;
      const modalHeight = 350;
      // Initialize Croppie instance when modal is open
      croppieInstance.current = new Croppie(croppieRef.current, {
        viewport: { width: modalWidth, height: modalHeight, type: "square" }, // square viewport
        boundary: { width: modalWidth + 50, height: modalHeight + 50 },
        showZoomer: true,
        enableOrientation: true,
      });

      if (imageToCrop) {
        croppieInstance.current.bind({
          url: imageToCrop,
        });
      }
    }

    return () => {
      // Clean up Croppie instance on unmount or when modal closes
      if (croppieInstance.current) {
        croppieInstance.current.destroy();
        croppieInstance.current = null;
      }
    };
  }, [showModal, imageToCrop]);

  const handleCrop = async () => {
    if (croppieInstance.current) {
      const croppedImage = await croppieInstance.current.result({
        type: "base64",
        size: "viewport",
      });
      onCrop(croppedImage); // Pass cropped image back to parent
      handleClose();
    }
  };

  return (
    <Modal show={showModal} onHide={handleClose} className="croppie-modal">
      <Modal.Header closeButton>
        <Modal.Title>Crop Your Image To Upload</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div
          ref={croppieRef}
          style={{ width: "100%", height: "100%", overflow: "auto" }}
        />
        <Button variant="warning" onClick={handleCrop}>
          Crop & Upload Image
        </Button>
      </Modal.Body>
    </Modal>
  );
};

ImageCroppie.propTypes = {
  showModal: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  onCrop: PropTypes.func.isRequired,
  imageToCrop: PropTypes.string, // Image URL to be cropped
};

export default memo(ImageCroppie);
