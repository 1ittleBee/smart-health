import React, { useEffect, useState } from "react";
import Web3 from "web3";
import record from "../build/contracts/record2.json"; // Make sure this is the right contract
import { useNavigate, useParams } from "react-router-dom";
import "../CSS/ContractInteraction.css";
import axios from "axios";
import NavBar_Logout from "./NavBar_Logout";

function ContractInteraction() {
  const navigate = useNavigate();
  const { address } = useParams();
  const [records, setRecords] = useState([]);
  const [urlMap, setUrlMap] = useState({}); // This will map cids to URLs

  useEffect(() => {
    async function fetchRecords() {
      if (typeof window.ethereum !== "undefined") {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });

          const networkId = await web3.eth.net.getId();
          const deployedNetwork = record.networks[networkId];

          if (!deployedNetwork) {
            console.error("Contract not deployed to detected network");
            return;
          }

          const contractAddress = deployedNetwork.address;
          const recordContract = new web3.eth.Contract(
            record.abi,
            contractAddress
          );

          // Log the address being used to call getRecords
          console.log("Fetching records for address:", address);

          const fetchedRecords = await recordContract.methods
            .getRecords()
            .call({ from: address });

          // Log the fetched records to debug
          console.log("Fetched records:", fetchedRecords);

          setRecords(fetchedRecords);
        } catch (error) {
          console.error("Error fetching records:", error);
        }
      } else {
        console.error("Please install MetaMask extension.");
      }
    }

    fetchRecords();
  }, [address]);

  const retrieveFromPinata = async (recordCid) => {
    try {
      const response = await axios.get(
        `https://gateway.pinata.cloud/ipfs/${recordCid}`,
        {
          responseType: "blob",
        }
      );

      const fileBlob = response.data;
      const fileURL = URL.createObjectURL(fileBlob);

      setUrlMap((prevMap) => ({ ...prevMap, [recordCid]: fileURL })); // Add the new URL to the map
    } catch (error) {
      console.error("Failed to retrieve file from Pinata:", error);
    }
  };

  const cancelOperation = async () => {
    try {
      navigate("/patient/" + address);
    } catch (error) {
      console.error("Error checking permission:", error);
    }
  };

  return (
    <div>
      <NavBar_Logout></NavBar_Logout>
      <div className="bg-gradient-to-b from-purple-500 to-purple-800 text-white p-10 font-mono">
        <h1 className="text-4xl font-bold text-center text-yellow-300 mb-10">
          Record Viewer
        </h1>
        <ul>
          {records.map((record, index) => (
            <li
              key={index}
              className="flex justify-between items-start border-white border p-5 mb-5 flex-wrap"
            >
              {/* Record data */}
              <div className="flex-none w-1/2 pr-5">
                <strong className="text-xl text-yellow-500">Record Id:</strong>{" "}
                {record.recordId}
                <br />
                <strong className="text-yellow-500">Patient Name:</strong>{" "}
                {record.patientName}
                <br />
                <strong className="text-yellow-500">Doctor Name:</strong>{" "}
                {record.doctorName}
                <br />
                <strong className="text-yellow-500">
                  Doctor Address:
                </strong>{" "}
                {record.doctorAddress}
                <br />
                <strong className="text-yellow-500">
                  Patient Address:
                </strong>{" "}
                {record.patientAddress}
                <br />
                <strong className="text-yellow-500">Age:</strong> {record.age}
                <br />
                <strong className="text-yellow-500">Gender:</strong>{" "}
                {record.gender}
                <br />
                <strong className="text-yellow-500">Diagnosis:</strong>{" "}
                {record.diagnosis
                  ? record.diagnosis
                  : "(No diagnosis recorded)"}
                <br />
                <strong className="text-yellow-500">Prescription:</strong>{" "}
                {record.prescription
                  ? record.prescription
                  : "(No prescription recorded)"}
                <br />
                {/* For debugging */}
                {process.env.NODE_ENV === "development" && (
                  <div className="text-xs mt-2 text-gray-300">
                    Debug - Full record: {JSON.stringify(record, null, 2)}
                  </div>
                )}
              </div>

              {/* PDF Viewer */}
              <div className="flex-none w-1/2">
                <h2 className="text-2xl text-yellow-300 mb-3">
                  Retrieve & View
                </h2>
                <button
                  onClick={() => retrieveFromPinata(record.cid)}
                  className="px-8 py-3 rounded-lg bg-teal-500 hover:bg-gray-600 transition-colors duration-300 transform hover:scale-105"
                >
                  Retrieve from Pinata
                </button>

                {urlMap[record.cid] && (
                  <div className="border-white border mt-5 overflow-hidden">
                    <embed
                      src={urlMap[record.cid]}
                      type="application/pdf"
                      className="w-full h-96"
                    />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
        <center>
          <button
            onClick={cancelOperation}
            className="px-6 py-3 bg-teal-500 text-white font-bold text-lg rounded-lg cursor-pointer transition-transform transition-colors duration-300 ease-in hover:bg-teal-600 active:bg-teal-700"
          >
            Back to Patient Dashboard
          </button>
        </center>
      </div>
    </div>
  );
}

export default ContractInteraction;
