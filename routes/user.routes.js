const express = require("express");
const { UserModel } = require("../models/user.models");
const {BlacklistModel} = require("../models/blacklist.model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const userRouter = express.Router();


userRouter.post("/register",async(req,res)=>{
      const { name, email, password, role } = req.body;
    try {
        const isEmail = await UserModel.findOne({email});
        if(isEmail){
            return res.status(400).send({msg:"user alread registered"})
        }
        const hashed = await bcrypt.hash(password,7);
        const user = new UserModel({ name, email, password:hashed, role });
        await user.save();
       res.status(200).send(user);
    } catch (error) {
      res.status(400).send({ msg: "something went wrong"});
    }
})

userRouter.post("/login",async(req,res)=>{
     const { email, password} = req.body;
     try {
         const isUser = await UserModel.findOne({ email });
         if (!isUser) {
           return res.status(400).send({ msg: "not a user,login please" });
         }
            
         const isPassCorrect = bcrypt.compareSync(password,isUser.password,);
          if (!isPassCorrect) {
            return res.status(400).send({ msg: "wrong credential" });
          }
         const accessToken = jwt.sign({userId:isUser._id},"accessToken",{
            expiresIn:"1m"
         })
         const refreshToken = jwt.sign({userId:isUser._id},"refreshToken",{
            expiresIn:"3m"
         })
         res.cookie("accessToken",accessToken,{maxAge:1000*60})
         res.cookie("refreshToken", refreshToken, { maxAge: 1000 * 60 * 3 });
         res.status(200).send({msg:"login succes"})
     
     } catch (error) {
         res
           .status(400)
           .send(error);
     }
})

userRouter.get("/logout",async(req,res)=>{
    try {
         const {accessToken} = req.cookies;
         const {refreshToken} = req.cookies;
         const blacklistAccess = new BlacklistModel({ token: accessToken });
         const blacklistRefresh = new BlacklistModel({ refresh: refreshToken });
         await blacklistAccess.save();
         await blacklistRefresh.save();
         res.clearCookie("accessToken")
         res.clearCookie("refreshToken")
         res.status(200).send({msg:"logout success"})
    } catch (error) {
         res.status(500).send({ msg: error.message });
    }
   
})


userRouter.get("/refresh-token",async(req,res)=>{
    try {
        const accessToken = req.cookies.accessToken||req?.headers?.authorization;
        const isTokenBlaclisted = await BlacklistModel.find({token:accessToken})
        if(isTokenBlaclisted){
            return res.status(400).send({msg:"please login"})
        }

        const isTokenvalid = jwt.verify(accessToken,"accessToken");
        
        if(!isTokenvalid){
            return res.status(400).send({msg:"please login again"})
        }
        const newToken = jwt.sign({ userId: isUser._id },"accessToken",{
            expiresIn:"1m"
        });
          res.cookie("accessToken", newToken, { maxAge: 1000 * 60 });
          res.send({msg:"token generated"})
    } catch (error) {
        res.status(400).send({ msg: error.messagegi });
    }
})


module.exports = {
    userRouter,
}