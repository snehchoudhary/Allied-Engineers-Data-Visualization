import React, { useRef, useContext, useEffect } from 'react';
import { assets } from '../assets/assets.js';
import './EmailVerify.css';
import { AppContext } from '../Context/app_context.jsx';
import {useNavigate} from 'react-router-dom'
import axios from 'axios';
import { toast } from 'react-toastify';

const EmailVerify = () => {
  const inputRefs = useRef([]);

  axios.defaults.withCredentials =true;
  const{backendUrl, isLoggedin, userData, getUserData} = useContext(AppContext)

  const navigate = useNavigate()

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

  const onSubmitHandler =async(e) => {
    try{
   e.preventDefault();
   const otpArray = inputRefs.current.map(e => e.value)
   const otp = otpArray.join('')

   const{data} = await axios.post(backendUrl + '/api/auth/verify-account', {otp})
  
   if(data.success){
        getUserData();
    toast.success(data.message)
    toast.success(`Welcome ${userData.name || 'back'}!`);

    navigate('/login')
   }else{
    toast.error(data.message)
   }

    }catch(error){
       toast.error(error.message)
    }
  }

  useEffect(() => {
   isLoggedin && userData.isAccountVerified && navigate('/')
  }, [isLoggedin, userData])

  return (
    <div className="verify-container">
      <img
        onClick={() => navigate('/')}
        src={assets.AE_logo}
        alt="Logo"
        className="logo"
      />

      <form onSubmit={onSubmitHandler} className="verify-form">
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
          Verify Email
        </button>
      </form>
    </div>
  );
};

export default EmailVerify;
