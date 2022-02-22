import React from "react";
import logo from "../images/genelogo.png";
import end from "../images/genelogoend.png";

const Header = () => {
  return (
    <div className="heading">
      <img src={logo} alt="logo" />
      <div />
      <img src={end} alt="tail" />
    </div>
  );
};

export default Header;
