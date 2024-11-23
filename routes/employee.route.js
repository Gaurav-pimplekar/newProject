import express from "express";
import { Employee } from "../module/employee.module.js";
import Pair from "../module/pair.module.js";
import jwt from "jsonwebtoken"
import { verifyToken } from "../utils/jwt.js";
import bcrypt from "bcrypt"

const router = express.Router();

router.post("/addEmployee", async (req, res) => {
  try {
    const { name, phone_number, gender, employeeId, shift_time, pickup_location, drop_location } = req.body;

    // Validation: Check if any required field is missing
    if (!name || !phone_number || !gender || !employeeId || !shift_time || !pickup_location || !drop_location) {
      return res.status(400).json({
        message: "All fields are required",
        status: "error",
        success: false,
        data: null
      });
    }

    // Validation: Check if phone_number or employeeId already exists (if unique constraints are required)
    const existingEmployee = await Employee.findOne({ $or: [{ phone_number }, { employeeId }] });
    if (existingEmployee) {
      return res.status(400).json({
        message: "Phone number or employeeId already exists",
        status: "error",
        success: false,
        data: null
      });
    }

    const newPassword = await bcrypt.hash(employeeId, 10);

    // Create new employee
    const newEmployee = await Employee.create({
      name, phone_number, gender, employeeId, shift_time, pickup_location, drop_location, newPassword
    });

    res.status(201).json({
      message: "Employee created successfully",
      status: "success",
      success: true,
      data: newEmployee
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error creating employee",
      status: "error",
      success: false,
      data: error.message
    });
  }
});


router.get("/getEmployees", async (req, res) => {
  try {
    const employees = await Employee.find({ black_list: false });

    // Check if no employees are found
    if (employees.length === 0) {
      return res.status(404).json({
        message: "No employees found",
        status: "error",
        success: false,
        data: null
      });
    }

    res.status(200).json({
      message: "Employees retrieved successfully",
      status: "success",
      success: true,
      data: employees
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error retrieving employees",
      status: "error",
      success: false,
      data: error.message
    });
  }
});


router.get("/login/employee", verifyToken, async (req, res) => {
  try {

    res.json({
      pair: req.pair,
      employee: req.employee
    })

  } catch (error) {
    console.log(error);
    res.json({
      message: error.message
    })
  }
})

router.delete("/deleteEmployee/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the employee by ID
    const employee = await Employee.findById(id);

    // Check if employee exists
    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
        status: "error",
        success: false,
        data: null
      });
    }

    // Check if employee is on a trip (if applicable)
    if (employee.driver != null) {
      return res.status(400).json({
        message: "Employee is currently on a trip, cannot delete",
        status: "error",
        success: false,
        data: null
      });
    }

    // Delete the employee
    await Employee.findByIdAndDelete(id);

    res.status(200).json({
      message: "Employee deleted successfully",
      status: "success",
      success: true,
      data: null
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error deleting employee",
      status: "error",
      success: false,
      data: error.message
    });
  }
});

router.patch("/updateEmployee", async (req, res) => {
  try {
    const { id, email, name, phone_number, gender, shift_time } = req.body;

    // Ensure the id is provided and valid
    if (!id) {
      return res.status(400).json({
        message: "Employee ID is required",
        status: "error",
        success: false,
        data: null
      });
    }

    // Find and update the employee by ID
    const employee = await Employee.findByIdAndUpdate(id, { email, name, phone_number, gender, shift_time }, { new: true });

    // Check if employee was found
    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
        status: "error",
        success: false,
        data: null
      });
    }

    // Send success response
    res.status(200).json({
      message: "Employee updated successfully",
      status: "success",
      success: true,
      data: employee
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error updating employee",
      status: "error",
      success: false,
      data: error.message
    });
  }
});




router.get("/getDriverWithEmployee/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find pairs where the passengers array contains the employeeId
    const pairs = await Pair.find({ passengers: id })
      .populate('driver')     // Populate driver details
      .populate('vehicle')    // Populate vehicle details
      .populate('passengers'); // Populate passengers (the employee)
      
    // If no pairs are found, return a message
    if (!pairs || pairs.length === 0) {
      return res.status(404).json({
        message: "No trips or drivers found for this employee.",
        status: "error",
        success: false,
        data: null
      });
    }

    // Return the found pairs with driver and vehicle details
    res.status(200).json({
      message: "Driver and trip details retrieved successfully",
      status: "success",
      success: true,
      data: pairs
    });

  } catch (error) {
    console.log('Error finding driver:', error);
    res.status(500).json({
      message: "Error retrieving trip",
      status: "error",
      success: false,
      data: error.message
    });
  }
});





router.get("/employees/:id", async (req, res) => {
  try {
    const employeeId = req.params.id;

    // Check if the employeeId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        message: "Invalid employee ID format",
        status: "error",
        success: false,
        data: null
      });
    }

    // Find the employee by ID
    const employee = await Employee.findById(employeeId);

    // If employee not found
    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
        status: "error",
        success: false,
        data: null
      });
    }

    // Return employee data if found
    res.status(200).json({
      message: "Employee found successfully",
      status: "success",
      success: true,
      data: employee
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({
      message: "Server error",
      status: "error",
      success: false,
      data: error.message
    });
  }
});



//get employee by mobile number for login employee
router.get('/employeesByNumber/:mobile', async (req, res) => {
  const {mobile} = req.params;

  
  try {
    const employee = await Employee.findOne({phone_number: mobile});

    
    if(!employee){
      return res.json({
        login: false
      })
    }

    const token = await jwt.sign({mobile}, process.env.SECRET_KEY);

    const pair = await Pair.findOne({passengers: employee?._id}).populate("vehicle").populate("driver");
    res.json({
      employee,
      pair,
      login: true,
      token
    })
    
  } catch (error) {
    console.log(error);
    res.json({
      login:false
    })
  }
});


// router.post('/loginEmployee', async (req, res) => {
//   const { mobile, name } = req.body;  // Using name as password

//   try {
//     // Find employee by mobile number
//     const employee = await Employee.findOne({ phone_number: mobile });

//     // Check if employee exists
//     if (!employee) {
//       return res.status(404).json({
//         message: "Employee not found",
//         status: "error",
//         success: false,
//         data: null
//       });
//     }

//     // Validate name as password (compare input name with employee name)
//     if (name !== employee.name) {
//       return res.status(401).json({
//         message: "Invalid credentials",
//         status: "error",
//         success: false,
//         data: null
//       });
//     }

//     // Generate JWT token
//     const token = jwt.sign({ mobile }, process.env.SECRET_KEY, { expiresIn: '1h' });

//     // Find the pair if needed (Optional, depending on the use case)
//     const pair = await Pair.findOne({ passengers: employee._id }).populate("vehicle").populate("driver");

//     // Respond with success and employee details
//     res.status(200).json({
//       message: "Login successful",
//       status: "success",
//       success: true,
//       data: {
//         employee,
//         pair,
//         token
//       }
//     });

//   } catch (error) {
//     console.error("Error logging in:", error);
//     res.status(500).json({
//       message: "Server error",
//       status: "error",
//       success: false,
//       data: error.message
//     });
//   }
// });



router.get("/getBlockEmployees", async (req, res)=>{
  try {

    const list = await Employee.find({black_list: true});

    res.status(200).json({
      blockEmployees : list
    })
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error retrieving trip", error: error.message });
  }
})


router.patch("/unblockEmployee/:id", async (req, res)=>{
  try {
    const {id} = req.params;
    const employee = await Employee.findByIdAndUpdate(id, {black_list: false})

    res.status(200).json({
      employee,
      message:"employee unblock successfully"
    })
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error retrieving trip", error: error.message });
  }
})


router.patch("/update/employee/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Check if any required field is empty
    for (const field in data) {
      if (data[field] === '' || data[field] === null || data[field] === undefined) {
        return res.status(400).json({
          message: `Field '${field}' cannot be empty`,
          status: "error",
          success: false,
          data: null
        });
      }
    }

    // Proceed with updating the employee
    const updateEmployee = await Employee.findByIdAndUpdate(id, { ...data }, { new: true });

    if (!updateEmployee) {
      return res.status(404).json({
        message: "Employee not found",
        status: "error",
        success: false,
        data: null
      });
    }

    res.status(200).json({
      message: "Employee updated successfully",
      status: "success",
      success: true,
      data: updateEmployee
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error retrieving employee data",
      status: "error",
      success: false,
      data: error.message
    });
  }
});



router.post("/employee/register", async (req, res) => {
  try {
    const {
      name,
      phone_number,
      gender,
      shift_time,
      pickup_location,
      drop_location,
      longitude,
      latitude,
      password
    } = req.body;

    // Validate required fields
    if (!name || !phone_number || !gender || !shift_time || !pickup_location || !drop_location || !longitude || !latitude || !password) {
      return res.status(400).json({
        message: "All required fields must be provided.",
        status: 400,
        success: false,
        data: null,
      });
    }


    //hash password
    const newPassword = await bcrypt.hash(password, 10);

    // Create a new employee
    const newEmployee = new Employee({
      name,
      email,
      phone_number,
      gender,
      shift_time,
      pickup_location,
      drop_location,
      longitude,
      latitude,
      password: newPassword
    });

    // Save employee to database
    const savedEmployee = await newEmployee.save();

    // Respond with success
    res.status(201).json({
      message: "Employee registered successfully.",
      status: 201,
      success: true,
      data: savedEmployee,
    });
  } catch (error) {
    // Handle duplicate key error for phone_number (unique constraint)
    if (error.code === 11000 && error.keyValue.phone_number) {
      return res.status(400).json({
        message: "Phone number already exists.",
        status: 400,
        success: false,
        data: null,
      });
    }

    // General error response
    res.status(500).json({
      message: "An error occurred while registering the employee.",
      status: 500,
      success: false,
      data: null,
      error: error.message,
    });
  }
});


router.patch("/drop")

export default router;