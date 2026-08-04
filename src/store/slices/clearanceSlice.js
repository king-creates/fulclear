import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchMyClearance = createAsyncThunk(
  'clearance/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/clearance/my');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch clearance');
    }
  }
);

export const submitClearance = createAsyncThunk(
  'clearance/submit',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/clearance/submit', data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Submission failed');
    }
  }
);

export const fetchAllClearances = createAsyncThunk(
  'clearance/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const res = await api.get('/clearance', { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch clearances');
    }
  }
);

const clearanceSlice = createSlice({
  name: 'clearance',
  initialState: {
    current:  null,
    list:     [],
    history:  [],
    loading:  false,
    error:    null,
    total:    0,
  },
  reducers: {
    setClearance:   (state, action) => { state.current = action.payload; },
    clearClearance: (state) => { state.current = null; state.list = []; state.history = []; },
    clearError:     (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyClearance.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchMyClearance.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload.clearance;
        state.history = action.payload.history || [];
      })
      .addCase(fetchMyClearance.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

    builder
      .addCase(submitClearance.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(submitClearance.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload.clearance;
      })
      .addCase(submitClearance.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

    builder
      .addCase(fetchAllClearances.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchAllClearances.fulfilled, (state, action) => {
        state.loading = false;
        state.list    = action.payload.clearances || [];
        state.total   = action.payload.total      || 0;
      })
      .addCase(fetchAllClearances.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { setClearance, clearClearance, clearError } = clearanceSlice.actions;
export default clearanceSlice.reducer;