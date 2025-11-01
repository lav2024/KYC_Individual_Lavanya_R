import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import LiquidEther from "./LiquidEther";
import Home from "./Home";
import SignIn from "./SignIn";
import Login from "./Login";
import Home2 from "./Home2";
import Check from "./check";
import "./App.css";

function App() {
  return (
    <div className="App">
      {/* Animated background */}
      <LiquidEther
        colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
        mouseForce={20}
        cursorSize={100}
        isViscous={false}
        viscous={30}
        iterationsViscous={32}
        iterationsPoisson={32}
        resolution={0.5}
        isBounce={false}
        autoDemo={true}
        autoSpeed={0.5}
        autoIntensity={2.2}
        takeoverDuration={0.25}
        autoResumeDelay={3000}
        autoRampDuration={0.6}
      />

      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="logo">🕵️‍♂️ KycVault</div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/signin">Contact</Link>
          <Link to="/login">Info</Link>
        </div>
      </nav>

      {/* Routing */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home2" element={<Home2 />} />
        <Route path="/check" element={<Check />} />
      </Routes>
    </div>
  );
}

export default App;
