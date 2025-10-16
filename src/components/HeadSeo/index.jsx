import { memo } from "react";

import PropTypes from "prop-types";
import { connect } from "react-redux";
import useCustomSEO from "@/customHooks/useCustomSEO";

const HeadSeo = ({ seoData_DATA = {} }) => {
  useCustomSEO(seoData_DATA);
  return null;
};

HeadSeo.propTypes = {
  seoData_DATA: PropTypes.object,
};

const mapStateToProps = (state) => ({
  seoData_DATA: state?.headSeo || {},
});

export default connect(mapStateToProps)(memo(HeadSeo));
