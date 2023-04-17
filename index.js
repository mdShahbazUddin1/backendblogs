const express = require("express");
const { connection } = require("./config/db");
const { userRouter } = require("./routes/user.routes");
const cookiParser= require("cookie-parser");
const { auth } = require("./middleware/authenticated");
const { postRouter } = require("./routes/posts.routes");
const { moderatorRouter } = require("./routes/moderator");


require("dotenv").config()
const app = express();
app.use(express.json());
app.use(cookiParser())



app.use("/user",userRouter)
app.use(auth)
app.use("/admin",moderatorRouter)
app.use("/blogs",postRouter)


app.listen(process.env.PORT,async(req,res)=>{
    try {
        await connection
        console.log("db is connected")
    } catch (error) {
        console.log(error)
    }
    console.log("server is running")
})