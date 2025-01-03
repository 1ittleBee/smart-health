import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../CSS/PatientDashBoard.css";
import NavBar_Logout from "./NavBar_Logout";

const PatientDashBoard = () => {
  const { address } = useParams(); // Retrieve the address from the URL parameter
  const navigate = useNavigate();
  const viewRecord = () => {
    navigate("/patient/" + address + "/viewrecord");
  };

  const permissionsTab = () => {
    navigate("/patient/" + address + "/permissionstab");
  };
  const writepermission = () => {
    navigate("/patient/" + address + "/writepermission");
  };
  const bookAppointment = () => {
    navigate("/patient/" + address + "/bookappointment");
  };

  return (
    <div>
      <NavBar_Logout />
      <div className="bg-gradient-to-b from-purple-500 to-purple-800 p-4 sm:p-10 font-mono text-white h-screen flex flex-col justify-center items-center">
        <h2 className="text-3xl sm:text-4xl text-yellow-300 font-bold mb-6">
          Patient Dashboard
        </h2>
        <p className="text-xl sm:text-2xl text-yellow-300 mb-24">
          Hello, Patient at address:{" "}
          <span className="font-bold text-yellow-500">{address}</span>
        </p>

        <div className="flex flex-wrap justify-center gap-5 w-full px-4 sm:px-0">
          <button
            onClick={viewRecord}
            className="my-2 px-4 sm:px-8 py-4 sm:py-5 w-full sm:w-1/4 rounded-lg bg-teal-500 hover:bg-gray-600 transition-colors duration-300"
          >
            View Record
          </button>
          <button
            onClick={() => navigate("/patient/" + address + "/viewprofile")}
            className="my-2 px-4 sm:px-8 py-4 sm:py-5 w-full sm:w-1/4 rounded-lg bg-teal-500 hover:bg-gray-600 transition-colors duration-300"
          >
            View Profile
          </button>

          <button
            onClick={permissionsTab}
            className="my-2 px-4 sm:px-8 py-4 sm:py-5 w-full sm:w-1/4 rounded-lg bg-teal-500 hover:bg-gray-600 transition-colors duration-300"
          >
            View Permission
          </button>
          <button
            onClick={writepermission}
            className="my-2 px-4 sm:px-8 py-4 sm:py-5 w-full sm:w-1/4 rounded-lg bg-teal-500 hover:bg-gray-600 transition-colors duration-300"
          >
            Write Permission
          </button>

          {/* <button
            onClick={bookAppointment}
            className="my-2 px-4 sm:px-8 py-4 sm:py-5 w-full sm:w-1/4 rounded-lg bg-teal-500 hover:bg-gray-600 transition-colors duration-300"
          >
            Book Appointment
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default PatientDashBoard;
