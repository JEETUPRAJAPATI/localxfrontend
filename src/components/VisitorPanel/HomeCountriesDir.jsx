"use client";
import {
  getHomeCountriesV2API,
  getHomeLoadMoreCitiesAPI,
  getHomeLoadMoreSubcitiesAPI,
} from "@/api/apiService";
import useDeviceSize from "@/customHooks/useDeviceSize";
import { setHomeProps_ACTION } from "@/store/homeSlice";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import CityBlock from "./HomeCityBlock";
import CardHeaderToggle from "./HomeLocationCardHeaderToggle";
import styles from "@/styles/home.module.scss";

// Combined selector for HomeCountriesDir
const homeSelectorData = createSelector([(state) => state.home], (home) => ({
  countries_DATA: home?.countryData?.list || [],
  hasMoreCountries_DATA: home?.countryData?.hasMoreCountries || false,
  countryPagination_DATA: home?.countryData?.countryPagination || {},
}));

const HomeCountriesDir = memo(() => {
  const dispatch = useDispatch();
  const { isDesktop, isMobile } = useDeviceSize();
  const { countries_DATA, hasMoreCountries_DATA, countryPagination_DATA } =
    useSelector(homeSelectorData);
  //:========================================
  const countryActiveKeys = useMemo(() => {
    const validCountries = Array.isArray(countries_DATA) ? countries_DATA : [];
    return isDesktop ? validCountries.map((country) => `${country.id}`) : [];
  }, [countries_DATA, isDesktop]);
  const cityActiveKeys = useMemo(() => {
    const validCountries = Array.isArray(countries_DATA) ? countries_DATA : [];
    return isDesktop
      ? validCountries.flatMap((country) =>
          Array.isArray(country.cities) ? country.cities.map((city) => `${city.id}`) : []
        )
      : [];
  }, [countries_DATA, isDesktop]);
  //:========================================
  // State Declaration
  //:========================================
  const [defaultCountryActiveKeys, setDefaultCountryActiveKeys] =
    useState(countryActiveKeys);
  const [defaultCityActiveKeys, setDefaultCityActiveKeys] =
    useState(cityActiveKeys);
  const [loadingCityIds, setLoadingCityIds] = useState([]);
  const [loadingCountryIds, setLoadingCountryIds] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  // const [setHasCountryKeys] = useState(false);
  //:========================================
  // Function Declaration
  //:========================================
  const handleCountryToggle = useCallback(
    (key) => {
      setDefaultCountryActiveKeys((prevKeys) => {
        if (prevKeys.includes(key)) {
          // Remove key to collapse
          const expandedCountriesKeys = prevKeys.filter(
            (activeKey) => activeKey !== key
          );

          if (isMobile) {
            // Collapse all cities under the speicific country
            const cityKeys = countries_DATA
              .find((country) => country.id == key)
              ?.cities.map((city) => `${city.id}`);
            // Remove city keys from the active cities keys
            setDefaultCityActiveKeys(
              (prevCityKeys) =>
                prevCityKeys.filter(
                  (activeKey) => !cityKeys?.includes(activeKey)
                ) || []
            );
          }

          return expandedCountriesKeys || [];
        }
        return [...prevKeys, key]; // Add key to expandedCountriesKeys
      });
    },
    [countries_DATA, isMobile]
  );
  const handleCityToggle = useCallback((key) => {
    setDefaultCityActiveKeys(
      (prevKeys) =>
        prevKeys.includes(key)
          ? prevKeys.filter((activeKey) => activeKey !== key)
          : [...prevKeys, key] //expandedCitiesKeys
    );
  }, []);

  const handleLoadMoreCountry = useCallback(async () => {
    if (!hasMoreCountries_DATA || !countryPagination_DATA?.nextPage) return;

    try {
      // Set loading state for countries
      setLoadingCountries(true);

      const { list, countryPagination, hasMoreCountries } =
        await getHomeCountriesV2API({
          countryPage: countryPagination_DATA?.nextPage || 1,
        });

      // Clone existing countries data to avoid direct mutation
      const updatedCountries = [...countries_DATA, ...list];
      // Dispatch updated data to Redux store
      dispatch(
        setHomeProps_ACTION({
          key: "countryData",
          data: {
            list: updatedCountries,
            countryPagination,
            hasMoreCountries,
          },
        })
      );
    } catch (error) {
      console.error("Failed to load more countries:", error);
    } finally {
      setLoadingCountries(false);
      // Clear loading
    }
  }, [countries_DATA, countryPagination_DATA, dispatch]);

  const handleLoadMoreCity = useCallback(
    async (countryId, currentPagination) => {
      try {
        setLoadingCountryIds((prev) => [...prev, countryId]); // Set loading for this country
        const { list, pagination } = await getHomeLoadMoreCitiesAPI({
          countryId,
          page: currentPagination?.nextPage || 1,
        });

        // Find the country to update
        const validCountries = Array.isArray(countries_DATA) ? countries_DATA : [];
        const updatedCountries = validCountries.map((country) => {
          if (Number(country.id) === Number(countryId)) {
            return {
              ...country,
              cities: [...country.cities, ...list],
              cityPagination: pagination,
              hasMoreCities: pagination.nextPage ? true : false,
            };
          }
          return country;
        });

        // Dispatch updated data to Redux store
        dispatch(
          setHomeProps_ACTION({
            key: "countryData",
            data: {
              list: updatedCountries,
              countryPagination: countryPagination_DATA,
              hasMoreCountries: hasMoreCountries_DATA,
            },
          })
        );
      } catch (error) {
        console.error("Failed to load more cities:", error);
      } finally {
        setLoadingCountryIds((prev) => prev.filter((id) => id !== countryId)); // Clear loading
      }
    },
    [countries_DATA, countryPagination_DATA, hasMoreCountries_DATA, dispatch]
  );

  const handleLoadMoreSubcity = useCallback(
    async (countryId, cityId, currentPagination) => {
      try {
        setLoadingCityIds((prev) => [...prev, cityId]); // Set loading for this city
        const { list, pagination } = await getHomeLoadMoreSubcitiesAPI({
          cityId,
          page: currentPagination?.nextPage || 1,
        });

        // Find the country and city to update
        const validCountries = Array.isArray(countries_DATA) ? countries_DATA : [];
        const updatedCountries = validCountries.map((country) => {
          if (Number(country.id) === Number(countryId)) {
            return {
              ...country,
              cities: Array.isArray(country.cities) ? country.cities.map((city) => {
                if (Number(city.id) === Number(cityId)) {
                  return {
                    ...city,
                    subcities: [...city.subcities, ...list],
                    subCityPagination: pagination,
                    hasMoreSubcities: pagination.nextPage ? true : false,
                  };
                }
                return city;
              }),
            };
          }
          return country;
        });

        // Dispatch updated data to Redux store
        dispatch(
          setHomeProps_ACTION({
            key: "countryData",
            data: {
              list: updatedCountries,
              countryPagination: countryPagination_DATA,
              hasMoreCountries: hasMoreCountries_DATA,
            },
          })
        );
      } catch (error) {
        console.error("Failed to load more subcities:", error);
      } finally {
        setLoadingCityIds((prev) => prev.filter((id) => id !== cityId)); // Clear loading
      }
    },
    [countries_DATA, countryPagination_DATA, hasMoreCountries_DATA, dispatch]
  );

  //:========================================
  // Effect Declaration
  //:========================================
  useEffect(() => {
    if (isDesktop) {
      setDefaultCountryActiveKeys(countryActiveKeys);
      setDefaultCityActiveKeys(cityActiveKeys);
    }
  }, [countryActiveKeys, cityActiveKeys, isDesktop]);

  return (
    <>
      {Array.isArray(countries_DATA) && countries_DATA.map((countryData) => {
        const isCountryExpanded = defaultCountryActiveKeys.includes(
          `${countryData.id}`
        );

        return (
          <div key={countryData.id} className={styles.countryBlock}>
            <CardHeaderToggle
              defaultActiveKeys={defaultCountryActiveKeys}
              mainKeyId={`country-${countryData.id}`}
              value={`${countryData.id}`}
              onToggle={handleCountryToggle}
            >
              <h2 className={styles.countryTitle}>{countryData.country}</h2>
            </CardHeaderToggle>

            {isCountryExpanded && (
              <div className={styles.citiesContainer}>
                {countryData.cities.map((cityData) => {
                  const isCityExpanded = defaultCityActiveKeys.includes(
                    `${cityData.id}`
                  );

                  return (
                    <CityBlock
                      key={cityData.id}
                      defaultCityActiveKeys={defaultCityActiveKeys}
                      countryData={countryData}
                      cityData={cityData}
                      isCityExpanded={isCityExpanded}
                      loadingCityIds={loadingCityIds}
                      handleCityToggle={handleCityToggle}
                      handleLoadMoreSubcity={handleLoadMoreSubcity}
                    />
                  );
                })}
                {countryData.hasMoreCities && (
                  <div
                    key={"load-more-cities"}
                    className={styles.loadMoreCityBlock}
                    style={{ cursor: "pointer" }}
                    disabled={loadingCountryIds.includes(countryData.id)}
                    onClick={() =>
                      handleLoadMoreCity(
                        countryData.id,
                        countryData.cityPagination
                      )
                    }
                  >
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cityTitle}>
                        {loadingCountryIds.includes(countryData.id)
                          ? "Loading..."
                          : "Load more"}
                      </h3>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {hasMoreCountries_DATA && countryPagination_DATA?.nextPage && (
        <div
          key={"load-more-countries"}
          className={styles.loadMoreCountryBlock}
          style={{ cursor: "pointer" }}
          disabled={loadingCountries}
          onClick={handleLoadMoreCountry}
        >
          <div className={styles.cardHeader}>
            <h2 className={styles.countryTitle}>
              {loadingCountries ? "Loading..." : "Load more"}
            </h2>
          </div>
        </div>
      )}
    </>
  );
});

HomeCountriesDir.displayName = "HomeCountriesDir";

export default HomeCountriesDir;
