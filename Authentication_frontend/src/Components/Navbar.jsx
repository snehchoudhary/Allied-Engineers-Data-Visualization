import React, {useContext} from 'react'
import {assets} from '../assets/assets.js'
import './Navbar.css'
import {useNavigate} from 'react-router-dom'
import { AppContext } from '../Context/app_context.jsx'
import{toast} from 'react-toastify'
import axios from 'axios'

const Navbar = () => {

  const navigate = useNavigate()
  const {userData, backendUrl, setUserData, setIsLoggedin} = useContext(AppContext)

  const sendVerificationOtp = async () => {
    try{
    axios.defaults.withCredentials = true;

    const {data} = await axios.post(backendUrl + '/api/auth/send-verify-otp')

    if(data.success){
      navigate('/email-verify')
      toast.success(data.message)
    }
    else{
      toast.error(data.message)
    }
    }catch(error){
   toast.error(error.message)
    }
  }

  const logout = async()=>{
    try{
       axios.defaults.withCredentials = true
       const {data} = await axios.post(backendUrl + '/api/auth/logout');
       if (data.success) {
      setIsLoggedin(false);
      setUserData(false); // ✅ clear user data properly
      navigate('/');
      window.location.reload();

    }
    }catch(error){
      toast.error(error.message)
    }
  }
  return (
    <div className="navbar">
     <img src={assets.AE_logo} alt="" className="navbar-logo" />

     {userData ? 
     <div className="circle-container parent">
      {userData.name[0].toUpperCase()}

      <div className="menu-container">
        
        <ul className="menu">
          {!userData.isAccountVerified && <li onClick= {sendVerificationOtp} className="menu-item">Verify Email</li>}
          
          <li onClick={logout} className="menu-item">Logout</li>
        </ul>


      </div>

     </div>
     :
      <button 
     onClick={() => navigate('/login')}
     className="login-button">
        Login  <img src={assets.arrow_icon} alt="arrow" />
     </button>
    }
    
    </div>
  )
}

export default Navbar