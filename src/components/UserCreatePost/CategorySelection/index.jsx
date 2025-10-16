import { memo, useCallback, useMemo } from "react";
import { Button, Form } from "react-bootstrap";
import PropTypes from "prop-types";
import { Formik, ErrorMessage } from "formik";
import { addPostCategoryFormSchema } from "@/utils/yupValidationSchema";

// Redux
import { useSelector } from "react-redux";
import { createSelector } from "reselect";

// Single memoized selector for Redux state
const storeSelectorData = createSelector(
  (state) => state.auth,
  (auth) => ({
    categories_DATA: auth?.user?.post?.add?.categories || [],
  })
);
const CategorySelection = ({ formData, onSelect, nextStep }) => {
  //:=========================
  // Redux Stores (Memoized)
  //:=========================
  // Extracting multiple state properties with a single selector
  const { categories_DATA: categories } = useSelector(storeSelectorData);

  //:================================================================
  // Data Updation or Manipulation Declaration (Computation Logic)
  //:================================================================
  // Set Country Initial Value
  const initialCategoryId = useMemo(
    () => categories.find((c) => c.id == formData?.category?.id)?.id || "",
    [formData, categories]
  );

  const handleFormSubmit = useCallback(
    (values) => {
      const category = categories.find((c) => c.id == values.categoryId);
      onSelect(category);
      nextStep();
    },
    [categories]
  );
  return (
    <Formik
      enableReinitialize
      initialValues={{
        categoryId: initialCategoryId,
      }}
      validationSchema={addPostCategoryFormSchema}
      onSubmit={handleFormSubmit} // Formik submission handler
    >
      {({ handleSubmit, handleChange, handleBlur, values }) => (
        <>
          <Form onSubmit={handleSubmit}>
            <h3>Select Category</h3>
            <div className="selectChooseOption">
              {categories.map((category) => (
                <Form.Check
                  key={category.id} // Use category.id for a unique key
                  type="radio"
                  label={category.name}
                  name="categoryId"
                  id={category.id}
                  checked={parseInt(values.categoryId) === category.id}
                  value={category.id}
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
              name="categoryId"
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
CategorySelection.propTypes = {
  formData: PropTypes.shape({
    category: PropTypes.shape({
      id: PropTypes.number,
    }),
  }),
  onSelect: PropTypes.func.isRequired,
  nextStep: PropTypes.func,
};

export default memo(CategorySelection);
