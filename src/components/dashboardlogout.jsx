import React from "react";
import promoVideo from "./promovideo.mp4"; // Adjust the path if needed
import google from "./google.png";
import apple from "./apple.png";
import "./styles.css";
import { Link } from "react-router-dom";

const DashboardHome = () => {
  return (
    <div className="container mt-4">
<div className="d-flex justify-content-between align-items-center p-3 bg-dark text-white">
  <h4 className="mb-0">
    <b>Welcome to Business Call TT</b>
  </h4>
  <div>
    <Link to="/login" className="me-2">
      <button type="button" className="btn btn-outline-light btn-lg">
        Login
      </button>
    </Link>
    <Link to="/signup">
      <button type="button" className="btn btn-outline-light btn-lg">
        Signup
      </button>
    </Link>
  </div>
</div>


      {/* Video & About Section */}
      <div className="row align-items-centerrounded shadow p-4">
        <div className="col-md-5 text-center ">
          <video className="w-100" controls autoPlay>
            <source src={promoVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="col-md-6  mx-4 ">
          <h3 className="mb-3">🚀 About Business Call TT</h3>
          <p>
            Discover and post jobs or services effortlessly with search and
            Google Map integration. Receive quotes, connect with professionals,
            and stay ahead with real-time notifications.
          </p>
          <ul className="list-unstyled">
            <li>✅ **Post Jobs & Services** – Quick and easy posting.</li>
            <li>✅ **Manage Listings** – Edit or delete anytime.</li>
            <li>✅ **Unlock More on Mobile** – Messaging, quotes & more.</li>
            <li>✅ **Stay Connected** – Real-time notifications.</li>
          </ul>
        </div>
      </div>

      {/* Sign Up & Login Section */}
      <div className="row dashboard-row mb-5 rounded shadow">
        <div className="col-md-6 dashboard-col-left p-4">
          <h3 className="mb-3">🔓 Unlock More – Sign Up or Log In!</h3>
          <p>Join now to access exclusive features:</p>
          <ul className="list-unstyled">
            <li>✅ **Post & Manage Jobs/Services**</li>
            <li>✅ **Receive Quotes & Applications**</li>
            <li>✅ **Sync with the Mobile App**</li>
          </ul>
          <p>Take full control of your business today!</p>
          <div className="d-flex gap-4 mt-auto">
            <Link to="/" className="sidebar-link">
              <button className="btn btn-danger btn-lg px-4">Login</button>
            </Link>
            <Link to="/signup" className="sidebar-link">
              <button className="btn btn-primary btn-lg px-4">Sign Up</button>
            </Link>
          </div>
        </div>
        <div className="col-md-6 dashboard-col-right text-center rounded shadow  download">
          <h3 className="mb-3">📲 Get the Mobile App</h3>
          <p>Start on the web, continue on mobile for a seamless experience.</p>
          <div className="d-flex justify-content-center gap-3 mt-auto">
            <img src={google} className="img-fluid" alt="Google Play" />
            <img src={apple} className="img-fluid" alt="App Store" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
