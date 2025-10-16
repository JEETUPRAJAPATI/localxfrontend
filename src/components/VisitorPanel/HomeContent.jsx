"use client";
import { sanitizeHTML } from "@/utils/helpers";
import ReactHtmlParser from "html-react-parser";
import { memo } from "react";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import styles from "@/styles/home.module.scss"; // Ensure styles are imported

const homeSelectorData = createSelector(
  (state) => state.home,
  (home) => ({
    dashboardContent_DATA: sanitizeHTML(home?.dashboardContent || ""),
  })
);

const HomeContent = memo(() => {
  const { dashboardContent_DATA } = useSelector(homeSelectorData);
  return (
    <div className={styles.aboutSection}>
      {ReactHtmlParser(dashboardContent_DATA)}
    </div>
  );
});

HomeContent.displayName = "HomeContent";

export default HomeContent;
