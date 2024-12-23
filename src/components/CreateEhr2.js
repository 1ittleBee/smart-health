import React, { useState, useEffect } from "react";
import record2 from "../build/contracts/record2.json"; // Adjust the path as needed
import Web3 from "web3";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import "../big_css/CreateEHR2.css";
import axios from "axios";
import NavBar_Logout from "./NavBar_Logout";

const CreateEHR2 = () => {
  const navigate = useNavigate();
  const { address } = useParams(); // Retrieve account address from URL
  const [web3Instance, setWeb3Instance] = useState(null);
  const [recId, setRecId] = useState("EHR2" + uuidv4());
  const [formData, setFormData] = useState({
    patientName: "",
    doctorName: "",
    patientAddress: "",
    age: "",
    gender: "",
    bloodgroup: "",
    doctorPrivateKey: "",
  });
  const [file, setFile] = useState(null);
  const [cid, setCid] = useState(null);
  const fileInputRef = React.useRef(null);
  const JWT =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2YWE2MjlkZi1kMWQ4LTQzOWItOWNhOS0yYmI3MzljNTdkYmYiLCJlbWFpbCI6Imhhc2Fua2hhbGVkMjI3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI3OTk2YmMwYzI4ODFhNzMzMzA5YSIsInNjb3BlZEtleVNlY3JldCI6IjRiNGY0MDBiNDEwYjY0MmQ2OGQwMjA4YzVhMjY3MDkyNDQyNDIwYmI5YzdhZWUyNWQwNDVhYTA4NWVlMDQ1MzQiLCJleHAiOjE3NjU4ODMzMTR9.kkVZpCKQs0tP6Rbo9usYmqLavMs1FmLjrD4SXYZdJWI"; // Replace with your Pinata JWT token

  useEffect(() => {
    connectToMetaMask();
  }, []);

  const onFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const connectToMetaMask = async () => {
    try {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.enable(); // Request account access
        setWeb3Instance(web3Instance);
      } else {
        console.error("MetaMask not detected. Please install MetaMask.");
      }
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = record2.networks[networkId];
      if (!deployedNetwork) {
        throw new Error("Contract not deployed to this network");
      }
      if (!file) {
        alert("File not uploaded");
        return;
      }
      if (!formData?.doctorPrivateKey) {
        alert("Doctor private key is missing.");
        return;
      }

      // Pinata file upload
      const newFormData = new FormData();
      newFormData.append("file", file);
      newFormData.append(
        "pinataMetadata",
        JSON.stringify({
          name: "File name",
        })
      );
      newFormData.append(
        "pinataOptions",
        JSON.stringify({
          cidVersion: 0,
        })
      );

      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        newFormData,
        {
          maxBodyLength: "Infinity",
          headers: {
            "Content-Type": `multipart/form-data; boundary=${newFormData._boundary}`,
            Authorization: `Bearer ${JWT}`,
          },
        }
      );

      setCid(res.data.IpfsHash);
      alert("File uploaded successfully with " + res.data.IpfsHash);

      // Create a digital signature for the file hash
      const temp_docSignature = web3Instance.eth.accounts.sign(
        res.data.IpfsHash,
        formData.doctorPrivateKey
      );

      const contract = new web3Instance.eth.Contract(
        record2.abi,
        deployedNetwork.address
      );

      await contract.methods
        .createEHR2(
          recId,
          formData.patientName,
          formData.doctorName,
          address,
          formData.patientAddress,
          parseInt(formData.age),
          formData.gender,
          formData.bloodgroup,
          res.data.IpfsHash
        )
        .send({ from: formData.patientAddress });

      alert("EHR created successfully.");

      // Reset the form fields
      setFormData({
        patientName: "",
        doctorName: "",
        patientAddress: "",
        age: "",
        gender: "",
        bloodgroup: "",
        doctorPrivateKey: "",
      });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setRecId("EHR2" + uuidv4());
      navigate("/diagnostic/" + address);
    } catch (error) {
      console.error("EHR creation failed:", error);
    }
  };

  const cancelOperation = () => {
    navigate("/diagnostic/" + address);
  };

  return (
    <div>
      <NavBar_Logout />
      <div className="createehr min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-purple-500 to-purple-800 font-mono">
        <div className="w-full max-w-2xl">
          <h2 className="text-3xl text-yellow-300 mb-6  font-bold text-center">
            Create Electronic Health Record
          </h2>
          <form
            className="bg-gray-900 p-6 rounded-lg shadow-lg grid grid-cols-1 sm:grid-cols-2 gap-4"
            onSubmit={handleSubmit}
          >
            {/* Record ID */}
            <div className="mb-4">
              <label
                className="block text-yellow-300 font-bold"
                htmlFor="recordId"
              >
                Record Id:
              </label>
              <span className="mt-2 p-2 text-yellow-300 font-bold">
                {recId}
              </span>
            </div>

            {/* Patient Name */}
            <div className="mb-4">
              <label
                className="block font-bold text-yellow-300"
                htmlFor="patientName"
              >
                Patient Name:
              </label>
              <input
                type="text"
                id="patientName"
                name="patientName"
                value={formData?.patientName || ""}
                onChange={handleInputChange}
                className="mt-2 p-2 w-full text-white bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-800 transition duration-200"
              />
            </div>

            {/* Doctor Name */}
            <div className="mb-4">
              <label
                className="block font-bold text-yellow-300"
                htmlFor="doctorName"
              >
                Doctor Name:
              </label>
              <input
                type="text"
                id="doctorName"
                name="doctorName"
                value={formData?.doctorName || ""}
                onChange={handleInputChange}
                className="mt-2 p-2 w-full text-white bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-800 transition duration-200"
              />
            </div>

            {/* Patient Address */}
            <div className="mb-4">
              <label
                className="block font-bold text-yellow-300"
                htmlFor="patientAddress"
              >
                Patient Address:
              </label>
              <input
                type="text"
                id="patientAddress"
                name="patientAddress"
                value={formData?.patientAddress || ""}
                onChange={handleInputChange}
                className="mt-2 p-2 w-full text-white bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-800 transition duration-200"
              />
            </div>

            {/* Age */}
            <div className="mb-4">
              <label className="block font-bold text-yellow-300" htmlFor="age">
                Age:
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData?.age || ""}
                onChange={handleInputChange}
                className="mt-2 p-2 w-full text-white bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-800 transition duration-200"
              />
            </div>

            {/* Gender */}
            <div className="mb-4">
              <label
                className="block font-bold text-yellow-300"
                htmlFor="gender"
              >
                Gender:
              </label>
              <select
                id="gender"
                name="gender"
                value={formData?.gender || ""}
                onChange={handleInputChange}
                className="mt-2 p-2 w-full text-white bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-800 transition duration-200"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Blood Group */}
            <div className="mb-4">
              <label
                className="block font-bold text-yellow-300"
                htmlFor="bloodgroup"
              >
                Blood Group:
              </label>
              <select
                id="bloodgroup"
                name="bloodgroup"
                value={formData?.bloodgroup || ""}
                onChange={handleInputChange}
                className="mt-2 p-2 w-full text-white bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-800 transition duration-200"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            {/* Doctor Private Key */}
            <div className="mb-4">
              <label
                className="block font-bold text-yellow-300"
                htmlFor="doctorPrivateKey"
              >
                Doctor Private Key:
              </label>
              <input
                type="password"
                id="doctorPrivateKey"
                name="doctorPrivateKey"
                value={formData?.doctorPrivateKey || ""}
                onChange={handleInputChange}
                className="mt-2 p-2 w-full text-white bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-800 transition duration-200"
              />
            </div>

            {/* File Upload */}
            <div className="mb-4">
              <label className="block font-bold text-white" htmlFor="file">
                Upload File:
              </label>
              <input
                type="file"
                id="file"
                onChange={onFileChange}
                className="mt-2 p-2 w-full text-white bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-800 transition duration-200"
                ref={fileInputRef}
              />
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="mb-4 col-span-2 text-center">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={cancelOperation}
                className="bg-red-500 text-white px-4 py-2 ml-4 rounded-md hover:bg-red-600 transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEHR2;
