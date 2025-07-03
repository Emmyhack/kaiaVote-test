import React, { useState } from "react";
import { ethers } from "ethers";
import VotingABI from "../abi/Voting.json";

const CONTRACT_ADDRESS = "0x4522C745878C946aa9520060D31549367290E814";

function Results() {
  const [eventId, setEventId] = useState("");
  const [event, setEvent] = useState(null);
  const [message, setMessage] = useState("");

  const fetchEvent = async () => {
    setMessage("");
    try {
      if (!window.ethereum) throw new Error("MetaMask not found");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, VotingABI.abi, provider);
      const name = await contract.getEventName(eventId);
      const companies = [];
      let idx = 0;
      while (true) {
        try {
          const cname = await contract.getCompanyName(eventId, idx);
          companies.push(cname);
          idx++;
        } catch {
          break;
        }
      }
      const voteCounts = await Promise.all(companies.map((_, i) => contract.getVoteCount(eventId, i)));
      const winnerIndex = await contract.getWinnerIndex(eventId);
      const ended = await contract.getEventEnded(eventId);
      setEvent({ name, companies, voteCounts, winnerIndex: Number(winnerIndex), ended });
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-md mb-6">
      <h2 className="text-xl font-semibold mb-2">View Results</h2>
      <div className="flex mb-2">
        <input
          className="border p-2 flex-1"
          placeholder="Event ID"
          value={eventId}
          onChange={e => setEventId(e.target.value)}
        />
        <button onClick={fetchEvent} className="ml-2 bg-blue-600 text-white px-3 py-1 rounded">Fetch</button>
      </div>
      {event && (
        <div>
          <div className="mb-2 font-semibold">{event.name}</div>
          <ul className="mb-2">
            {event.companies.map((c, idx) => (
              <li key={idx} className={idx === event.winnerIndex ? "font-bold text-green-700" : ""}>
                {c}: {event.voteCounts[idx].toString()} votes {idx === event.winnerIndex && <span>(Winner)</span>}
              </li>
            ))}
          </ul>
          {event.ended ? <div className="text-green-600">Voting ended</div> : <div className="text-yellow-600">Voting ongoing</div>}
        </div>
      )}
      {message && <div className="mt-2 text-sm text-gray-700">{message}</div>}
    </div>
  );
}

export default Results; 