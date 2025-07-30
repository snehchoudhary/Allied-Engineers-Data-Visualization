import React, {useState, useContext} from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import './Login.css'
import { AppContext } from '../Context/app_context'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Login = () => {

  const navigate = useNavigate()

  const {backendUrl, setIsLoggedin, getUserData} = useContext(AppContext)

  const [state, setState] = useState('Sign Up')

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmitHandler = async (e) => {

    try{
      e.preventDefault();

      axios.defaults.withCredentials = true
       
      if(state === 'Sign Up'){
        const {data} = await axios.post(backendUrl + '/api/auth/register', {name, username, email, password})

          if(data.success){
            toast.success(data.message);
            // Navigate to email verification page after successful registration
            navigate('/email-verify')
          }else{
            toast.error(data.message)
          }
      }else{
         
        const {data} = await axios.post(backendUrl + '/api/auth/login', {username,email, password})

          if(data.success){
            setIsLoggedin(true)
            await getUserData(data.userId)
            window.location.href = import.meta.env.VITE_FRONTEND_URL;

          }else{
            toast.error(data.message)
          }
      }
    }catch(error){
     toast.error(error.message)
    }
   

  }
  return (
    <div className="login-container">
      <img
        onClick={() => navigate("/")}
        src={assets.AE_logo}
        alt=""
        className="login-logo"
      />

      <div className="login-box">
        <h2 className="login-title">
          {state === "Sign Up"
            ? "Create Account"
            : "Login to your account!"}
        </h2>

        <p className="login-subtitle">
          {state === "Sign Up"
            ? "Create Your Own Account"
            : "Login to your account!"}
        </p>

        <form onSubmit={onSubmitHandler}>
          {state === "Sign Up" && (
            <div className="login-input-wrapper">
              <img src={assets.person_icon} alt="" />
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="login-input"
                type="text"
                placeholder="Full Name"
                required
              />
            </div>
          )}

          <div className="login-input-wrapper">
            <img src={assets.person_icon} alt="" />
            <input
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              className="login-input"
              type="text"
              placeholder="Username"
              required
            />
          </div>

          <div className="login-input-wrapper">
            <img src={assets.mail_icon} alt="" />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="login-input"
              type="email"
              placeholder="Email id"
              required
            />
          </div>

          <div className="login-input-wrapper">
            <img src={assets.lock_icon} alt="" />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="login-input"
              type="password"
              placeholder="Password"
              required
            />
          </div>

          <p
            onClick={() => navigate("/reset-password")}
            className="forgot-password"
          >
            Forgot Password?
          </p>

          <button className="login-button">{state}</button>
        </form>

        {state === "Sign Up" ? (
          <p className="toggle-text">
            Already have an account?{""}
            <span
              onClick={() => setState("Login")}
              className="toggle-link"
            >
              Login here
            </span>
          </p>
        ) : (
          <p className="toggle-text">
            Don't have an account?{""}
            <span
              onClick={() => setState("Sign Up")}
              className="toggle-link"
            >
              {" "}
              Sign Up
            </span>
          
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
