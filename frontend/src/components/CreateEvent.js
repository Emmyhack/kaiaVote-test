import React, { useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import VotingABI from "../abi/Voting.json";

const CONTRACT_ADDRESS = "0x4522C745878C946aa9520060D31549367290E814";

function CreateEvent({ account }) {
  const [eventName, setEventName] = useState("");
  const [companies, setCompanies] = useState([""]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleCompanyChange = (idx, value) => {
    const arr = [...companies];
    arr[idx] = value;
    setCompanies(arr);
  };

  const addCompany = () => setCompanies([...companies, ""]);
  const removeCompany = (idx) => setCompanies(companies.filter((_, i) => i !== idx));

  const createEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      if (!window.ethereum) throw new Error("MetaMask not found");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, VotingABI.abi, signer);
      const start = Math.floor(new Date(startTime).getTime() / 1000);
      const end = Math.floor(new Date(endTime).getTime() / 1000);
      if (end <= start) throw new Error("End time must be after start time");
      if (companies.filter(c => c).length < 2) throw new Error("At least 2 companies required");
      const tx = await contract.createVotingEvent(eventName, companies.filter(c => c), start, end, { gasLimit: 5000000 });
      const receipt = await tx.wait();
      // Find the VotingEventCreated event
      const eventLog = receipt.logs.find(log => log.fragment && log.fragment.name === "VotingEventCreated");
      const eventId = eventLog ? eventLog.args.eventId.toString() : null;
      setMessage("Event created!");
      if (eventId) {
        navigate(`/vote/${eventId}`);
      }
    } catch (err) {
      console.error("CreateEvent error:", err);
      if (err.message && err.message.includes("OwnableUnauthorizedAccount")) {
        setMessage("Only the contract owner can create events.");
      } else if (err.message && err.message.includes("End time must be after start time")) {
        setMessage("End time must be after start time.");
      } else if (err.message && err.message.includes("At least 2 companies required")) {
        setMessage("At least 2 companies required.");
      } else if (err.reason) {
        setMessage("Contract revert: " + err.reason);
      } else if (err.data && err.data.message) {
        setMessage("Contract error: " + err.data.message);
      } else {
        setMessage("Failed to create event. Please check your input and try again. " + (err.message || ""));
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={createEvent} className="bg-white p-4 rounded shadow w-full max-w-md mb-6">
      <h2 className="text-xl font-semibold mb-2">Create Voting Event</h2>
      <input
        className="border p-2 w-full mb-2"
        placeholder="Event Name"
        value={eventName}
        onChange={e => setEventName(e.target.value)}
        required
      />
      <div className="mb-2">
        {companies.map((company, idx) => (
          <div key={idx} className="flex mb-1">
            <input
              className="border p-2 flex-1"
              placeholder={`Company #${idx + 1}`}
              value={company}
              onChange={e => handleCompanyChange(idx, e.target.value)}
              required
            />
            {companies.length > 2 && (
              <button type="button" onClick={() => removeCompany(idx)} className="ml-2 text-red-500">Remove</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addCompany} className="text-blue-600 mt-1">+ Add Company</button>
      </div>
      <div className="mb-2">
        <label className="block mb-1">Start Time</label>
        <input
          type="datetime-local"
          className="border p-2 w-full"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          required
        />
      </div>
      <div className="mb-2">
        <label className="block mb-1">End Time</label>
        <input
          type="datetime-local"
          className="border p-2 w-full"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">
        {loading ? "Creating..." : "Create Event"}
      </button>
      {message && <div className="mt-2 text-sm text-gray-700">{message}</div>}
    </form>
  );
}

export default CreateEvent; 