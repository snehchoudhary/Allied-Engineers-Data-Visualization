import React from "react";
import './footer.css';

const Footer = () => {
  return (
    <div className="footer">
     
     <div className="logo">
       <img src="picture3.jpg" alt="Allied Engineers" />
     </div>

     <div className="grid">
       
       <div className="footerBox">
        <h2>INDIA</h2> <h3>HEAD OFFICE</h3>
        <p>213 New Delhi House</p> <p>27 Barakhamba Road</p> <p>New Delhi - 110001</p>
       </div>

       <div className="footerBox">
        <h2>INDIA</h2> <h3>BRANCH OFFICE</h3>
        <p>1247 - Sector 37</p> <p>Faridabad - 121003</p> <p>Haryana</p>
       </div>

       <div className="footerBox">
        <h2>CANADA</h2> 
        <p>1690 Hector Road</p><p>Edmonton, AB T6R 3B8</p>
       </div>

       <div className="footerBox">
        <h2>UNITED ARAB EMIRATES</h2> 
        <p>PO Box 52455,</p><p>National Industries Park</p> <p>Jabel Ali, Dubai</p>
       </div>

       <div className="footerBox">
        <h2>KUWAIT</h2>
        <p>Plot 199, Block 6</p><p>Ahmadi Industrial Area, East Ahmadi</p> <p>Ahmadi 61006</p>
       </div>

       <div className="footerBox">
        <h2>KINGDOM OF SAUDI ARABIA</h2>
        <p>10th Street, Dammam Industrial Area-1</p> <p>P.O Box 257, Dammam 31411</p> 
       </div>

       

     </div>


        <div className="footer-contact">
         <p>T: +91-129-4026033 / 34 / 35</p>
         <p>E: <a href="mailto:ae@alliedengineer.com">ae@alliedengineer.com</a></p>
       </div>
    </div>
  )
}
export default Footer;