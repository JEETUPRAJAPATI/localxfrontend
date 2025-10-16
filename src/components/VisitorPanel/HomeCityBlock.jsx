"use client";
import { memo } from "react";
import { ListGroup } from "react-bootstrap";
import CardHeaderToggle from "./HomeLocationCardHeaderToggle";
import SubCityBlock from "./HomeSubCityBlock";
import styles from "@/styles/home.module.scss";

const CityBlock = memo(
  ({
    defaultCityActiveKeys,
    countryData,
    cityData,
    isCityExpanded,
    loadingCityIds,
    handleCityToggle,
    handleLoadMoreSubcity,
  }) => (
    <div key={cityData.id} className={styles.cityBlock}>
      <CardHeaderToggle
        defaultActiveKeys={defaultCityActiveKeys}
        mainKeyId={`city-${cityData.id}`}
        value={`${cityData.id}`}
        onToggle={handleCityToggle}
      >
        <h3 className={styles.cityTitle}>{cityData.city}</h3>
      </CardHeaderToggle>
      {/* Render subcities if the city is expanded */}
      {isCityExpanded && (
        <div className={styles.subcitiesContainer}>
          <ListGroup className={styles.listGroup}>
            {cityData.subcities.map((suburb) => (
              <SubCityBlock
                key={suburb.id}
                suburb={suburb}
                countryData={countryData}
                cityData={cityData}
              />
            ))}
            {cityData.hasMoreSubcities && (
              <ListGroup.Item
                key={"load-more"}
                style={{ cursor: "pointer" }}
                disabled={loadingCityIds.includes(cityData.id)}
                onClick={() =>
                  handleLoadMoreSubcity(
                    cityData.countryId,
                    cityData.id,
                    cityData.subCityPagination
                  )
                }
                className={styles.listGroupItem}
              >
                <h4 className={styles.subcityTitle}>
                  {loadingCityIds.includes(cityData.id)
                    ? "Loading..."
                    : "Load more"}
                </h4>
              </ListGroup.Item>
            )}
          </ListGroup>
        </div>
      )}
    </div>
  )
);
CityBlock.displayName = "CityBlock";

export default CityBlock;
