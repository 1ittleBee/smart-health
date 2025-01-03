import React, { useState } from "react";
import Web3 from "web3";
import { useNavigate, useParams } from "react-router-dom";
import PatientRegistry from "../build/contracts/PatientRegistry.json";
import "../CSS/DoctorPermissionPage.css";
import NavBar_Logout from "./NavBar_Logout";

const DoctorPermissionPage = () => {
  const navigate = useNavigate();
  const { address } = useParams();
  const [patientAddress, setPatientAddress] = useState("");
  const [hasPermission, setHasPermission] = useState(false);
  const [doctorAddress, setDoctorAddress] = useState(address);

  const handleCheckPermission = async () => {
    try {
      const web3Instance = new Web3(window.ethereum);
      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = PatientRegistry.networks[networkId];
      const contract = new web3Instance.eth.Contract(
        PatientRegistry.abi,
        deployedNetwork && deployedNetwork.address
      );
      const doctorAddress = address;
      const permission = await contract.methods
        .haspermission(patientAddress, doctorAddress)
        .call({ from: patientAddress });
      setHasPermission(permission);
      if (permission) {
        navigate("/doctor/" + doctorAddress + "/createehr");
      } else {
        alert("You don't have permission to create a health record.");
      }
    } catch (error) {
      console.error("Error checking permission:", error);
      alert("An error occurred while checking permission.");
    }
  };

  const cancelOperation = async () => {
    try {
      navigate("/doctor/" + doctorAddress);
    } catch (error) {
      console.error("Error checking permission:", error);
    }
  };

  return (
    <div>
      <NavBar_Logout></NavBar_Logout>
      <div className="bg-gradient-to-b from-purple-500 to-purple-800 min-h-screen flex flex-col justify-center items-center p-4 font-mono text-white">
        <div className="w-full max-w-6xl bg-gray-900 p-20 rounded-lg shadow-lg">
          <h2 className="text-3xl sm:text-4xl text-yellow-300 font-bold mb-6">
            Doctor Permission Page
          </h2>
          <div className="flex flex-col w-full  mb-4">
            <label className="mb-2 text-yellow-300 font-bold">
              Patient Address:
            </label>
            <input
              type="text"
              value={patientAddress}
              onChange={(e) => setPatientAddress(e.target.value)}
              className="p-2 w-full text-white bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-800 transition duration-200"
            />
          </div>
          <button
            onClick={handleCheckPermission}
            className="px-6 py-3 bg-teal-500 text-white font-bold text-lg rounded-lg cursor-pointer transition-transform transition-colors duration-200 ease-in hover:bg-gray-600 active:bg-gray-700"
          >
            Check Permission
          </button>
          &emsp;
          <button
            onClick={cancelOperation}
            className="px-6 py-3 bg-teal-500 text-white font-bold text-lg rounded-lg cursor-pointer transition-transform transition-colors duration-300 ease-in hover:bg-teal-600 active:bg-teal-700"
          >
            Cancel
          </button>
          {hasPermission ? (
            <p className="mt-4 ">
              You have permission to create a health record. Navigating...
            </p>
          ) : (
            <p className="mt-4 text-yellow-300">
              You don't have permission to create a health record.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorPermissionPage;
