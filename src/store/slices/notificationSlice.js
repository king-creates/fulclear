import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/notifications');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark as read');
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.patch('/notifications/read-all');
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items:   [],
    unread:  0,
    loading: false,
    error:   null,
  },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      if (!action.payload.read) state.unread += 1;
    },
    clearNotifications: (state) => {
      state.items  = [];
      state.unread = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending,   (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items   = action.payload.notifications || [];
        state.unread  = state.items.filter(n => !n.read).length;
      })
      .addCase(fetchNotifications.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

    builder
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const n = state.items.find(n => n._id === action.payload);
        if (n && !n.read) { n.read = true; state.unread = Math.max(0, state.unread - 1); }
      });

    builder
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items  = state.items.map(n => ({ ...n, read: true }));
        state.unread = 0;
      });
  },
});

export const { addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;