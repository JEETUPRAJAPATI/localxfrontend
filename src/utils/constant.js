const APP_CONFIG = {
  development: {
    API_URI: process.env.NEXT_PUBLIC_API_URI,
  },
  production: {
    API_URI: process.env.NEXT_PUBLIC_API_URI_PROD,
  },
};

const userBaseUrl = '/user-panel';
const ROUTES = {
  // Visitor routes
  home: '/',
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  forgotVerification: '/forgot-verification',
  signupVerification: '/signup-verification',
  categoriesList: '/s/:country/:city/:subCity',
  postList: '/p/:country/:city/:subCity/categories/:category/:subCategory/post-list',
  postDetail: '/:country/:city/:subCity/:category/:subCategory/post-view/:title/:postId.html',
  contactUs: '/contact-us',
  aboutUs: '/about-us',
  blogs: '/blog',
  blogsByCategory: '/blog/category/:category',
  blogDetail: '/blog/:slug',
  terms: '/terms-and-conditions',
  friends: '/friends',
  partners: '/partners',
  addPartner: '/partners/add',
  partnerCategory: '/partners/:category',
  partnerDetail: '/partners/:category/:title',
  siteLinks: '/site-links',
  siteLinkSearch: '/site-links/search',

  // User panel routes
  userDashboardMain: userBaseUrl,
  userDashboard: `${userBaseUrl}/dashboard`,
  userCreatePost: `${userBaseUrl}/post/:actionType`,
  userSavedPostMsg: `${userBaseUrl}/post/save-msg`,
  userPostList: `${userBaseUrl}/post/all`,
  userPostView: `${userBaseUrl}/post/view/:postId`,
  userPostEdit: `${userBaseUrl}/post/edit/:postId`,
  userRechargeBalance: `${userBaseUrl}/recharge-balance`,
  userRechargeBalanceManualPayment: `${userBaseUrl}/recharge-balance/manual-payment`,
  userRechargeBalanceHistories: `${userBaseUrl}/recharge-balance/histories`,
  userChangeProfile: `${userBaseUrl}/change-profile/:username`,
  userViewProfile: `${userBaseUrl}/profile`,
  userDeleteAccount: `${userBaseUrl}/delete-account`,
};
const CREATE_POST_STEPS_USER_PANEL = [
  {
    step: 0,
    actionType: 'select-country',
    route: `${userBaseUrl}/post/select-country`,
  },
  {
    step: 1,
    actionType: 'select-city',
    route: `${userBaseUrl}/post/select-city`,
  },
  {
    step: 2,
    actionType: 'select-subCity',
    route: `${userBaseUrl}/post/select-subCity`,
  },
  {
    step: 3,
    actionType: 'select-category',
    route: `${userBaseUrl}/post/select-category`,
  },
  {
    step: 4,
    actionType: 'select-subCategory',
    route: `${userBaseUrl}/post/select-subCategory`,
  },
  {
    step: 5,
    actionType: 'add-post-info',
    route: `${userBaseUrl}/post/add-post-info`,
  },
  {
    step: 6,
    actionType: 'add-post-images',
    route: `${userBaseUrl}/post/add-post-images`,
  },
  {
    step: 7,
    actionType: 'save-post',
    route: `${userBaseUrl}/post/save-post`,
  }
];
const ROLES = [
  {
    value: 'superadmin',
    label: 'Super Admin',
  },
  {
    value: 'admin',
    label: 'Admin',
  },
  {
    value: 'user',
    label: 'User',
  },
];
const PERMISSIONS_MODULES = {
  USER_MODULE_IDENTIFIER: 'user_module',
  PERMISSIONS_MODULE_IDENTIFIER: 'module_permission',
  PROFILE_MODULE_IDENTIFIER: 'profile_module',
  LOCATION_MODULE_IDENTIFIER: 'location_module',
  CATEGORY_MODULE_IDENTIFIER: 'category_module',
  MULTIPOST_MODULE_IDENTIFIER: 'multipost_module',
  ADS_MODULE_IDENTIFIER: 'ads_module',
  MANUAL_PAYMENT_METHOD_MODULE_IDENTIFIER: 'mpm_module',
  BLOG_CATEGORY_MODULE_IDENTIFIER: 'blog_category_module',
  BLOG_MODULE_IDENTIFIER: 'blog_module',

  PAYMENT_REQUEST_LIST_ACTION: 'payment-request-list',
  PAYMENT_REQUEST_VIEW_ACTION: 'payment-request-view',
  PAYMENT_REQUEST_DELETE_ACTION: 'payment-request-delete',
  LIST_ACTION: 'list',
  VIEW_ACTION: 'view',
  DELETE_ACTION: 'delete',
  ADD_ACTION: 'add',
  EDIT_ACTION: 'edit',
  DEACTIVATE_USER_ACTION: 'deactivate-user',
  ACTIVATE_USER_ACTION: 'activate-user',
  SUSPEND_USER_ACTION: 'suspend-user',
  VERIFY_USER_ACTION: 'verify-user',
  RECHARGE_BALANCE_USER_ACTION: 'recharge-balance-user',
};
const PAGES = [
  {
    value: 'home',
    label: 'Home/Main',
  },
  {
    value: 'categories',
    label: 'Category/SubCategory List',
    params: [
      {
        key: "{{country}}",
        label: "For Country",
        example: "Explore Localxlist in {{country}}",
      },
      {
        key: "{{city}}",
        label: "For City",
        example: "Welcome to Localxlist {{city}}",
      },
      {
        key: "{{subcity}}",
        label: "For Sub City",
        example: "Discover {{subcity}} with Localxlist",
      },
    ],
    options: {
      location_dropdown: true,
      category_dropdown: false,
    }
  },
  {
    value: 'posts',
    label: 'Post List',
    params: [
      {
        key: "{{country}}",
        label: "For Country",
        example: "Explore Localxlist in {{country}}",
      },
      {
        key: "{{city}}",
        label: "For City",
        example: "Welcome to Localxlist {{city}}",
      },
      {
        key: "{{subcity}}",
        label: "For Sub City",
        example: "Discover {{subcity}} with Localxlist",
      },
      {
        key: "{{category}}",
        label: "For Category",
        example: "Best {{category}} website",
      },
      {
        key: "{{subcategory}}",
        label: "For Sub Category",
        example: "Discover {{subcategory}} with Localxlist",
      },
    ],
    options: {
      location_dropdown: true,
      category_dropdown: true,
    }
  },
  {
    value: 'postDetail',
    label: 'Post Detail',
    params: [
      {
        key: "{{country}}",
        label: "For Country",
        example: "Explore Localxlist in {{country}}",
      },
      {
        key: "{{city}}",
        label: "For City",
        example: "Welcome to Localxlist {{city}}",
      },
      {
        key: "{{subcity}}",
        label: "For Sub City",
        example: "Discover {{subcity}} with Localxlist",
      },
      {
        key: "{{category}}",
        label: "For Category",
        example: "Best {{category}} website",
      },
      {
        key: "{{subcategory}}",
        label: "For Sub Category",
        example: "Discover {{subcategory}} with Localxlist",
      },
      {
        key: "{{title}}",
        label: "For Post Title",
        example: "Post Title: {{title}}",
      },
    ],
    options: {
      location_dropdown: true,
      category_dropdown: true,
    }
  },
  {
    value: 'about',
    label: 'About Us',
  },
  {
    value: 'contactUs',
    label: 'Contact Us',
  },
  {
    value: 't&c',
    label: 'Terms & Conditions',
  },
  {
    value: 'blogs',
    label: 'Blog List',
  },
  {
    value: 'partnerCategories',
    label: 'Partner Category List',
  },
  {
    value: 'partners',
    label: 'Partner List',
    params: [
      {
        key: "{{category}}",
        label: "For Partner Category",
        example: "Top partners of {{category}}",
      },
    ]
  },
  {
    value: 'partnerDetail',
    label: 'Partner Detail',
    params: [
      {
        key: "{{category}}",
        label: "For Partner Category",
        example: "Top partners of {{category}}",
      },
      {
        key: "{{partner_name}}",
        label: "For Site Partner Name",
        example: "Top Adult Sites Like {{partner_name}}",
      },
    ]
  },
  {
    value: 'siteLinksSearch',
    label: 'Site Links Search',
    params: [
      {
        key: "{{search-keyword}}",
        label: "For Searched Partner Through Keyword",
        example: "Top partners like {{search-keyword}}",
      },
    ]
  },
  {
    value: 'login',
    label: 'Login',
  },
  {
    value: 'signup',
    label: 'Signup',
  },
  {
    value: 'forgotPassword',
    label: 'Forgot Password',
  },
  {
    value: 'resetPassword',
    label: 'Reset Password',
  },
  {
    value: 'forgotVerification',
    label: 'Forgot Verification',
  },
  {
    value: 'signupVerification',
    label: 'Signup Verification',
  },
  {
    value: 'friends',
    label: 'Friends',
  }
];

module.exports = { APP_CONFIG, CREATE_POST_STEPS_USER_PANEL, ROUTES, ROLES, PERMISSIONS_MODULES, PAGES };
