import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarCollapsed:  false,
    mobileSidebarOpen: false,
    pageLoading:       false,
  },
  reducers: {
    toggleSidebar:       (state) => { state.sidebarCollapsed  = !state.sidebarCollapsed; },
    toggleMobileSidebar: (state) => { state.mobileSidebarOpen = !state.mobileSidebarOpen; },
    closeMobileSidebar:  (state) => { state.mobileSidebarOpen = false; },
    setPageLoading:      (state, action) => { state.pageLoading = action.payload; },
  },
});

export const {
  toggleSidebar,
  toggleMobileSidebar,
  closeMobileSidebar,
  setPageLoading,
} = uiSlice.actions;

export default uiSlice.reducer;