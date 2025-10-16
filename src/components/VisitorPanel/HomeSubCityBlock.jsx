"use client";
import { slugify } from "@/utils/helpers";
import Link from "next/link";
import { memo } from "react";
import { ListGroup } from "react-bootstrap";
import styles from "@/styles/home.module.scss";

const SubCityBlock = memo(({ suburb, countryData, cityData }) => (
  <ListGroup.Item key={suburb.id} className={styles.listGroupItem}>
    <Link
      href={`/s/${slugify(countryData.country)}/${slugify(
        cityData.city
      )}/${slugify(suburb.subcity)}`}
    >
      <h4 className={styles.subcityTitle}>{suburb.subcity}</h4>
    </Link>
  </ListGroup.Item>
));
SubCityBlock.displayName = "SubCityBlock";

export default SubCityBlock;
