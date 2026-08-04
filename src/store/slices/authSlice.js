import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

/* ── Async thunks ── */
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', credentials);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/register', data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/auth/me');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Session expired');
    }
  }
);

/* ── Helpers ── */
const loadFromStorage = () => {
  try {
    const token = localStorage.getItem('token');
    const user  = localStorage.getItem('user');
    return {
      token:           token  || null,
      user:            user   ? JSON.parse(user) : null,
      isAuthenticated: !!token,
    };
  } catch {
    return { token: null, user: null, isAuthenticated: false };
  }
};

const saveToStorage = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user',  JSON.stringify(user));
};

const clearStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/* ── Slice ── */
const { token, user, isAuthenticated } = loadFromStorage();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user,
    token,
    isAuthenticated,
    loading:  false,
    error:    null,
  },
  reducers: {
    logout: (state) => {
      state.user            = null;
      state.token           = null;
      state.isAuthenticated = false;
      state.error           = null;
      clearStorage();
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    clearError: (state) => {
      state.error = null;
    },
    /* Manual login for cases where we set state directly */
    loginSuccess: (state, action) => {
      state.user            = action.payload.user;
      state.token           = action.payload.token;
      state.isAuthenticated = true;
      state.loading         = false;
      state.error           = null;
      saveToStorage(action.payload.token, action.payload.user);
    },
  },
  extraReducers: (builder) => {
    /* Login */
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading         = false;
        state.user            = action.payload.user;
        state.token           = action.payload.token;
        state.isAuthenticated = true;
        saveToStorage(action.payload.token, action.payload.user);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    /* Register */
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    /* Fetch current user */
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading         = false;
        state.user            = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading         = false;
        state.user            = null;
        state.token           = null;
        state.isAuthenticated = false;
        clearStorage();
      });
  },
});

export const { logout, updateUser, clearError, loginSuccess } = authSlice.actions;
export default authSlice.reducer;