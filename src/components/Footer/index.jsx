"use client";

import { Fragment, memo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { ROUTES } from "@/utils/constant";

const ScrollToTopButton = dynamic(
  () => import("@/components/ScrollToTopButton"),
  {
    ssr: false,
    loading: () => null,
  }
);

const storeSelectorData = createSelector(
  (state) => state.page,
  (page) => ({
    pageSettings_DATA: page?.pageSettings || {},
  })
);

const Footer = ({ className = "", ...props }) => {
  const { pageSettings_DATA } = useSelector(storeSelectorData);
  return (
    <footer>
      <div {...props} className={`footer ${className || ""}`}>
        <div className="footer-container">
          {/* Internal Site Pages Section */}
          <div className="footer-links">
            {[
              {
                text: "About",
                url: ROUTES.aboutUs,
              },
              {
                text: "Friends",
                url: ROUTES.friends,
              },
              {
                text: "Terms of Service",
                url: ROUTES.terms,
              },
              {
                text: "Contact Us",
                url: ROUTES.contactUs,
              },
              {
                text: "Partners",
                url: ROUTES.partners,
              },

              {
                text: "Blogs",
                url: ROUTES.blogs,
              },
            ].map((nav, index) => (
              <Link key={index} href={nav.url} prefetch={false}>
                {nav.text}
              </Link>
            ))}

            {pageSettings_DATA?.footerLinks?.map((nav, index) => (
              <Fragment key={index}>
                <a
                  href={nav.url}
                  target={nav.new_window_open ? "_blank" : "_self"}
                  rel="noreferrer"
                  className="footer-link"
                  style={{ color: "#8a3737", fontWeight: "bold" }}
                >
                  {nav.text}
                </a>
              </Fragment>
            ))}
          </div>

          <div className="copyright">
            <p>{pageSettings_DATA?.footer_text || ""}</p>
          </div>
        </div>

        <ScrollToTopButton />
      </div>
    </footer>
  );
};

Footer.propTypes = {
  className: PropTypes.string,
};

export default memo(Footer);
