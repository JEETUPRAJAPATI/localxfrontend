"use client";
import { ROUTES } from "@/utils/constant";
import Link from "next/link";
import { memo } from "react";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import NextImage from "../NextImage";
import styles from "@/styles/home.module.scss"; // Ensure styles are imported

const homeSelectorData = createSelector(
  (state) => state.headSeo,
  (_headSeo) => ({
    logo_DATA: "/images/logo.png", // Always use local static logo
  })
);

const HomeTopLogo = memo(() => {
  const { logo_DATA } = useSelector(homeSelectorData);
  return (
    <div className="d-flex justify-content-center">
      <Link href={ROUTES.home} className={styles.brandLogo}>
        <NextImage
          src={logo_DATA}
          alt="Logo"
          width={300}
          height={77}
          aspectRatio={"300/77"}
          priority={true}
          quality={75}
        />
      </Link>
    </div>
  );
});

HomeTopLogo.displayName = "HomeTopLogo";

export default HomeTopLogo;
