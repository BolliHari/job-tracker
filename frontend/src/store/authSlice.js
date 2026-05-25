import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../utils/api'

function getStoredUser() {
    try {
        const saved = localStorage.getItem('user')
        return saved ? JSON.parse(saved) : null
    } catch {
        localStorage.removeItem('user')
        return null
    }
}

function persistUser(updates) {
    const saved = getStoredUser()
    if (!saved) return
    localStorage.setItem('user', JSON.stringify({ ...saved, ...updates }))
}

export const loginUser = createAsyncThunk(
    'auth/login',
    async ({ email, password }, thunkAPI) => {
        try {
            const response = await api.post('/auth/login', { email, password })
            localStorage.setItem('user', JSON.stringify(response.data))
            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || 'Login failed'
            )
        }
    }
)

export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async ({ name }, thunkAPI) => {
        try {
            const response = await api.patch('/users/me', { name })
            persistUser(response.data)
            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || 'Failed to update profile'
            )
        }
    }
)

export const changePassword = createAsyncThunk(
    'auth/changePassword',
    async ({ currentPassword, newPassword }, thunkAPI) => {
        try {
            await api.put('/users/me/password', { currentPassword, newPassword })
            return null
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || 'Failed to change password'
            )
        }
    }
)

export const registerUser = createAsyncThunk(
    'auth/register',
    async ({ name, email, password }, thunkAPI) => {
        try {
            const response = await api.post('/auth/register', { name, email, password })
            localStorage.setItem('user', JSON.stringify(response.data))
            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || 'Registration failed'
            )
        }
    }
)

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: getStoredUser(),
        isLoading: false,
        error: null,
        isUpdatingProfile: false,
        profileError: null,
        profileSuccess: null,
        isChangingPassword: false,
        passwordError: null,
        passwordSuccess: null,
    },
    reducers: {
        logoutUser: (state) => {
            localStorage.removeItem("user");
            state.user = null;
        },
        clearAuthError: (state) => {
            state.error = null;
        },
        clearProfileMessages: (state) => {
            state.profileError = null
            state.profileSuccess = null
        },
        clearPasswordMessages: (state) => {
            state.passwordError = null
            state.passwordSuccess = null
        },
    },
    extraReducers: (builder) => {
        builder
        .addCase(loginUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(loginUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.user = action.payload;
        })
        .addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
        .addCase(registerUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(registerUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.user = action.payload;
        })
        .addCase(registerUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
        .addCase(updateProfile.pending, (state) => {
            state.isUpdatingProfile = true
            state.profileError = null
            state.profileSuccess = null
        })
        .addCase(updateProfile.fulfilled, (state, action) => {
            state.isUpdatingProfile = false
            state.user = { ...state.user, ...action.payload }
            state.profileSuccess = 'Profile updated'
        })
        .addCase(updateProfile.rejected, (state, action) => {
            state.isUpdatingProfile = false
            state.profileError = action.payload
        })
        .addCase(changePassword.pending, (state) => {
            state.isChangingPassword = true
            state.passwordError = null
            state.passwordSuccess = null
        })
        .addCase(changePassword.fulfilled, (state) => {
            state.isChangingPassword = false
            state.passwordSuccess = 'Password updated successfully'
        })
        .addCase(changePassword.rejected, (state, action) => {
            state.isChangingPassword = false
            state.passwordError = action.payload
        })
    }
})

export const { logoutUser, clearAuthError, clearProfileMessages, clearPasswordMessages } = authSlice.actions;
export default authSlice.reducer;