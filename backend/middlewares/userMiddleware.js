const {User}=require('../db/index');
const jwt=require('jsonwebtoken');
const path=require('path');
require("dotenv").config({path: path.resolve(__dirname, '../.env')})
const jwtPassword=process.env.jwtPasswd;
async function userMiddleware(req,res,next){
    const authHeaders=req.headers.authorization;
    let token;
    if(authHeaders && authHeaders.startsWith("Bearer")){
        token=authHeaders.slice(7);
    }else return res.status(401).json({msg:'invalid token or format'});
    try{
        const decoded=jwt.verify(token,jwtPassword);
        const username=decoded.username;
        const res=await User.findOne({username});
        if(res){
            req.headers.username=username;
            next();
        }else return res.status(401).json({msg:'not authorized'});
    }catch(err){
        console.log(err);
        return res.status(401).json({msg:'invalid token'});
    }
}

module.exports=userMiddleware;
