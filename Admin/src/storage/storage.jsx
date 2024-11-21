import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "./adminStorage"


const storage = configureStore(
    {
        reducer:{
            admin: adminReducer
        }
    }
)

export default storage