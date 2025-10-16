import FixedAuthHeader from "@/components/FixedAuthHeader/index.jsx";
import dynamic from "next/dynamic";
import { memo } from "react";
import { Container, Table } from "react-bootstrap";
// Redux
import { useSelector } from "react-redux";
import { createSelector } from "reselect";

// Single memoized selector for Redux state
const storeSelectorData = createSelector(
  (state) => state.auth,
  (auth) => ({
    profile_DATA: auth?.user?.profile || {},
  })
);
// Dynamic Components
const Footer = dynamic(() => import("@/components/Footer"), {
  ssr: false,
});

const UserViewProfile = () => {
  //:=========================
  // Redux Stores (Memoized)
  //:=========================
  const { profile_DATA } = useSelector(storeSelectorData);

  return (
    <>
      <FixedAuthHeader />
      <div className="userViewProfile">
        <Container className="cnt">
          {/* Panel Heading */}
          <div className="panel-heading">
            <h3>Profile</h3>
          </div>
          {/* Panel Body */}
          <div className="panel-body">
            <div className="table-responsive">
              <Table bordered>
                <tbody>
                  <tr>
                    <th>Date</th>
                    <td>{profile_DATA?.formattedDate || ""}</td>
                    <th>Username</th>
                    <td>{profile_DATA?.username || ""}</td>
                  </tr>
                  <tr>
                    <th>Email</th>
                    <td>{profile_DATA?.email || ""}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>
          {/* Panel Footer */}
          <div className="panel-footer" />
        </Container>
      </div>
      <Footer className="bottom-fixed" />
    </>
  );
};

UserViewProfile.propTypes = {};
export default memo(UserViewProfile);
