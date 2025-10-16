// src/components/VisitorPanel/HomeNavigation.jsx
import { memo } from "react";
import Link from "next/link";
import { Col, Row } from "react-bootstrap";
import useAuth from "@/customHooks/useAuth";
import { CREATE_POST_STEPS_USER_PANEL, ROUTES } from "@/utils/constant";
import styles from "@/styles/home.module.scss"; // Ensure styles are imported

const HomeNavigation = memo(() => {
  const { isAuthenticated } = useAuth();

  return (
    <Row className={`g-1 g-md-2 nav-row ${styles.navRow}`}>
      <Col>
        <div className={`${styles.chooseLocationNav} ${styles.topNav}`}>
          <small>Choose a location:</small>
        </div>
      </Col>
      <Col>
        <div className={`${styles.myAccountNav} text-end ${styles.topNav}`}>
          <Link
            href={isAuthenticated ? ROUTES.userDashboard : ROUTES.login}
            className={styles.accountLink}
          >
            My Account
          </Link>
          <span className={styles.separator}>|</span>
          <Link
            href={
              isAuthenticated
                ? CREATE_POST_STEPS_USER_PANEL[0]?.route || ""
                : ROUTES.login
            }
            className={styles.accountLink}
          >
            Post Ad
          </Link>
        </div>
      </Col>
    </Row>
  );
});

HomeNavigation.displayName = "HomeNavigation";
export default HomeNavigation;
