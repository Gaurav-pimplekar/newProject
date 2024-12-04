import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Example Async Action (Thunk) to fetch trips by pair ID
export const fetchTripByPairId = createAsyncThunk(
    "trip/fetchTripByPairId",
    async (pairId) => {
        try {
            const response = await axios.get(`http://localhost:8091/trips/pair/${pairId}`);

            console.log(response)
            return response.data;
        } catch (error) {
            console.log(error);
        }
    }
);


export const completeTrip = createAsyncThunk(
    "trip/completeTrip",
    async (tripId, { rejectWithValue }) => {
        try {
            const response = await axios.post(`/api/trips/${tripId}/complete`);
            return response.data.trip;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);


// Async thunk to send OTP
export const sendOtp = createAsyncThunk('otp/sendOtp', async () => {
    const response = await axios.post('http://localhost:8091/send-otp', { email: "gpimplekar@gmail.com" });
    return response.data; // Assuming your API returns the OTP details
});

// Async thunk to verify OTP
export const verifyOtp = createAsyncThunk('otp/verifyOtp', async ({ email, otp }, { rejectWithValue }) => {
    try {
        // Log the email and OTP to verify they are being sent correctly
        console.log('Verifying OTP for:', { email, otp });

        const response = await axios.post('http://localhost:8091/verify-otp', { email, otp });
        return response.data; // Assuming your API returns verification result
    } catch (error) {
        console.error('Error verifying OTP:', error.response ? error.response.data : error.message);
        return error.response ? error.response.data : error.message
    }
});



export const fetchUserDetails = createAsyncThunk(
    'driver/fetchdriverDetails',
    async ({ mobileNumber }) => {
        try {
            const response = await axios.get(`http://localhost:8091/driverByNumber/${mobileNumber}`);

            console.log(response);
            if (response.data.login == true) {
                localStorage.setItem("number", mobileNumber);
            }
            console.log(response.data.token);

            localStorage.setItem("token", response.data.token);
            return response.data; // Assuming the API returns driver details in JSON format
        } catch (error) {
            console.log(error);
        }
    }

);


export const loginDriver = createAsyncThunk(
    "logindriver", async () => {
        try {
            const res = await axios.get("http://localhost:8091/login/driver", {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            })
            console.log(res);
            return res.data;
        } catch (error) {
            console.log(error);
        }
    }
)



const tripSlice = createSlice({
    name: "trip",
    initialState: {
        tripData: null,
        status: "idle",
        error: null,
    },
    reducers: {
        resetTrip: (state) => {
            state.tripData = null;
            state.status = "idle";
            state.error = null;
        },
        resetLogin: (state) => {
            state.login = null
        },
        resetOtp: (state) => {
            state.otpVerified = null
            state.message = null
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchTripByPairId.fulfilled, (state, action) => {
            state.status = "succeeded";
            state.tripData = action.payload.trip;
        })
            .addCase(completeTrip.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.complete_trips = action.payload;  // Updated trip data after completion
            })
            .addCase(sendOtp.fulfilled, (state) => {
                state.loading = false;
                state.otpSent = true;
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.otpVerified = action.payload.otpVerified;
                state.message = action.payload.message
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.otpVerified = action.payload.otpVerified;
                state.message = action.payload.message
            })
            .addCase(fetchUserDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.userDetails = action.payload;
                state.login = action.payload.login;
                state.pair = action.payload.pair
                state.tripData = action.payload.trip
            })
            .addCase(loginDriver.fulfilled, (state, action)=>{
                console.log(action.payload.pair);
                state.pair = action.payload.pair;
            })
    },
});

export const { resetTrip, resetLogin, resetOtp } = tripSlice.actions;

export default tripSlice.reducer;
