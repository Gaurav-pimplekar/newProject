import express from "express";
import { User } from "../module/user.module.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router= express.Router();


router.post("/register" , async (req, res)=>{
  const {name, email, password, phone} = req.body;
  try {

    const newPassword = await bcrypt.hash(password, 10);

    const newUser = new User({name, email, password:newPassword, phone});

    await newUser.save();
    
    res.status(201).send("user added successfully");
    
  } catch (error) {
    console.log(error);
  }
})


router.post("/login", async(req, res)=>{
  const {email, password} = req.body;
  try {

    
    let user = await User.findOne({email: email})

    if(!user){
      return res.json({
        message:"wrong username or password",
        login:false
      })
    }

    const compare= await bcrypt.compare(password, user.password);

    if(!compare){
      return res.json({
        message:"wrong username or password",
        login:false
      })
    }

    const token= await jwt.sign({id:user._id}, process.env.SECRET_KEY);

    
    res.json({
      message:"user login successfully",
      login:true,
      user: user,
      token
    })
    
  } catch (error) {
    res.send(error);
  }
});




export default router