"use client";
import { sanitizeHTML } from "@/utils/helpers";
import ReactHtmlParser from "html-react-parser";
import { memo } from "react";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import styles from "@/styles/home.module.scss"; // Ensure styles are imported

const homeSelectorData = createSelector(
  (state) => state.home,
  (state) => state.headSeo,
  (home, headSeo) => ({
    topNotice_DATA: sanitizeHTML(headSeo?.pageHeading || home?.topNotice || ""),
  })
);

const HomeTopNotice = memo(() => {
  const { topNotice_DATA } = useSelector(homeSelectorData);
  return (
    <div className={styles.homeTopNotice}>
      {ReactHtmlParser(topNotice_DATA)}
    </div>
  );
});

HomeTopNotice.displayName = "HomeTopNotice";

export default HomeTopNotice;
