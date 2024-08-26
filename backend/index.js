const express=require('express');
const path=require('path');
require("dotenv").config({path: path.resolve(__dirname, '../.env')})
const PORT=process.env.Port;
const app=express();
const userRouter=require('./routes/userRoutes');
app.use(express.json());
app.use('/user',userRouter);
app.listen(PORT,()=>console.log("server running on "+PORT+"....."));
