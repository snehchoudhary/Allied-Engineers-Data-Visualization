import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import './header.css'
import { AppContext } from '../Context/app_context'

const Header = () => {

  const {userData} = useContext(AppContext)
  return (
    <div className="header">
        <img src={assets.AE_logo_2} alt="Profile"
        className="header-img" />


        <h1 className="header-greeting">Hey {userData ? userData.name : '' }   <img className="wave-icon" src={assets.hand_wave} alt="wave" /></h1>

        <h2 className="header-title">EC & IC Data Visualization And Analysis</h2>

        <p className="header-description">  Transform Your CSV Data into <span>Elegant, Interactive Visualizations. </span>
        Upload your file to instantly generate polished, insightful charts—no coding required.</p>

    </div>
  )
}

export default Header