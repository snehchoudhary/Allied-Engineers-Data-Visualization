import React, { useState, useRef, useContext } from 'react';
import {assets} from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import './ResetPassword.css'
import axios from 'axios'
import { AppContext } from '../Context/app_context';
import { toast } from 'react-toastify';

const ResetPassword = () => {

  

  const inputRefs = useRef([]);
  const [newPassword, setNewPassword] = useState('')
  const[isEmailSent, setIsEmailSent] = useState('')
  const [otp, setOtp] = useState('')
  const [isOtpSubmited, setIsOtpSubmited] = useState(false)
   const navigate = useNavigate()
const [email, setEmail] = useState('')
  
    axios.defaults.withCredentials =true;
    const{backendUrl} = useContext(AppContext)
  
  
    const handleInput = (e, index) => {
      const value = e.target.value;
      if (value.length > 0 && index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    };
  
    const handleKeyDown =(e, index) => {
      if(e.key === 'Backspace' && e.target.value === '' && index>0){
         inputRefs.current[index - 1].focus();
      }
    }
  
    const handlePaste = (e) => {
      const paste = e.clipboardData.getData('text')
      const pasteArray = paste.split('');
      pasteArray.forEach((char, index) => {
       if(inputRefs.current[index]){
        inputRefs.current[index].value = char;
       }
      })
    }

 
const onSubmitEmail = async (e)=> {
e.preventDefault();
try{
  const{data} = await axios.post(backendUrl + '/api/auth/send-reset-otp',{email}) 
  data.success ? toast.success(data.message) : toast.error(data.message)
  data.success && setIsEmailSent(true)
}catch(error){
  toast.error(error.message)
}
}

const onSubmitOTP = async (e) => {
  e.preventDefault();
  const otpArray = inputRefs.current.map(e => e.value)
  setOtp(otpArray.join(''))
  setIsOtpSubmited(true)
}

const onSubmitNewPassword =async(e) => {
  e.preventDefault();
  try{
    const{data} = await axios.post(backendUrl + '/api/auth/reset-password', {email, otp, newPassword})
    data.success ? toast.success(data.message) : toast.error(data.message)
    data.success && navigate('/login')
  }catch(error){
   toast.error(error.message)
  }
}
  return (
    <div className="reset-container">
       
       <img onClick={() => navigate('/')}src={assets.AE_logo} alt="" className="reset-logo"/>

       {/* Enter email id */}

       {!isEmailSent && 
       <form  onSubmit={onSubmitEmail}className="reset-form">
        <h1 className="reset-title">Reset Password</h1>

        <p className="reset-subtitle">Enter your registered email address</p>

        <div className="reset-input-group">
          <img src={assets.mail_icon} alt="" />
          <input type="email" placeholder='Email Id' className="reset-input"
          value={email} onChange={e => setEmail(e.target.value)} required/>
        </div>
      

    <button className="reset-submit-btn">Submit</button>
     </form>
}

     {/* otp input form */}

     {!isOtpSubmited && isEmailSent &&

      <form onSubmit={onSubmitOTP}className="verify-form">
        <h1 className="form-title">Email Verify Otp</h1>
        <p className="form-subtitle">Enter the 6-digit code sent to your email id.</p>

        <div className="otp-container" onPaste={handlePaste}>
          {Array(6).fill(0).map((_, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              required
              className="otp-input"
              ref={(el) => (inputRefs.current[index] = el)}
              onInput={(e) => handleInput(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
        </div>

        <button type="submit" className="verify-btn">
          Submit
        </button>
      </form>
}

      {/* enter new password */}

      {isOtpSubmited && isEmailSent && 

       <form onSubmit={onSubmitNewPassword} className="reset-form">
        <h1 className="reset-title">New Password</h1>

        <p className="reset-subtitle">Enter the new password below</p>

        <div className="reset-input-group">
          <img src={assets.lock_icon} alt="" />
          <input type="password" placeholder='Password' className="reset-input"
          value={newPassword} onChange={e => setNewPassword(e.target.value)} required/>
        </div>
      

    <button className="reset-submit-btn">Submit</button>
     </form>
}
    </div>
  )
}

export default ResetPassword