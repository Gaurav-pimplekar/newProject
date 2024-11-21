import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getValue } from "@testing-library/user-event/dist/utils";
import axios from "axios";




export const addVehicle = createAsyncThunk("addVehicle", async (vehicle) => {
    const res = await axios.post("http://localhost:8080/addVehicle", vehicle);

    return res.data;
})


export const getVehicles = createAsyncThunk("getVehicles", async (_, { rejectWithValue }) => {
    try {
        const res = await axios.get("http://localhost:8080/getVehicles");
        return res.data;
    }

    catch (error) {
        if (!error.response.data.message) {
            return rejectWithValue({ message: "Vehicles not found" })
        }
        else {
            return rejectWithValue({ message: error.response.data.message })
        }
    }
})




export const addDriver = createAsyncThunk("addDriver", async (driver) => {
    try {
        const res = await axios.post("http://localhost:8080/addDriver", driver);

        console.log(res);
        return res.data;

    } catch (error) {
        console.log(error);
    }
})

export const getDrivers = createAsyncThunk("getDrivers", async (driver, { rejectWithValue }) => {
    try {
        const res = await axios.get("http://localhost:8080/getDrivers");

        console.log(res);
        return res.data;

    } catch (error) {
        if (!error.response.data.message) {
            return rejectWithValue({ message: "Enter employee name" })
        }
        else {
            return rejectWithValue({ message: error.response.data.message })
        }
    }
})


export const search_driver = createAsyncThunk("search_driver", async (name, { rejectWithValue }) => {
    try {
        console.log(name);
        const driver = await axios.get(`http://localhost:8080/searchDriver/${name}`);

        // console.log(driver)
        return driver.data;

    } catch (error) {
        console.log(error)
        if (!error.response.data.message) {
            return rejectWithValue({ message: "Enter employee name" })
        }
        else {
            return rejectWithValue({ message: error.response.data.message })
        }
    }
})

export const search_employee = createAsyncThunk("search_employee", async (name, { rejectWithValue }) => {
    try {
        if (!name.trim()) {
            return rejectWithValue({ message: "Please enter a valid employee name" });
        }

        const driver = await axios.get(`http://localhost:8080/searchEmployee/${name}`);

        console.log(driver)
        return driver.data;

    } catch (error) {
        console.log(error);
        if (!error.response.data.message) {
            return rejectWithValue({ message: "Enter employee name" })
        }
        else {
            return rejectWithValue({ message: error.response.data.message })
        }

    }
})

export const search_vehicle = createAsyncThunk("search_vehicle", async (number, { rejectWithValue }) => {
    try {
        console.log(number);
        const vehicle = await axios.get(`http://localhost:8080/searchVehicle/${number}`);


        return vehicle.data;

    } catch (error) {
        if (!error.response.data.message) {
            return rejectWithValue({ message: "Enter employee name" })
        }
        else {
            return rejectWithValue({ message: error.response.data.message })
        }
    }
})

export const pair_vehicle_and_driver = createAsyncThunk("pair_vehicle_and_driver", async ({ vehicle, driver }) => {
    try {
        console.log(vehicle, driver)
        const pair = await axios.post(`http://localhost:8080/addPair/${vehicle}/${driver}`);

        return pair.data;
    } catch (error) {

    }
})

export const pair_employee_and_driver = createAsyncThunk("pair_employee_and_driver", async ({ employee, driver }) => {
    try {
        console.log(employee, driver)
        const pair = await axios.patch(`http://localhost:8080/pairEmployee/${employee}/${driver}`);

        return pair.data;
    } catch (error) {
        console.log(error);
    }
})

export const get_pair_employee_and_driver = createAsyncThunk("get_pair_employee_and_driver", async (_, { rejectWithValue }) => {
    try {
        const pair = await axios.get(`http://localhost:8080/getPairedEmployee`);
        console.log(pair.data.data);
        return pair.data;
    } catch (error) {
        if (!error.response.data.message) {
            return rejectWithValue({ message: "finding pair driver and employee" })
        }
        else {
            return rejectWithValue({ message: error.response.data.message })
        }
    }
})



export const unpair_vehicle_and_driver = createAsyncThunk("unpair_vehicle_and_driver", async ({ vehicle, driver, pair }) => {
    try {
        console.log(vehicle, driver, pair)
        const unpair = await axios.put(`http://localhost:8080/unpair/${vehicle}/${driver}/${pair}`);

        return unpair.data;
    } catch (error) {

    }
})


export const get_pair_vehicle_and_driver = createAsyncThunk("get_pair_vehicle_and_driver", async (_, { rejectWithValue }) => {
    console.log("function call")
    try {

        console.log("get pair call")
        const pair = await axios.get(`http://localhost:8080/getPairs`);

        console.log(pair)
        return pair.data;

    } catch (error) {
        console.log("error occure");
        if (!error.response.data.message) {
            return rejectWithValue({ message: "Searching for pair vahicle and driver" })
        }
        else {
            return rejectWithValue({ message: error.response.data.message })
        }
    }
})

export const addEmployee = createAsyncThunk("addEmployee", async (employee) => {
    try {
        const res = await axios.post("http://localhost:8080/addEmployee", employee);

        return res.data;
    } catch (error) {
        console.log(error);
    }
})


export const getEmployees = createAsyncThunk("getEmployee", async () => {
    try {
        const res = await axios.get("http://localhost:8080/getEmployees");
        console.log(res);
        return res.data;
    } catch (error) {
        console.log(error);
    }
})

export const getTotalVehicles = createAsyncThunk("getTotalVehicles", async () => {
    try {
        const res = await axios.get("http://localhost:8080/totalVehicles");
        return res.data;
    } catch (error) {
        console.log(error);
    }
})


export const uploadExcelFile = createAsyncThunk(
    'user/uploadExcelFile',
    async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post('http://localhost:8080/excel/employees', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data; // Return the processed data
    }
);


export const unpairEmployee = createAsyncThunk(
    'employees/unpair',
    async (employeeId, { rejectWithValue }) => {
        console.log(employeeId);
        try {
            const response = await axios.patch(`http://localhost:8080/unpairEmployee/${employeeId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            return rejectWithValue(error.response.data);
        }
    }
);

const initialState = {
    message: "",
    uploaded: false,
    vehicles: [],
    drivers: [],
    employees: [],
    search_driver: [],
    search_vehicle: [],
    paired_vehicle: [],
    search_employee: [],
    paired_employees: [],
    totalVehicles: 0
}


const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder.addCase(addVehicle.fulfilled, (state, action) => {
            state.uploaded = true;
        })


        builder.addCase(getVehicles.pending, (state, action) => {
            state.message = "searching for vehicles"
        })
        builder.addCase(getVehicles.fulfilled, (state, action) => {
            state.vehicles = action.payload.data;
        })
        builder.addCase(getVehicles.rejected, (state, action) => {
            state.message = action.payload.message
        })


        builder.addCase(addDriver.fulfilled, (state, payload) => {

        })
        builder.addCase(getDrivers.fulfilled, (state, action) => {
            state.drivers = action.payload.data;
        })
        builder.addCase(addEmployee.fulfilled, (state, action) => {

        })


        builder.addCase(getEmployees.fulfilled, (state, action) => {
            state.employees = action.payload.data
        })

        //search vehicle
        builder.addCase(search_vehicle.pending, (state, action) => {
            state.message = action.payload?.message
        })
        builder.addCase(search_vehicle.fulfilled, (state, action) => {
            state.search_vehicle = action.payload.data
        })
        builder.addCase(search_vehicle.rejected, (state, action) => {
            state.search_vehicle = [];
            state.message = action.payload?.message
        })

        //search employee features
        builder.addCase(search_driver.pending, (state, action) => {
            state.message = action.payload?.message
        })
        builder.addCase(search_driver.fulfilled, (state, action) => {
            state.search_driver = action.payload.data
        })
        builder.addCase(search_driver.rejected, (state, action) => {
            state.search_driver = [];
            state.message = action.payload?.message
        })

        //search employee features
        builder.addCase(search_employee.pending, (state, action) => {
            state.message = action.payload?.message
        })
        builder.addCase(search_employee.fulfilled, (state, action) => {
            state.search_employee = action.payload.data
        })
        builder.addCase(search_employee.rejected, (state, action) => {
            state.search_employee = [];
            state.message = action.payload?.message
        })



        builder.addCase(pair_vehicle_and_driver.fulfilled, (state, action) => {

        })



        builder.addCase(pair_employee_and_driver.fulfilled, (state, action) => {

        })


        builder.addCase(get_pair_vehicle_and_driver.pending, (state, action) => {
            state.message = action.payload?.message;
        })
        builder.addCase(get_pair_vehicle_and_driver.fulfilled, (state, action) => {
            state.paired_vehicle = action.payload?.data;
        })
        builder.addCase(get_pair_vehicle_and_driver.rejected, (state, action) => {
            console.log(action.payload);
            state.message = action.payload?.message;
        })


        builder.addCase(get_pair_employee_and_driver.pending, (state, action) => {
            state.paired_employees = [];
            state.message = action.payload?.message
        })
        builder.addCase(get_pair_employee_and_driver.fulfilled, (state, action) => {

            state.paired_employees = action.payload.data;
        })
        builder.addCase(get_pair_employee_and_driver.rejected, (state, action) => {
            state.paired_employees = [];
            state.message = action.payload?.message
        })


        builder.addCase(unpair_vehicle_and_driver.fulfilled, (state, action) => {

        })
        builder.addCase(getTotalVehicles.fulfilled, (state, action) => {
            state.totalVehicles = action.payload.data.totalVehicles
        })
        builder.addCase(uploadExcelFile.fulfilled, (state, action) => {
            state.uploadStatus = 'succeeded';
            state.uploadData = action.payload.data; // Set the uploaded data
        })


        builder.addCase(unpairEmployee.pending, (state, action) => {
            state.message = action.payload?.message
            // Optionally handle the state to reflect the employee unpairing
        })
        builder.addCase(unpairEmployee.fulfilled, (state, action) => {
            state.loading = false;
            state.successMessage = action.payload.message;
            // Optionally handle the state to reflect the employee unpairing
        })
        builder.addCase(unpairEmployee.rejected, (state, action) => {
            state.message = action?.payload?.message
            // Optionally handle the state to reflect the employee unpairing
        })
    }
})

export default adminSlice.reducer;