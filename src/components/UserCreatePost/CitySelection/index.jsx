import { addPostCityFormSchema } from "@/utils/yupValidationSchema";
import { ErrorMessage, Formik } from "formik";
import PropTypes from "prop-types";
import { memo, useCallback, useMemo } from "react";
import { Button, Form } from "react-bootstrap";

// Redux
import { useSelector } from "react-redux";
import { createSelector } from "reselect";

// Single memoized selector for Redux state
const storeSelectorData = createSelector(
  (state) => state.auth,
  (auth) => ({
    cities_DATA: auth?.user?.post?.add?.cities || [],
  })
);

const CitySelection = ({ formData, onSelect, nextStep }) => {
  //:=========================
  // Redux Stores (Memoized)
  //:=========================
  // Extracting multiple state properties with a single selector
  const { cities_DATA: cities } = useSelector(storeSelectorData);

  //:================================================================
  // Data Updation or Manipulation Declaration (Computation Logic)
  //:================================================================
  // Set Country Initial Value
  const initialCityId = useMemo(
    () => cities.find((c) => c.id == formData?.city?.id)?.id || "",
    [formData, cities]
  );

  const handleFormSubmit = useCallback(
    (values) => {
      const city = cities.find((c) => c.id == values.cityId);
      onSelect(city);
      nextStep();
    },
    [cities]
  );

  return (
    <Formik
      initialValues={{
        cityId: initialCityId,
      }}
      enableReinitialize
      validationSchema={addPostCityFormSchema}
      onSubmit={handleFormSubmit} // Formik submission handler
    >
      {({ handleSubmit, handleChange, handleBlur, values }) => (
        <>
          <Form onSubmit={handleSubmit}>
            <h3>Select City</h3>
            <div className="selectChooseOption">
              {cities.map((city) => (
                <Form.Check
                  key={city.id} // Use city.id for a unique key
                  type="radio"
                  label={city.name}
                  name="cityId"
                  id={city.id}
                  checked={parseInt(values.cityId) === city.id}
                  value={city.id}
                  // onChange={handleChange}
                  onChange={async (e) => {
                    await handleChange(e); // This will update Formik's state
                    await handleSubmit(); // This will submit the form
                  }}
                  onBlur={handleBlur}
                />
              ))}
            </div>
            <ErrorMessage
              name="cityId"
              component="div"
              className="text-danger"
            />
            <Button type="submit" className="mt-4 mb-4">
              Continue
            </Button>
          </Form>
        </>
      )}
    </Formik>
  );
};

// Prop validation for the component
CitySelection.propTypes = {
  formData: PropTypes.shape({
    city: PropTypes.shape({
      id: PropTypes.number,
    }),
  }),
  onSelect: PropTypes.func.isRequired,
  nextStep: PropTypes.func,
};
export default memo(CitySelection);
