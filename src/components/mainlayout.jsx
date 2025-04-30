import React from "react";

import "./styles.css";
import Sidebar from "./sidebar";

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="content-area">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
