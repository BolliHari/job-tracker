import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../utils/api'

export const fetchJobs = createAsyncThunk('jobs/fetchAll', async (_, thunkAPI) => {
  try {
    const response = await api.get('/jobs')
    return response.data
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || 'Failed to load jobs'
    )
  }
})

export const fetchJobById = createAsyncThunk('jobs/fetchOne', async (id, thunkAPI) => {
  try {
    const response = await api.get(`/jobs/${id}`)
    return response.data
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || 'Failed to load job'
    )
  }
})

export const createJob = createAsyncThunk('jobs/create', async (jobData, thunkAPI) => {
  try {
    const response = await api.post('/jobs', jobData)
    return response.data
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || 'Failed to create job'
    )
  }
})

export const updateJob = createAsyncThunk(
  'jobs/update',
  async ({ id, updates }, thunkAPI) => {
    try {
      const response = await api.put(`/jobs/${id}`, updates)
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to update job'
      )
    }
  }
)

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: {
    jobs: [],
    currentJob: null,
    isLoading: false,
    isLoadingDetail: false,
    isSaving: false,
    error: null,
    detailError: null,
  },
  reducers: {
    clearJobsError: (state) => {
      state.error = null
    },
    clearJobDetail: (state) => {
      state.currentJob = null
      state.detailError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.isLoading = false
        state.jobs = action.payload
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(fetchJobById.pending, (state) => {
        state.isLoadingDetail = true
        state.detailError = null
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.isLoadingDetail = false
        state.currentJob = action.payload
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.isLoadingDetail = false
        state.detailError = action.payload
      })
      .addCase(createJob.pending, (state) => {
        state.isSaving = true
        state.error = null
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.isSaving = false
        state.jobs = [action.payload, ...state.jobs]
      })
      .addCase(createJob.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload
      })
      .addCase(updateJob.pending, (state) => {
        state.isSaving = true
        state.error = null
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.isSaving = false
        const index = state.jobs.findIndex((j) => j.id === action.payload.id)
        if (index !== -1) state.jobs[index] = action.payload
        if (state.currentJob?.id === action.payload.id) {
          state.currentJob = action.payload
        }
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload
      })
  },
})

export const { clearJobsError, clearJobDetail } = jobsSlice.actions
export default jobsSlice.reducer
