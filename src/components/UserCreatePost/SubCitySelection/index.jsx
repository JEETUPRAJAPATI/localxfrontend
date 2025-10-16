import { ErrorMessage, Formik } from "formik";
import PropTypes from "prop-types"; // Import PropTypes
import { memo, useCallback, useMemo } from "react";
import { Button, Form } from "react-bootstrap";
import { addPostSubCityFormSchema } from "@/utils/yupValidationSchema";

// Redux
import { useSelector } from "react-redux";
import { createSelector } from "reselect";

// Single memoized selector for Redux state
const storeSelectorData = createSelector(
  (state) => state.auth,
  (auth) => ({
    subCities_DATA: auth?.user?.post?.add?.subCities || [],
  })
);

const SubCitySelection = ({ formData, onSelect, nextStep }) => {
  //:=========================
  // Redux Stores (Memoized)
  //:=========================
  // Extracting multiple state properties with a single selector
  const { subCities_DATA: subCities } = useSelector(storeSelectorData);

  //:================================================================
  // Data Updation or Manipulation Declaration (Computation Logic)
  //:================================================================
  // Set Country Initial Value
  const initialSubCityId = useMemo(
    () => subCities.find((c) => c.id == formData?.subCity?.id)?.id || "",
    [formData, subCities]
  );

  const handleFormSubmit = useCallback(
    (values) => {
      const subCity = subCities.find((c) => c.id == values.subCityId);
      onSelect(subCity);
      nextStep();
    },
    [subCities]
  );
  return (
    <Formik
      initialValues={{
        subCityId: initialSubCityId,
      }}
      enableReinitialize
      validationSchema={addPostSubCityFormSchema}
      onSubmit={handleFormSubmit} // Formik submission handler
    >
      {({ handleSubmit, handleChange, handleBlur, values }) => (
        <>
          <Form onSubmit={handleSubmit}>
            <h3>Select Subcity</h3>
            <div className="selectChooseOption">
              {subCities.map((subCity) => {
                return (
                  <Form.Check
                    key={subCity.id}
                    type="radio"
                    label={subCity.name}
                    name="subCityId"
                    id={subCity.id}
                    checked={parseInt(values.subCityId) === subCity.id}
                    value={subCity.id}
                    // onChange={handleChange}
                    onChange={async (e) => {
                      await handleChange(e); // This will update Formik's state
                      await handleSubmit(); // This will submit the form
                    }}
                    onBlur={handleBlur}
                  />
                );
              })}
            </div>
            <ErrorMessage
              name="subCityId"
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

// Prop validation
SubCitySelection.propTypes = {
  formData: PropTypes.shape({
    subCity: PropTypes.shape({
      id: PropTypes.number,
    }),
  }),
  onSelect: PropTypes.func.isRequired,
  nextStep: PropTypes.func,
};

export default memo(SubCitySelection);
