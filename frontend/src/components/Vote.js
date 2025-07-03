import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useParams } from "react-router-dom";
import VotingABI from "../abi/Voting.json";

const CONTRACT_ADDRESS = "0x4522C745878C946aa9520060D31549367290E814";

function Vote({ account }) {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line
  }, [eventId]);

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
      const startTime = await contract.getEventStartTime(eventId);
      const endTime = await contract.getEventEndTime(eventId);
      setEvent({ name, companies, voteCounts, winnerIndex: Number(winnerIndex), ended, startTime: Number(startTime), endTime: Number(endTime) });
    } catch (err) {
      setMessage(err.message);
    }
  };

  const vote = async () => {
    setLoading(true);
    setMessage("");
    try {
      if (!window.ethereum) throw new Error("MetaMask not found");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, VotingABI.abi, signer);
      await contract.vote(eventId, selected);
      setMessage("Vote cast!");
      fetchEvent();
    } catch (err) {
      setMessage(err.message);
    }
    setLoading(false);
  };

  const formatTime = (ts) => new Date(ts * 1000).toLocaleString();
  const getStatus = () => {
    if (!event) return "";
    if (now < event.startTime) return `Voting starts at ${formatTime(event.startTime)}`;
    if (now > event.endTime || event.ended) return "Voting ended";
    return `Voting ends at ${formatTime(event.endTime)}`;
  };
  const canVote = event && now >= event.startTime && now <= event.endTime && !event.ended;

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-md mb-6">
      <h2 className="text-xl font-semibold mb-2">Vote in Event</h2>
      {event && (
        <div>
          <div className="mb-2 font-semibold">{event.name}</div>
          <div className="mb-2 text-sm text-gray-600">{getStatus()}</div>
          {canVote ? (
            <div>
              {event.companies.map((c, idx) => (
                <div key={idx} className="flex items-center mb-1">
                  <input
                    type="radio"
                    name="company"
                    value={idx}
                    checked={selected === idx}
                    onChange={() => setSelected(idx)}
                  />
                  <span className="ml-2">{c}</span>
                </div>
              ))}
              <button onClick={vote} disabled={selected === null || loading} className="mt-2 bg-green-600 text-white px-4 py-2 rounded">
                {loading ? "Voting..." : "Vote"}
              </button>
            </div>
          ) : (
            <div className="text-red-500">Voting is not open.</div>
          )}
        </div>
      )}
      {message && <div className="mt-2 text-sm text-gray-700">{message}</div>}
    </div>
  );
}

export default Vote; 