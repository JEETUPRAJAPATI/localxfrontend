// rootReducer.js

import { combineReducers } from 'redux';
import userReducer from './userSlice';
import homeReducer from './homeSlice';
import categoriesReducer from './categoriesSlice';
import sponsersReducer from './sponsersSlice';
import partnersReducer from './partnersSlice';
import headSeoReducer from './headSeoSlice';
import topSideNavLinksReducer from './topSideNavLinksSlice';
import postsReducer from './postsSlice';
import postReducer from './postSlice';
import authReducer from './authSlice';
import pageReducer from './pageSlice';
import friendsReducer from './friendsSlice';
import partnersByCategoryReducer from './partnersByCategorySlice';

const rootReducer = combineReducers({
  users: userReducer,
  home: homeReducer,
  sponsers: sponsersReducer,
  partners: partnersReducer,
  headSeo: headSeoReducer,
  categories: categoriesReducer,
  topSideNavLinks: topSideNavLinksReducer,
  posts: postsReducer,
  post: postReducer,
  auth: authReducer,
  page: pageReducer,
  friends: friendsReducer,
  partnersByCategory: partnersByCategoryReducer,
});

export default rootReducer;
