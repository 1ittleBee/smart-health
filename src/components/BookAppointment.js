import React, { useState, useEffect } from "react";
import Web3 from "web3";
import DoctorAppointment from "../build/contracts/DoctorAppointment.json"; // Replace with the correct path to your ABI JSON
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function BookAppointment() {
  const [web3Instance, setWeb3Instance] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);

  const [doctorAddress, setDoctorAddress] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientAddress, setPatientAddress] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateOnly, setDateOnly] = useState("");
  const [timeOnly, setTimeOnly] = useState(0);

  useEffect(() => {
    async function initializeWeb3() {
      if (window.ethereum) {
        try {
          if (!accounts.length) {
            const fetchedAccounts = await window.ethereum.request({
              method: "eth_requestAccounts",
            });
            setAccounts(fetchedAccounts);
          }

          const web3 = new Web3(window.ethereum);
          const netId = await web3.eth.net.getId();
          const networkData = DoctorAppointment.networks[netId];

          if (networkData) {
            const bookingContract = new web3.eth.Contract(
              DoctorAppointment.abi,
              networkData.address
            );
            setContract(bookingContract);
            setWeb3Instance(web3);
          } else {
            console.error("Contract not deployed to detected network.");
          }
        } catch (error) {
          if (error.code === 4001) {
            console.error("User denied account access.");
          } else {
            console.error("Error requesting accounts:", error);
          }
        }
      } else {
        console.error(
          "Ethereum browser not detected. Consider installing MetaMask."
        );
      }
    }

    initializeWeb3();
  }, [accounts]);

  useEffect(() => {
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const dd = String(selectedDate.getDate()).padStart(2, "0");
    setDateOnly(`${yyyy}-${mm}-${dd}`);

    const hours = selectedDate.getHours();
    const minutes = selectedDate.getMinutes();
    setTimeOnly(hours * 100 + minutes);
  }, [selectedDate]);

  useEffect(() => {
    async function fetchBookedSlots() {
      if (contract && doctorAddress && dateOnly) {
        const slots = await contract.methods
          .getBookedSlotsForDoctor(doctorAddress, dateOnly)
          .call();
        setBookedSlots(slots);
      }
    }

    fetchBookedSlots();
  }, [contract, doctorAddress, dateOnly]);

  const handleBooking = async () => {
    if (!contract || !accounts.length) return;

    try {
      await contract.methods
        .bookAppointment(
          doctorAddress,
          dateOnly,
          timeOnly,
          patientAddress,
          patientName
        )
        .send({ from: patientAddress });
      alert("Appointment booked successfully!");
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Failed to book appointment.");
    }
  };

  return (
    <div className="bg-gradient-to-b from-purple-500 to-purple-800 p-4 sm:p-10 font-mono text-yellow-300 flex flex-col justify-center items-center">
      <div className="w-full max-w-6xl bg-gray-900 p-24 rounded-lg shadow-lg flex flex-col justify-center items-center">
        <h1 className="text-4xl font-bold mb-8">Book Appointment</h1>

        <div className="w-full sm:w-1/2 flex flex-col space-y-4">
          <label className="text-lg text-yellow-300">
            Patient Name:
            <input
              type="text"
              onChange={(e) => setPatientName(e.target.value)}
              className="p-2 mt-1 w-full rounded-lg bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-800 transition duration-200 placeholder-white focus:outline-none focus:border-teal-500 border-2 border-transparent"
            />
          </label>

          <label className="text-lg text-yellow-300">
            Doctor Address:
            <input
              type="text"
              value={doctorAddress}
              onChange={(e) => setDoctorAddress(e.target.value)}
              className="p-2 mt-1 w-full rounded-lg bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-800 transition duration-200 placeholder-white focus:outline-none focus:border-teal-500 border-2 border-transparent"
            />
          </label>

          <label className="text-lg text-yellow-300">
            Patient Address:
            <input
              type="text"
              value={patientAddress}
              onChange={(e) => setPatientAddress(e.target.value)}
              className="p-2 mt-1 w-full rounded-lg bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-800 transition duration-200 placeholder-white focus:outline-none focus:border-teal-500 border-2 border-transparent"
            />
          </label>

          <label className="text-lg text-yellow-300 mb-2">Date and Time:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            showTimeSelect
            dateFormat="Pp"
            className="p-2 w-full rounded-lg bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-800 transition duration-200 text-white focus:outline-none focus:border-teal-500 border-2 border-transparent"
            calendarClassName="react-datepicker__calendar bg-gray-800 border-teal-500"
            excludeTimes={bookedSlots.map((slot) => {
              const hours = Math.floor(slot / 100);
              const minutes = slot % 100;
              return new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate(),
                hours,
                minutes
              );
            })}
          />

          <button
            onClick={handleBooking}
            className="mt-6 px-10 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookAppointment;
