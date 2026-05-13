// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title EtherBallot - Blockchain Voting Smart Contract
 * @notice Implements secure, transparent, one-person-one-vote elections
 * @dev Immutable vote storage with transparent counting
 */
contract EtherBallot {
    
    // ═══════════════════════════════════════════
    //  STRUCTS
    // ═══════════════════════════════════════════
    
    struct Candidate {
        uint256 id;
        string name;
        string party;
        string imageHash;   // IPFS hash for candidate image
        uint256 voteCount;
        bool exists;
    }

    struct Election {
        uint256 id;
        string name;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        uint256 candidateCount;
        uint256 totalVotes;
        address createdBy;
    }

    struct VoteRecord {
        address voter;
        uint256 electionId;
        uint256 candidateId;
        uint256 timestamp;
        bytes32 voteHash;
    }

    // ═══════════════════════════════════════════
    //  STATE VARIABLES
    // ═══════════════════════════════════════════

    address public owner;
    uint256 public electionCount;
    
    // Election ID => Election
    mapping(uint256 => Election) public elections;
    
    // Election ID => Candidate ID => Candidate
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates;
    
    // Election ID => Voter Address => hasVoted
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    // Election ID => Aadhaar Hash => hasVoted (prevents duplicate Aadhaar voting)
    mapping(uint256 => mapping(bytes32 => bool)) public aadhaarVoted;
    
    // All vote records for audit
    VoteRecord[] public voteRecords;
    
    // Authorized admins
    mapping(address => bool) public admins;

    // ═══════════════════════════════════════════
    //  EVENTS
    // ═══════════════════════════════════════════

    event ElectionCreated(uint256 indexed electionId, string name, address createdBy);
    event CandidateAdded(uint256 indexed electionId, uint256 candidateId, string name);
    event VoteCast(uint256 indexed electionId, uint256 indexed candidateId, address voter, bytes32 voteHash);
    event ElectionStarted(uint256 indexed electionId);
    event ElectionEnded(uint256 indexed electionId);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);

    // ═══════════════════════════════════════════
    //  MODIFIERS
    // ═══════════════════════════════════════════

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner, "Only admin can perform this action");
        _;
    }

    modifier electionExists(uint256 _electionId) {
        require(_electionId > 0 && _electionId <= electionCount, "Election does not exist");
        _;
    }

    modifier electionActive(uint256 _electionId) {
        require(elections[_electionId].isActive, "Election is not active");
        require(block.timestamp >= elections[_electionId].startTime, "Election has not started");
        require(block.timestamp <= elections[_electionId].endTime, "Election has ended");
        _;
    }

    // ═══════════════════════════════════════════
    //  CONSTRUCTOR
    // ═══════════════════════════════════════════

    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true;
    }

    // ═══════════════════════════════════════════
    //  ADMIN FUNCTIONS
    // ═══════════════════════════════════════════

    function addAdmin(address _admin) external onlyOwner {
        require(_admin != address(0), "Invalid address");
        admins[_admin] = true;
        emit AdminAdded(_admin);
    }

    function removeAdmin(address _admin) external onlyOwner {
        require(_admin != owner, "Cannot remove owner");
        admins[_admin] = false;
        emit AdminRemoved(_admin);
    }

    // ═══════════════════════════════════════════
    //  ELECTION MANAGEMENT
    // ═══════════════════════════════════════════

    function createElection(
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyAdmin returns (uint256) {
        require(_endTime > _startTime, "End time must be after start time");
        require(_startTime > 0, "Invalid start time");

        electionCount++;
        
        elections[electionCount] = Election({
            id: electionCount,
            name: _name,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            isActive: false,
            candidateCount: 0,
            totalVotes: 0,
            createdBy: msg.sender
        });

        emit ElectionCreated(electionCount, _name, msg.sender);
        return electionCount;
    }

    function addCandidate(
        uint256 _electionId,
        string memory _name,
        string memory _party,
        string memory _imageHash
    ) external onlyAdmin electionExists(_electionId) {
        require(!elections[_electionId].isActive, "Cannot add candidates to active election");
        
        elections[_electionId].candidateCount++;
        uint256 candidateId = elections[_electionId].candidateCount;

        candidates[_electionId][candidateId] = Candidate({
            id: candidateId,
            name: _name,
            party: _party,
            imageHash: _imageHash,
            voteCount: 0,
            exists: true
        });

        emit CandidateAdded(_electionId, candidateId, _name);
    }

    function startElection(uint256 _electionId) external onlyAdmin electionExists(_electionId) {
        require(!elections[_electionId].isActive, "Election already active");
        require(elections[_electionId].candidateCount >= 2, "Need at least 2 candidates");
        elections[_electionId].isActive = true;
        emit ElectionStarted(_electionId);
    }

    function endElection(uint256 _electionId) external onlyAdmin electionExists(_electionId) {
        require(elections[_electionId].isActive, "Election not active");
        elections[_electionId].isActive = false;
        emit ElectionEnded(_electionId);
    }

    // ═══════════════════════════════════════════
    //  VOTING
    // ═══════════════════════════════════════════

    function castVote(
        uint256 _electionId,
        uint256 _candidateId,
        bytes32 _aadhaarHash
    ) external electionExists(_electionId) electionActive(_electionId) {
        require(!hasVoted[_electionId][msg.sender], "You have already voted in this election");
        require(!aadhaarVoted[_electionId][_aadhaarHash], "This Aadhaar has already been used to vote");
        require(candidates[_electionId][_candidateId].exists, "Candidate does not exist");

        // Mark as voted
        hasVoted[_electionId][msg.sender] = true;
        aadhaarVoted[_electionId][_aadhaarHash] = true;

        // Increment vote count
        candidates[_electionId][_candidateId].voteCount++;
        elections[_electionId].totalVotes++;

        // Create vote hash for verification
        bytes32 voteHash = keccak256(
            abi.encodePacked(msg.sender, _electionId, _candidateId, block.timestamp)
        );

        // Store vote record
        voteRecords.push(VoteRecord({
            voter: msg.sender,
            electionId: _electionId,
            candidateId: _candidateId,
            timestamp: block.timestamp,
            voteHash: voteHash
        }));

        emit VoteCast(_electionId, _candidateId, msg.sender, voteHash);
    }

    // ═══════════════════════════════════════════
    //  VIEW FUNCTIONS
    // ═══════════════════════════════════════════

    function getElection(uint256 _electionId) external view electionExists(_electionId) 
        returns (Election memory) 
    {
        return elections[_electionId];
    }

    function getCandidate(uint256 _electionId, uint256 _candidateId) external view 
        returns (Candidate memory) 
    {
        require(candidates[_electionId][_candidateId].exists, "Candidate does not exist");
        return candidates[_electionId][_candidateId];
    }

    function getAllCandidates(uint256 _electionId) external view electionExists(_electionId)
        returns (Candidate[] memory)
    {
        uint256 count = elections[_electionId].candidateCount;
        Candidate[] memory allCandidates = new Candidate[](count);
        
        for (uint256 i = 1; i <= count; i++) {
            allCandidates[i - 1] = candidates[_electionId][i];
        }
        
        return allCandidates;
    }

    function getResults(uint256 _electionId) external view electionExists(_electionId)
        returns (string[] memory names, string[] memory parties, uint256[] memory votes)
    {
        uint256 count = elections[_electionId].candidateCount;
        names = new string[](count);
        parties = new string[](count);
        votes = new uint256[](count);

        for (uint256 i = 1; i <= count; i++) {
            names[i - 1] = candidates[_electionId][i].name;
            parties[i - 1] = candidates[_electionId][i].party;
            votes[i - 1] = candidates[_electionId][i].voteCount;
        }
    }

    function getWinner(uint256 _electionId) external view electionExists(_electionId)
        returns (string memory winnerName, string memory winnerParty, uint256 winnerVotes)
    {
        require(!elections[_electionId].isActive, "Election still active");
        
        uint256 count = elections[_electionId].candidateCount;
        uint256 maxVotes = 0;
        uint256 winnerId = 1;

        for (uint256 i = 1; i <= count; i++) {
            if (candidates[_electionId][i].voteCount > maxVotes) {
                maxVotes = candidates[_electionId][i].voteCount;
                winnerId = i;
            }
        }

        winnerName = candidates[_electionId][winnerId].name;
        winnerParty = candidates[_electionId][winnerId].party;
        winnerVotes = candidates[_electionId][winnerId].voteCount;
    }

    function getTotalVotes(uint256 _electionId) external view electionExists(_electionId)
        returns (uint256)
    {
        return elections[_electionId].totalVotes;
    }

    function hasVoterVoted(uint256 _electionId, address _voter) external view returns (bool) {
        return hasVoted[_electionId][_voter];
    }

    function getVoteRecordCount() external view returns (uint256) {
        return voteRecords.length;
    }

    function getVoteRecord(uint256 _index) external view returns (VoteRecord memory) {
        require(_index < voteRecords.length, "Index out of bounds");
        return voteRecords[_index];
    }
}
