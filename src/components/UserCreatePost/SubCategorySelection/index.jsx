import { memo, useCallback, useMemo } from "react"; // Ensure React is in scope
import { Button, Form } from "react-bootstrap";
import PropTypes from "prop-types"; // Import PropTypes
import { Formik, ErrorMessage } from "formik";
import { addPostSubCategoryFormSchema } from "@/utils/yupValidationSchema";

// Redux
import { useSelector } from "react-redux";
import { createSelector } from "reselect";

// Single memoized selector for Redux state
const storeSelectorData = createSelector(
  (state) => state.auth,
  (auth) => ({
    subCategories_DATA: auth?.user?.post?.add?.subCategories || [],
  })
);

const SubCategorySelection = ({ formData, nextStep, onSelect }) => {
  //:=========================
  // Redux Stores (Memoized)
  //:=========================
  // Extracting multiple state properties with a single selector
  const { subCategories_DATA: subCategories } = useSelector(storeSelectorData);

  //:================================================================
  // Data Updation or Manipulation Declaration (Computation Logic)
  //:================================================================
  // Set Country Initial Value
  const initialSubCategoryId = useMemo(
    () =>
      subCategories.find((c) => c.id == formData?.subCategory?.id)?.id || "",
    [formData, subCategories]
  );

  const handleFormSubmit = useCallback(
    (values) => {
      const subCategory = subCategories.find(
        (c) => c.id == values.subCategoryId
      );
      onSelect(subCategory);
      nextStep();
    },
    [subCategories]
  );
  return (
    <Formik
      enableReinitialize
      initialValues={{
        subCategoryId: initialSubCategoryId,
      }}
      validationSchema={addPostSubCategoryFormSchema}
      onSubmit={handleFormSubmit} // Formik submission handler
    >
      {({ handleSubmit, handleChange, handleBlur, values }) => (
        <>
          <Form onSubmit={handleSubmit}>
            <h3>Select SubCategory</h3>
            <div className="selectChooseOption">
              {subCategories.map((subCategory) => {
                return (
                  <Form.Check
                    key={subCategory.id}
                    type="radio"
                    label={subCategory.name}
                    name="subCategoryId"
                    id={subCategory.id}
                    checked={parseInt(values.subCategoryId) === subCategory.id}
                    value={subCategory.id}
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
              name="subCategoryId"
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

// Define prop types
SubCategorySelection.propTypes = {
  formData: PropTypes.shape({
    subCategory: PropTypes.shape({
      id: PropTypes.number,
    }),
  }),
  onSelect: PropTypes.func.isRequired,
  nextStep: PropTypes.func,
};

export default memo(SubCategorySelection);
