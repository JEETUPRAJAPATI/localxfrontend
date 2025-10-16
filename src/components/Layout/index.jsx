// src/components/Layout/index.jsx
import { lazy, memo } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { connect } from "react-redux";
import PropTypes from "prop-types"; // Import PropTypes for prop validation

import "./layout.scss";

const Header = lazy(() => import("@/components/Header"));
const Sidebar = lazy(() => import("@/components/Sidebar"));

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <Container fluid>
        <Row>
          <Col md={3}>
            <Sidebar />
          </Col>
          <Col md={9}>
            <main>{children}</main>
          </Col>
        </Row>
      </Container>
    </>
  );
};

// Adding prop types validation
Layout.propTypes = {
  children: PropTypes.node.isRequired, // Validate children prop as required node
};

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(memo(Layout));
