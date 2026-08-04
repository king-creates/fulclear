import { configureStore } from '@reduxjs/toolkit';
import authReducer         from './slices/authSlice';
import clearanceReducer    from './slices/clearanceSlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer           from './slices/uiSlice';

const store = configureStore({
  reducer: {
    auth:          authReducer,
    clearance:     clearanceReducer,
    notifications: notificationReducer,
    ui:            uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;