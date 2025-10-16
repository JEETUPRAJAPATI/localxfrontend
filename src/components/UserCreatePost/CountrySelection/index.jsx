import { addPostCountryFormSchema } from "@/utils/yupValidationSchema";
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
    countries_DATA: auth?.user?.post?.add?.countries || [],
  })
);

const CountrySelection = ({ formData, onSelect, nextStep }) => {
  //:=========================
  // Redux Stores (Memoized)
  //:=========================
  // Extracting multiple state properties with a single selector
  const { countries_DATA: countries } = useSelector(storeSelectorData);

  //:================================================================
  // Data Updation or Manipulation Declaration (Computation Logic)
  //:================================================================
  // Set Country Initial Value
  const initialCountryId = useMemo(
    () => countries.find((c) => c.id == formData?.country?.id)?.id || "",
    [formData, countries]
  );

  const handleFormSubmit = useCallback(
    (values) => {
      const country = countries.find((c) => c.id == values.countryId);
      onSelect(country);
      nextStep();
    },
    [countries]
  );

  return (
    <Formik
      enableReinitialize
      initialValues={{
        countryId: initialCountryId,
      }}
      validationSchema={addPostCountryFormSchema}
      onSubmit={handleFormSubmit} // Formik submission handler
    >
      {({ handleSubmit, handleChange, handleBlur, values }) => (
        <>
          <Form onSubmit={handleSubmit}>
            <h3>Select Country</h3>
            <div className="selectChooseOption">
              {countries.map((country) => (
                <Form.Check
                  key={country.id} // Use country.id for a unique key
                  type="radio"
                  label={country.name}
                  name="countryId"
                  id={country.id}
                  checked={parseInt(values.countryId) === country.id}
                  value={country.id}
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
              name="countryId"
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
CountrySelection.propTypes = {
  formData: PropTypes.shape({
    country: PropTypes.shape({
      id: PropTypes.number,
    }),
  }),
  onSelect: PropTypes.func.isRequired,
  nextStep: PropTypes.func,
};

export default memo(CountrySelection);
