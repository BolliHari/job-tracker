import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../utils/api'

export const DEFAULT_TARGETS = {
  targetRole: '',
  targetDate: '',
  salary: '',
  applicationTarget: 20,
}

export const fetchTargets = createAsyncThunk(
  'targets/fetch',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/targets')
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to load targets'
      )
    }
  }
)

export const updateTargets = createAsyncThunk(
  'targets/update',
  async (targets, thunkAPI) => {
    try {
      const response = await api.put('/targets', targets)
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to save targets'
      )
    }
  }
)

const targetsSlice = createSlice({
  name: 'targets',
  initialState: {
    targets: { ...DEFAULT_TARGETS },
    isLoading: false,
    isSaving: false,
    error: null,
  },
  reducers: {
    clearTargetsError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTargets.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTargets.fulfilled, (state, action) => {
        state.isLoading = false
        state.targets = { ...DEFAULT_TARGETS, ...action.payload }
      })
      .addCase(fetchTargets.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(updateTargets.pending, (state) => {
        state.isSaving = true
        state.error = null
      })
      .addCase(updateTargets.fulfilled, (state, action) => {
        state.isSaving = false
        state.targets = { ...DEFAULT_TARGETS, ...action.payload }
      })
      .addCase(updateTargets.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload
      })
  },
})

export const { clearTargetsError } = targetsSlice.actions
export default targetsSlice.reducer
