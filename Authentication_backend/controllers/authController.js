import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

export const register = async (req, res) => {
    const {name, username, email, password} = req.body;

    if(!name || !username || !email || !password) {
        return res.json({success: false, message: 'Please fill in all fields.'})
    }
    try {
        const existingUser = await userModel.findOne({email})

        if (existingUser){
            return res.json({success: false, message: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10); 

        // Set isAccountVerified false initially
        const user = new userModel ({name, username, email, password: hashedPassword, isAccountVerified: false});
        await user.save();

        // Generate OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours expiry
        await user.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Send OTP email for verification
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Account Verification OTP',
            text: `Your OTP is ${otp}. Verify your account using this OTP.`
        };

        await transporter.sendMail(mailOptions);

        return res.json({success:true, message: 'Registration successful. Please verify your email.'});
    }
    catch (error){
        res.json({success: false, message: error.message })
    }
}

export const login = async (req, res)=> {
    const { email, password} = req.body;

    if(!email || !password){
        return res.json({success: false, message: 'Email and password are required'})
    }
    try{
        const user = await userModel.findOne({email});
        if(!user) {
            return res.json({success: false, message: 'User not found'})
        }

        // Check if account is verified
        if(!user.isAccountVerified){
            return res.json({success: false, message: 'Account not verified. Please verify your email before logging in.'});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.json({success:false, message: 'Invalid Password'})
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({success:true});

    }
    catch (error){
        return res.json({success: false, message: error.message})
    }
}

export const logout = async (req, res) => {

    try{
        res.clearCookie('token',{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })

        return res.json({success: true, message: 'Logged out successfully'})
    }
    catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const sendVerifyOtp = async (req, res) => {
    try{
         const userId = req.userId;

         const user = await userModel.findById(userId);

         if(user.isAccountVerified){
            return res.json({success: false, message: "Account Already Verified"})
         }

         const otp = String(Math.floor (100000 + Math.random() * 900000));

         user.verifyOtp = otp;
         user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000

         await user.save();

         const mailOption = {
             from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP' ,
            text: `Your OTP is ${otp}. Verify your account using this OTP.`
         }
         await transporter.sendMail(mailOption);
         return res.json({success: true, message: "OTP sent successfully"})
    }
    catch (error){
       console.error('Error sending OTP email:', error);
       res.json({success: false, message: error.message})
    }
}

export const verifyEmail= async (req, res) => {
const {otp} = req.body;
const userId = req.userId;

if(!userId || !otp){
    return res.json({success: false, message: "Missing Details"});
}
try{
const user = await userModel.findById(userId);
if(!user){
    return res.json({success: false, message: 'User not found'});
}
if(user.verifyOtp.trim() === '' || user.verifyOtp.trim() !== otp.trim()){
    return res.json({success: false, message: 'Invalid OTP'});
}

if(user.verifyOtpExpireAt < Date.now()){
    return res.json ({success: false, message: 'OTP Expired'});
}
user.isAccountVerified = true;
user.verifyOtp = '';
user.verifyOtpExpireAt = 0;

await user.save();
 return res.json({success: true, message: "Account Verified Successfully"})

} catch(error){
     return res.status(500).json({success: false, message: error.message});
}
}


export const isAuthenticated = async (req, res) => {
   try{
     return res.json({ success: true });
   }
   catch(error){
    res.json({ success : false, message: error.message});
   }
}

//send password reset otp
export const sendResetOtp = async (req, res) => {
    const {email} = req.body;

    if(!email) {
        return res.json({success: false, message: 'Email is required'})
    }
    try{
            
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success: false, message: 'User not found'});
        }
         const otp = String(Math.floor (100000 + Math.random() * 900000));

         user.resetOtp = otp;
         user.resetOtpExpireAt = Date.now() + 15 * 60 * 60 * 1000

         await user.save();

         const mailOption = {
             from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP' ,
            text: `Your OTP for resetting your password is ${otp}. Use this OTP to proceed with resetting your password.`
         };
         await transporter.sendMail(mailOption);

         return res.json({success: true, message: 'OTP sent to your email'});

    }
    catch (error){
       return res.json({success: false, message: error.message});
    }
}

// reset user password
export const resetPassword = async (req, res) => {
  const {email, otp, newPassword } = req.body;

  if(!email || !otp || !newPassword){
    return res.json({success: false, message: 'Email, OTP and new password are required'});
  }

  try{

    const user = await userModel.findOne({email});
    if(!user){
        return res.json({success: false, message: 'User not found'});
    }
    console.log('Stored OTP:', user.resetOtp, 'Provided OTP:', otp);
    if (user.resetOtp === "" || user.resetOtp !== otp){
        return res.json({success: false, message: 'Invalid OTP'});
    }
    if(user.resetOtpExpireAt < Date.now()){
        return res.json({success: false, message: 'OTP has expired'});
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = '';
    user.resetOtpExpireAt = 0;

    await user.save();

    return res.json({success: true, message: 'Password reset successfully'});
  }
  catch(error){
    return res.json({success: false, message: error.message});
  }
}