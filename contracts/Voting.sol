// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    constructor() Ownable(msg.sender) {}

    struct Event {
        string name;
        string[] companies;
        mapping(uint256 => uint256) votes; // companyIndex => vote count
        mapping(address => bool) hasVoted;
        uint256 winnerIndex;
        bool exists;
        bool ended;
        uint256 startTime;
        uint256 endTime;
    }

    uint256 public eventCount;
    mapping(uint256 => Event) private events;

    event VotingEventCreated(uint256 indexed eventId, string name, string[] companies);
    event Voted(uint256 indexed eventId, address indexed voter, uint256 companyIndex);

    modifier eventExists(uint256 eventId) {
        require(events[eventId].exists, "Event does not exist");
        _;
    }

    function createVotingEvent(string memory name, string[] memory companyNames, uint256 startTime, uint256 endTime) external onlyOwner {
        require(companyNames.length > 1, "At least 2 companies required");
        require(endTime > startTime, "End time must be after start time");
        Event storage newEvent = events[eventCount];
        newEvent.name = name;
        newEvent.exists = true;
        newEvent.ended = false;
        newEvent.startTime = startTime;
        newEvent.endTime = endTime;
        for (uint256 i = 0; i < companyNames.length; i++) {
            newEvent.companies.push(companyNames[i]);
        }
        emit VotingEventCreated(eventCount, name, companyNames);
        eventCount++;
    }

    function vote(uint256 eventId, uint256 companyIndex) external eventExists(eventId) {
        Event storage vEvent = events[eventId];
        require(!vEvent.ended, "Voting ended");
        require(block.timestamp >= vEvent.startTime, "Voting not started");
        require(block.timestamp <= vEvent.endTime, "Voting ended");
        require(!vEvent.hasVoted[msg.sender], "Already voted");
        require(companyIndex < vEvent.companies.length, "Invalid company");
        vEvent.votes[companyIndex]++;
        vEvent.hasVoted[msg.sender] = true;
        // Update winner
        if (vEvent.votes[companyIndex] > vEvent.votes[vEvent.winnerIndex]) {
            vEvent.winnerIndex = companyIndex;
        }
        emit Voted(eventId, msg.sender, companyIndex);
    }

    function getEvent(uint256 eventId) external view eventExists(eventId) returns (
        string memory name,
        string[] memory companies,
        uint256[] memory voteCounts,
        uint256 winnerIndex,
        bool ended
    ) {
        Event storage vEvent = events[eventId];
        name = vEvent.name;
        companies = vEvent.companies;
        voteCounts = new uint256[](companies.length);
        for (uint256 i = 0; i < companies.length; i++) {
            voteCounts[i] = vEvent.votes[i];
        }
        winnerIndex = vEvent.winnerIndex;
        ended = vEvent.ended;
    }

    function endVoting(uint256 eventId) external onlyOwner eventExists(eventId) {
        events[eventId].ended = true;
    }

    function hasVoted(uint256 eventId, address user) external view eventExists(eventId) returns (bool) {
        return events[eventId].hasVoted[user];
    }

    function getEventName(uint256 eventId) external view eventExists(eventId) returns (string memory) {
        return events[eventId].name;
    }

    function getCompanyName(uint256 eventId, uint256 companyIndex) external view eventExists(eventId) returns (string memory) {
        return events[eventId].companies[companyIndex];
    }

    function getVoteCount(uint256 eventId, uint256 companyIndex) external view eventExists(eventId) returns (uint256) {
        return events[eventId].votes[companyIndex];
    }

    function getWinnerIndex(uint256 eventId) external view eventExists(eventId) returns (uint256) {
        return events[eventId].winnerIndex;
    }

    function getEventEnded(uint256 eventId) external view eventExists(eventId) returns (bool) {
        return events[eventId].ended;
    }

    function getEventStartTime(uint256 eventId) external view eventExists(eventId) returns (uint256) {
        return events[eventId].startTime;
    }

    function getEventEndTime(uint256 eventId) external view eventExists(eventId) returns (uint256) {
        return events[eventId].endTime;
    }
} 