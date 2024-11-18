import express from "express";
import { Driver } from "../module/driver.module.js";
import upload from "../utils/multer.js";
import { Vehicle } from "../module/vehicle.module.js";
import Pair from "../module/pair.module.js";
import Trip from "../module/trip.module.js";
import jwt from "jsonwebtoken"
import { verifyToken } from "../utils/jwt.js";

const router = express.Router();


//to add driver into database
router.post(
  "/addDriver",
  upload.fields([
    { name: "license_back_photo" },
    { name: "license_front_photo" },
    { name: "id_proof_front_photo" },
    { name: "id_proof_back_photo" },
    { name: "pcc_document" },
  ]),
  async (req, res) => {
    try {
      const requiredFields = [
        'name',
        'mobile',
        'data_of_birth',
        'license_id_number',
        'license_expire_date',
        'select_id_proof'
      ];

      // Check if all required fields are in the request body
      const missingFields = requiredFields.filter(field => !req.body[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: "Missing required fields",
          status: "error",
          success: false,
          data: missingFields,
        });
      }

      // Check if required files are uploaded
      // const requiredFiles = [
      //     'license_back_photo', 
      //     'license_front_photo', 
      //     'id_proof_front_photo', 
      //     'id_proof_back_photo', 
      //     'pcc_document'
      // ];

      // const missingFiles = requiredFiles.filter(file => !req.files[file]);
      // if (missingFiles.length > 0) {
      //     return res.status(400).json({
      //         message: "Missing required files",
      //         status: "error",
      //         success: false,
      //         data: missingFiles,
      //     });
      // }

      // Log driver name for debugging
      console.log(`Adding driver: ${req.body.name}`);

      // Driver data from request body
      const driverData = req.body;

      // Save driver data to the database
      const driver = await Driver.create(driverData);

      res.status(201).json({
        message: "Driver added successfully",
        status: "success",
        success: true,
        data: driver,
      });
    } catch (error) {
      console.error("Error adding driver:", error);
      res.status(500).json({
        message: "Error adding driver",
        status: "error",
        success: false,
        data: error.message,
      });
    }
  }
);



//get all driver list
router.get("/getDrivers", async (req, res) => {
  try {
    // Fetch drivers who are not blacklisted
    const drivers = await Driver.find({ black_list: false });

    if (drivers.length === 0) {
      return res.status(200).json({
        message: "No drivers found",
        status: "success",
        success: true,
        data: [],
      });
    }

    res.status(200).json({
      message: "Drivers retrieved successfully",
      status: "success",
      success: true,
      data: drivers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error retrieving drivers",
      status: "error",
      success: false,
      data: error.message,
    });
  }
});




//get driver by mobile number for login driver
router.get('/driverByNumber/:mobile', async (req, res) => {
  const { mobile } = req.params;

  console.log(req.params);
  try {
    const driver = await Driver.findOne({ mobile: mobile });


    if (!driver) {
      return res.json({
        login: false
      })
    }

    const token = await jwt.sign({ mobile }, process.env.SECRET_KEY);

    const pair = await Pair.findOne({ driver: driver?._id }).populate("vehicle").populate("driver");



    console.log(token, pair, driver);
    res.json({
      driver,
      login: true,
      token
    })

  } catch (error) {
    console.log(error);
    res.json({
      login: false
    })
  }
});



// router.post('/login/driver', async (req, res) => {
//   const { mobile, license_id_number } = req.body; // Now accepting mobile number and license_id_number

//   try {
//     // Find driver by mobile number
//     const driver = await Driver.findOne({ mobile });

//     // If driver is not found, return login failure
//     if (!driver) {
//       return res.status(404).json({
//         message: "Driver not found",
//         status: "error",
//         success: false,
//         data: { login: false }
//       });
//     }

//     // Check if the provided license number matches the stored license number
//     if (driver.license_id_number !== license_id_number) {
//       return res.status(401).json({
//         message: "Invalid license number",
//         status: "error",
//         success: false,
//         data: { login: false }
//       });
//     }

//     // Generate JWT token for the driver
//     const token = await jwt.sign({ mobile }, process.env.SECRET_KEY, { expiresIn: '1h' });

//     // Find the paired vehicle (if any)
//     const pair = await Pair.findOne({ driver: driver._id }).populate("vehicle").populate("driver");

//     // Return login success, driver data, and token
//     res.status(200).json({
//       message: "Login successful",
//       status: "success",
//       success: true,
//       data: { driver, login: true, token, pair }
//     });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       message: "Error during login",
//       status: "error",
//       success: false,
//       data: { login: false }
//     });
//   }
// });


//get login driver details;
router.get("/login/driver", verifyToken, async (req, res) => {
  try {

    res.json({
      pair: req.pair
    })

  } catch (error) {
    console.log(error);
    res.json({
      message: error.message
    })
  }
})


//blocklist driver
router.patch("/addDriverToBlockList/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the driver by ID
    const driver = await Driver.findById(id);

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
        status: "error",
        success: false,
        data: null
      });
    }

    // Check if the driver is paired (on a trip)
    if (driver.paired) {
      return res.status(400).json({
        message: "Driver is on a trip and cannot be blocked",
        status: "error",
        success: false,
        data: null
      });
    }

    // Update the driver's black_list status to true
    driver.black_list = true;
    await driver.save();

    res.status(200).json({
      message: "Driver blocked successfully",
      status: "success",
      success: true,
      data: driver
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error blocking driver",
      status: "error",
      success: false,
      data: error.message
    });
  }
});



router.get("/getBlockDrivers", async (req, res) => {
  try {
    // Retrieve the list of blocked drivers
    const list = await Driver.find({ black_list: true });

    // Check if no blocked drivers exist
    if (list.length === 0) {
      return res.status(404).json({
        message: "No blocked drivers found",
        status: "info",
        success: true,
        data: []
      });
    }

    // Return the list of blocked drivers
    res.status(200).json({
      message: "Blocked drivers retrieved successfully",
      status: "success",
      success: true,
      data: list
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error retrieving blocked drivers",
      status: "error",
      success: false,
      data: error.message
    });
  }
});



router.patch("/unblockDriver/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the driver by ID and update the black_list field to false (unblock)
    const driver = await Driver.findByIdAndUpdate(id, { black_list: false }, { new: true });

    // If the driver is not found, return a 404 error
    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
        status: "error",
        success: false,
        data: null
      });
    }

    // Respond with the updated driver data and a success message
    res.status(200).json({
      message: "Driver unblocked successfully",
      status: "success",
      success: true,
      data: driver
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error unblocking driver",
      status: "error",
      success: false,
      data: error.message
    });
  }
});




router.put("/update/driver/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Check if any field in data is empty or undefined
    for (let field in data) {
      if (data[field] === "" || data[field] === undefined || data[field] === null) {
        return res.status(400).json({
          message: `Field ${field} cannot be empty`,
          status: "error",
          success: false,
          data: null
        });
      }
    }

    // Find the driver by ID and update the driver's details
    const updateDriver = await Driver.findByIdAndUpdate(id, { ...data }, { new: true });

    // If the driver is not found, return a 404 error
    if (!updateDriver) {
      return res.status(404).json({
        message: "Driver not found",
        status: "error",
        success: false,
        data: null
      });
    }

    // Return the updated driver data
    res.status(200).json({
      message: "Driver updated successfully",
      status: "success",
      success: true,
      data: updateDriver
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error updating driver",
      status: "error",
      success: false,
      data: error.message
    });
  }
});


//get single driver by there id
router.get("/get/driver/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the driver by ID
    const driver = await Driver.findById(id);

    // If the driver is not found, return a 404 error
    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
        status: "error",
        success: false,
        data: null
      });
    }

    // Return the driver data
    res.status(200).json({
      message: "Driver retrieved successfully",
      status: "success",
      success: true,
      data: driver
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error retrieving driver",
      status: "error",
      success: false,
      data: error.message
    });
  }
});

export default router;