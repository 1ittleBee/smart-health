import React from "react";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-black text-white h-[100px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-4 sm:py-0">
          {/* Title Section */}
          <div className="mt-4 sm:mt-0 sm:ml-10 text-center">
            <span
              className="text-2xl sm:text-3xl lg:text-4xl font-semibold cursor-pointer"
              onClick={() => navigate("/")}
            >
              Smart Health Blockchain System
            </span>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row sm:space-x-4 mt-4 sm:mt-0">
            <button
              className="text-lg px-3 py-1.5 rounded-md font-medium transition-transform duration-300 ease-in-out transform hover:scale-110"
              onClick={() => navigate("/")}
            >
              Home
            </button>
            <button
              className="text-lg px-3 py-1.5 rounded-md font-medium transition-transform duration-300 ease-in-out transform hover:scale-110"
              onClick={() => navigate("/AboutPage")}
            >
              About Us
            </button>
            <button
              className="text-lg px-3 py-1.5 rounded-md font-medium transition-transform duration-300 ease-in-out transform hover:scale-110"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
            <button
              className="text-lg px-3 py-1.5 rounded-md font-medium transition-transform duration-300 ease-in-out transform hover:scale-110"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;