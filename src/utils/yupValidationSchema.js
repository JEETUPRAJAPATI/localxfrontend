// src/utils/formValidations.js
import * as yup from 'yup';

const reportFormSchema = yup.object({
  // post_id: yup
  //   .number()
  //   .required('Post ID is required.')
  //   .typeError('Post ID must be a valid number.'), // Custom error message for type mismatch
  email: yup
    .string()
    .trim()
    .email('Please provide a valid email address.')
    .matches(
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|live\.com|outlook\.com|hotmail\.com|icloud\.com)$/,
      'Only Gmail, Yahoo, Live, Outlook, Hotmail, and iCloud emails are allowed.'
    )
    .required('Email is required.'),
  description: yup
    .string()
    .max(500, 'Description cannot exceed 500 characters.')
    .required('Description is required.'),

  googleCaptcha: yup.string().required('Captcha verification is required.'),
});

const signupFormSchema = yup.object({
  username: yup
    .string()
    .trim()
    .min(6, 'Username must be at least 6 characters long.')
    .max(32, 'Username must be at most 32 characters long.')
    .matches(/^[A-Za-z][A-Za-z0-9]{5,31}$/, 'Username must be alphanumeric.')
    .required('Username is required.'),

  email: yup
    .string()
    .trim()
    .email('Please provide a valid email address.')
    .matches(
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|live\.com|outlook\.com|hotmail\.com|icloud\.com)$/,
      'Only Gmail, Yahoo, Live, Outlook, Hotmail, and iCloud emails are allowed.'
    )
    .required('Email is required.'),

  password: yup
    .string()
    .trim()
    .min(6, 'Password must be at least 6 characters long.')
    .required('Password is required.'),

  confirm_password: yup
    .string()
    .trim()
    .oneOf([yup.ref('password'), null], 'Passwords must match.')
    .required('Confirm password is required.'),

  googleCaptcha: yup.string().required('Captcha verification is required.'),

  terms: yup
    .boolean()
    .oneOf([true], 'You must accept the terms and conditions.')
    .required('You must accept the terms and conditions.'),
});

const loginFormSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email('Please provide a valid email address.')
    .matches(
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|live\.com|outlook\.com|hotmail\.com|icloud\.com)$/,
      'Only Gmail, Yahoo, Live, Outlook, Hotmail, and iCloud emails are allowed.'
    )
    .required('Email is required.'),

  password: yup
    .string()
    .trim()
    .min(6, 'Password must be at least 6 characters long.')
    .required('Password is required.'),

  googleCaptcha: yup.string().required('Captcha verification is required.'),
});

const signupVerificationCodeFormSchema = yup.object({
  confirmation_code: yup
    .string()
    .trim()
    .required('Verification code is required.'),
});

const forgotVerificationFormSchema = yup.object({
  username: yup.string().trim().required('Username is required.'),
});

const forgotPasswordFormSchema = yup.object({
  username: yup
    .string()
    .trim()
    .min(3, 'Username / Email must be at least 3 characters long.')
    .required('Username / Email is required.'),
});

const resetPasswordVerificationFormSchema = yup.object({
  reset_password_code: yup
    .string()
    .trim()
    .required('Reset password code is required.'),

  new_password: yup
    .string()
    .trim()
    .min(6, 'New password must be at least 6 characters long.')
    .required('New password is required.'),

  confirm_new_password: yup
    .string()
    .trim()
    .oneOf([yup.ref('new_password'), null], 'Confirm new passwords must match.')
    .required('Confirm new password is required.'),
});

const contactFormSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(6, 'Name must be at least 6 characters long.')
    .required('Name is required.'),

  subject: yup
    .string()
    .trim()
    .min(6, 'Subject must be at least 6 characters long.')
    .required('Subject is required.'),

  email: yup
    .string()
    .trim()
    .email('Please provide a valid email address.')
    .matches(
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|live\.com|outlook\.com|hotmail\.com|icloud\.com)$/,
      'Only Gmail, Yahoo, Live, Outlook, Hotmail, and iCloud emails are allowed.'
    )
    .required('Email is required.'),

  phone_number: yup
    .string()
    .trim()
    .min(10, 'Phone number must be at least 10 characters long.')
    .required('Phone number is required.'),

  message: yup
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters long.')
    .max(500, 'Message cannot exceed 500 characters.')
    .required('Message is required.'),

  googleCaptcha: yup.string().required('Captcha verification is required.'),
});

// Function to validate if the HTML content contains only a valid <a> tag with href starting with http/https
const isAnchorTagWithHttpHref = (value) => {
  const anchorTagRegex = /^<a\s+href="(https?:\/\/[^\s"]+)"[^>]*>.*<\/a>$/;
  return anchorTagRegex.test(value);
};

const partnerFormSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(6, 'Name must be at least 6 characters long.')
    .max(32, 'Name must be at most 32 characters long.')
    .required('Name is required.'),

  email: yup
    .string()
    .trim()
    .email('Please provide a valid email address.')
    .matches(
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|live\.com|outlook\.com|hotmail\.com|icloud\.com)$/,
      'Only Gmail, Yahoo, Live, Outlook, Hotmail, and iCloud emails are allowed.'
    )
    .required('Email is required.'),

  url: yup
    .string()
    .trim()
    .matches(
      /^https?:\/\/[^\s$.?#].[^\s]*$/,
      'URL must start with http:// or https:// and be a valid URL.'
    )
    .required('URL is required.'),

  html_url: yup
    .string()
    .trim()
    .test(
      'is-anchor-tag',
      'HTML URL must be a valid <a> tag with an href attribute starting with http:// or https://.',
      (value) => isAnchorTagWithHttpHref(value)
    )
    .required('HTML URL is required.'),

  description: yup
    .string()
    .max(500, 'Description cannot exceed 500 characters.')
    .required('Description is required.'),

  answer: yup
    .string()
    .trim()
    .min(6, 'Answer must be at least 6 characters long.')
    .required('Answer is required.'),

  googleCaptcha: yup.string().required('Captcha verification is required.'),
});

const editPostFormSchema = yup.object({
  title: yup
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters long.')
    .required('Title is required.'),

  location: yup
    .string()
    .trim()
    .min(3, 'Location must be at least 3 characters long.')
    .required('Location is required.'),

  email: yup
    .string()
    .trim()
    .email('Please provide a valid email address.')
    .matches(
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|live\.com|outlook\.com|hotmail\.com|icloud\.com)$/,
      'Only Gmail, Yahoo, Live, Outlook, Hotmail, and iCloud emails are allowed.'
    )
    .required('Email is required.'),

  phone: yup
    .string()
    .trim()
    .min(10, 'Phone number must be at least 10 characters long.')
    .required('Phone number is required.'),

  description: yup.string().trim().required('Description is required.'),

  googleCaptcha: yup
    .string()
    .trim()
    .required('Captcha verification is required.'),
});

const changeProfileFormSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .email('Please provide a valid email address.')
    .matches(
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|live\.com|outlook\.com|hotmail\.com|icloud\.com)$/,
      'Only Gmail, Yahoo, Live, Outlook, Hotmail, and iCloud emails are allowed.'
    )
    .required('Email is required.'),
  profilePic: yup
    .mixed()
    .test(
      'fileFormat',
      'Invalid file format. Please upload JPG or PNG images.',
      (value) => {
        if (value) {
          // Handle base64 image format validation
          if (typeof value === 'string' && value.startsWith('data:image/')) {
            const validFormats = [
              'data:image/jpeg',
              'data:image/png',
              'data:image/jpg',
            ];
            return validFormats.some((format) => value.startsWith(format));
          }
          // If it's not a base64 string, we assume it's a File object (you can add further checks if needed)
          const validFormats = ['image/jpeg', 'image/png', 'image/jpg'];
          return validFormats.includes(value.type);
        }
        return true; // file is not selected
      }
    )
    .test(
      'fileSize',
      'File size exceeds the 2MB limit. Please upload a smaller file.',
      (value) => {
        if (value) {
          // Handle base64 image size calculation
          if (typeof value === 'string') {
            const base64Size =
              (value.length * 3) / 4 - (value.includes('=') ? 1 : 0);
            const maxFileSize = 2 * 1024 * 1024; // 2MB
            return base64Size <= maxFileSize;
          }
          // If it's a File object, use its size
          const maxFileSize = 2 * 1024 * 1024; // 2MB
          return value.size <= maxFileSize;
        }
        return true; // file is not selected
      }
    ),
});

const updateEmailVerificationFormSchema = yup.object().shape({
  new_email: yup
    .string()
    .trim()
    .email('Please provide a valid email address.')
    .matches(
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|live\.com|outlook\.com|hotmail\.com|icloud\.com)$/,
      'Only Gmail, Yahoo, Live, Outlook, Hotmail, and iCloud emails are allowed.'
    )
    .required('Email is required.'),

  verification_code: yup
    .string()
    .trim()
    .required('Verification code is required.'),
});

const updateUsernameFormSchema = yup.object().shape({
  username: yup
    .string()
    .trim()
    .min(6, 'Username must be at least 6 characters long.')
    .max(32, 'Username must be at most 32 characters long.')
    .matches(/^[A-Za-z][A-Za-z0-9]{5,31}$/, 'Username must be alphanumeric.')
    .required('Username is required.'),
});

const changePasswordFormSchema = (hasPassword) =>
  yup.object({
    old_password: yup
      .string()
      .trim()
      .min(6, 'Old password must be at least 6 characters long.')
      .when([], {
        is: () => hasPassword, // Only require if user has a password
        then: (schema) => schema.required('Old password is required.'),
        otherwise: (schema) => schema.notRequired(),
      }),

    new_password: yup
      .string()
      .trim()
      .min(6, 'New password must be at least 6 characters long.')
      .required('New password is required.'),
  });

const addPostCountryFormSchema = yup.object({
  countryId: yup.string().trim().required('Please select a country.'),
});

const addPostCityFormSchema = yup.object({
  cityId: yup.string().trim().required('Please select a city.'),
});

const addPostSubCityFormSchema = yup.object({
  subCityId: yup.string().trim().required('Please select a subcity.'),
});

const addPostCategoryFormSchema = yup.object({
  categoryId: yup.string().trim().required('Please select a category.'),
});

const addPostSubCategoryFormSchema = yup.object({
  subCategoryId: yup.string().trim().required('Please select a subcategory.'),
});

const addPostFormSchema = yup.object({
  title: yup
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters long.')
    .required('Title is required.'),

  location: yup
    .string()
    .trim()
    .min(3, 'Location must be at least 3 characters long.')
    .required('Location is required.'),

  description: yup.string().trim().required('Description is required.'),

  email: yup
    .string()
    .trim()
    .email('Please provide a valid email address.')
    .matches(
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|live\.com|outlook\.com|hotmail\.com|icloud\.com)$/,
      'Only Gmail, Yahoo, Live, Outlook, Hotmail, and iCloud emails are allowed.'
    )
    .required('Email is required.'),

  phone: yup
    .string()
    .trim()
    .min(10, 'Phone number must be at least 10 characters long.'),

  sex: yup.string().trim().required('Please select one from this field.'),

  age: yup.string().trim().required('Please select an age.'),

  sexualOrientation: yup
    .string()
    .trim()
    .required('Please select any orientation.'),

  featured_ad: yup.string().trim().optional(), // Consider if this should be required or optional

  extended_ad: yup.string().trim().optional(), // Consider if this should be required or optional
});

const addPostFinalFormSchema = yup.object({
  googleCaptcha: yup
    .string()
    .trim()
    .required('Captcha verification is required.'),
});

const saveManualRechargePaymentMethodFormYupSchema = yup.object().shape({
  manual_method_id: yup.string().trim().required('Payment method is required.'),
  transaction_id: yup.string().trim().required('Transaction ID is required.'),
  payment_amount: yup
    .number()
    .typeError('Amount must be a valid number') // Rejects non-numeric values
    .required('Amount is required')
    .positive('Amount must be a positive number'), // Allows float & integer values
  screenshot_file: yup
    .string()
    .trim().required('Image is required.'),
});

export {
  addPostCategoryFormSchema, addPostCityFormSchema, addPostCountryFormSchema, addPostFinalFormSchema, addPostFormSchema, addPostSubCategoryFormSchema, addPostSubCityFormSchema, changePasswordFormSchema, changeProfileFormSchema, contactFormSchema, editPostFormSchema, forgotPasswordFormSchema, forgotVerificationFormSchema, loginFormSchema, partnerFormSchema, reportFormSchema, resetPasswordVerificationFormSchema, saveManualRechargePaymentMethodFormYupSchema, signupFormSchema, signupVerificationCodeFormSchema, updateEmailVerificationFormSchema,
  updateUsernameFormSchema
};
