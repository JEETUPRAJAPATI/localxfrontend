import { getUserRechargeHistoriesAPI } from "@/api/apiAuthService.js";
import FixedAuthHeader from "@/components/FixedAuthHeader";
import { setAuthProps as setAuthProps_ACTION } from "@/store/authSlice.js";
import dynamic from "next/dynamic";
import { memo, Suspense, useCallback, useEffect, useState } from "react";
import { Badge, Col, Container, Row, Table } from "react-bootstrap";
import ReactHtmlParser from "html-react-parser";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { removeATags, removeScriptTags, sanitizeHTML } from "@/utils/helpers";

// Single memoized selector for Redux state
const storeSelectorData = createSelector(
  (state) => state.auth,
  (auth) => ({
    balanceHistories_DATA: auth?.user?.balances?.list || [],
    balanceHistoriesPagination_DATA: auth?.user?.balances?.pagination || {},
  })
);

// Dynamic Components
const CustomPagination = dynamic(
  () => import("@/components/CustomPagination"),
  {
    ssr: false,
  }
);
const CustomPlaceholder = dynamic(
  () => import("@/components/CustomPlaceholder"),
  {
    ssr: false,
  }
);
const Footer = dynamic(() => import("@/components/Footer"), {
  ssr: false,
});

const UserRechargeHistory = () => {
  const dispatch = useDispatch();
  //:=========================
  // Redux Stores (Memoized)
  //:=========================
  const { balanceHistories_DATA, balanceHistoriesPagination_DATA } =
    useSelector(storeSelectorData);

  //:========================================
  // States Declaration
  //:========================================
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [balancePage, setBalancePage] = useState(1);

  //:========================================
  // Function Declaration
  //:========================================
  const fetchRechargeHistoriesAPI = useCallback((options = {}) => {
    const { page = 1 } = options;
    setIsBalanceLoading(true);
    getUserRechargeHistoriesAPI({ page })
      .then(({ list, pagination }) => {
        dispatch(
          setAuthProps_ACTION({ key: "user.balances.list", data: list })
        );
        dispatch(
          setAuthProps_ACTION({
            key: "user.balances.pagination",
            data: pagination,
          })
        );
      })
      .catch((error) => {
        console.error("Error in getUserAllBalanceAPI:", error);
      })
      .finally(() => {
        setIsBalanceLoading(false);
      });
  }, []);

  const handleBalancePageChange = useCallback(
    (pageNumber) => {
      window?.scrollTo(0, 0);
      if (pageNumber == balancePage) return false;
      setBalancePage(pageNumber);
      fetchRechargeHistoriesAPI({
        page: pageNumber,
      });
    },
    [balancePage]
  );

  //:========================================
  // Effect Load Declaration
  //:========================================
  useEffect(() => {
    fetchRechargeHistoriesAPI();
  }, [fetchRechargeHistoriesAPI]);

  return (
    <>
      <FixedAuthHeader />
      <div className="userRechargeHistory">
        <Container className="cnt">
          {/* Panel Heading */}
          <div className="panel-heading">
            <h3>Recharge Histories</h3>
          </div>
          {/* Panel Body */}
          <div className="panel-body">
            <Table responsive bordered>
              <thead>
                <tr style={{ fontWeight: "bold" }}>
                  <th>SL No.</th>
                  <th>Date</th>
                  <th>Payment Gateway</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Transaction ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {isBalanceLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      <td colSpan={7}>
                        <CustomPlaceholder />
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    {balanceHistories_DATA.length > 0 ? (
                      <>
                        {balanceHistories_DATA.map((item) => (
                          <tr key={item.id}>
                            <td>{item.srNo}</td>
                            <td>{item.formattedCreatedDate}</td>
                            <td>{item.method_name}</td>
                            <td>{item.payment_amount}</td>
                            <td>{item.description}</td>
                            <td>{item.transaction_id}</td>
                            <td>
                              <div
                                className="d-flex align-items-center"
                                style={{ whiteSpace: "nowrap" }}
                              >
                                {/* Status Badge */}
                                <Badge
                                  bg={
                                    item.pstatus.toLowerCase() === "approved"
                                      ? "success"
                                      : item.pstatus.toLowerCase() === "pending"
                                      ? "warning"
                                      : "danger"
                                  }
                                  className="text-nowrap"
                                >
                                  {item.pstatus}
                                </Badge>

                                {/* Additional info */}
                                <div className="d-flex text-nowrap overflow-hidden ms-2">
                                  {item?.formattedApprovedDate &&
                                    item.pstatus.toLowerCase() !==
                                      "pending" && (
                                      <small className="me-1">
                                        <strong>On:</strong>{" "}
                                        {item.formattedApprovedDate}
                                      </small>
                                    )}
                                  {item?.reason &&
                                    item.pstatus.toLowerCase() !==
                                      "pending" && (
                                      <small className="text-truncate">
                                        <strong>Reason:</strong>{" "}
                                        {ReactHtmlParser(
                                          sanitizeHTML(
                                            removeScriptTags(
                                              removeATags(item.reason)
                                            )
                                          )
                                        )}
                                      </small>
                                    )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </>
                    ) : (
                      <>
                        <tr>
                          <td colSpan={7}>No Records Found</td>
                        </tr>
                      </>
                    )}
                  </>
                )}
              </tbody>
            </Table>
            <Row>
              <Col>
                {!isBalanceLoading &&
                  balanceHistoriesPagination_DATA?.totalRecords > 0 && (
                    <Suspense fallback={<CustomPlaceholder />}>
                      <CustomPagination
                        totalItems={
                          balanceHistoriesPagination_DATA?.totalRecords || 0
                        }
                        itemsPerPage={
                          balanceHistoriesPagination_DATA?.perPageLimit || 0
                        }
                        activePage={parseInt(
                          balanceHistoriesPagination_DATA?.currentPage || 1
                        )}
                        onPageChange={handleBalancePageChange}
                      />
                    </Suspense>
                  )}
              </Col>
            </Row>
          </div>
          {/* Panel Footer */}
          <div className="panel-footer" />
        </Container>
      </div>
      <Footer className="bottom-fixed" />
    </>
  );
};

UserRechargeHistory.propTypes = {};
export default memo(UserRechargeHistory);
