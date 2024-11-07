import adminSchema from "../model/adminSchema.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import recruiterSchema from "../model/recruiterSchema.js";
import dotenv from 'dotenv';
dotenv.config();

let admin_secret_key = process.env.ADMIN_SECRET_KEY;


export  const adminLoginController = async(req,res)=>{
    try{
        const adminObj = await adminSchema.findOne({email : req.body.email});
        const adminPassword = adminObj.password;
        const status = await bcrypt.compare( req.body.password,adminPassword);

        if(status){
            const expireTime = {expiresIn :'1d'};
            const token = jwt.sign({email:req.body.email},admin_secret_key,expireTime);

            if(!token) {
                res.render("adminLoogin.ejs",{message:"Error while setting up the token while admin Login"});
            }
            res.cookie('admin_jwt_token',token,{maxAge:24*60*60*1000,httpOnly:true});
            res.render("adminHome.ejs",{email: req.body.email});
        }
        else {
            res.render("adminLogin.ejs",{message :"Email or Password is wrong"});
        }
    }catch(error){
        console.log("Error in adminLogin : " ,error);
        res.render("adminLogin.ejs",{message :"Something went wrong"});
 
    } 
}

export const adminLogoutController = async (req,res)=>{
        res.clearCookie('admin_jwt_token');
        res.render("adminLogin.ejs",{message : "Admin Logout Successfully"});
}

export const adminRecruiterListController = async (req,res)=>{
    try {
       const recruiterList = await recruiterSchema.find();
       res.render("adminRecruiterList.ejs",{email : req.payload.email ,recruiterList : recruiterList,message :""});
    } catch (error) {
        console.log("Error at AdminRecruiterListController");
        res.render("adminHome.ejs",{email : req.payload.email});
    }
}

export const adminVerifyRecruiterController = async (req,res)=>{
    try {
        const recruiterEmail = req.query.recruiterEmail;
        const updateStatus = {
            $set : {
                adminVerify : "verified"
            }
        }
        const updateResult = await recruiterSchema.updateOne({email : recruiterEmail},updateStatus);
        console.log("UpdateResult : ",updateResult);
        
        const recruiterList = await recruiterSchema.find();
        res.render("adminRecruiterList.ejs",{email : req.payload.email ,recruiterList : recruiterList,message : recruiterEmail+" Verified Successfully"});

    } catch (error) {
        console.log("Error at AdminVerifyRecruiterController");
        const recruiterList = await recruiterSchema.find();
        res.render("adminRecruiterList.ejs",{email : req.payload.email ,recruiterList : recruiterList,message :"Error while updating Recruiter"});
    }
}
