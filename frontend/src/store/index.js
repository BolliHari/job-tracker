import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import targetsReducer from './targetsSlice'
import jobsReducer from './jobsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    targets: targetsReducer,
    jobs: jobsReducer,
  },
})
