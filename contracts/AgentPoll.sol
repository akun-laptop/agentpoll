// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title AgentPoll — sybil-resistant voting gated on Binance Agent ID
/// @notice One Agent ID, one vote. Agent IDs are non-transferable ERC-721s,
///         one per user, so a poll here cannot be brigaded by bots or bought.
/// @dev No owner, no pausing, no payable functions, no fund handling.
///      The contract holds no funds and has no privileged permissions at all.
interface IAgentID {
    function balanceOf(address owner) external view returns (uint256);
}

contract AgentPoll {
    IAgentID public immutable agentId;

    uint256 public constant MIN_OPTIONS = 2;
    uint256 public constant MAX_OPTIONS = 8;
    uint256 public constant MAX_QUESTION_LEN = 280;
    uint256 public constant MAX_OPTION_LEN = 100;
    uint256 public constant MIN_DURATION = 1 hours;
    uint256 public constant MAX_DURATION = 30 days;

    struct Poll {
        address creator;
        string question;
        string[] options;
        uint256[] votes;
        uint256 deadline;
        uint256 createdAt;
        uint256 totalVotes;
    }

    Poll[] private polls;
    mapping(uint256 => mapping(address => bool)) private voted;

    event PollCreated(uint256 indexed pollId, address indexed creator, string question, uint256 deadline);
    event Voted(uint256 indexed pollId, address indexed voter, uint256 optionIndex);

    error NotAgentIDHolder();
    error PollNotFound();
    error PollClosed();
    error AlreadyVoted();
    error InvalidOption();
    error InvalidQuestion();
    error InvalidOptions();
    error InvalidDuration();

    constructor(address _agentId) {
        agentId = IAgentID(_agentId);
    }

    modifier onlyAgentIDHolder() {
        if (agentId.balanceOf(msg.sender) == 0) revert NotAgentIDHolder();
        _;
    }

    /// @notice Create a poll. Only Agent ID holders.
    function createPoll(
        string calldata question,
        string[] calldata options,
        uint256 durationSeconds
    ) external onlyAgentIDHolder returns (uint256 pollId) {
        bytes memory q = bytes(question);
        if (q.length == 0 || q.length > MAX_QUESTION_LEN) revert InvalidQuestion();
        if (options.length < MIN_OPTIONS || options.length > MAX_OPTIONS) revert InvalidOptions();
        for (uint256 i = 0; i < options.length; i++) {
            bytes memory o = bytes(options[i]);
            if (o.length == 0 || o.length > MAX_OPTION_LEN) revert InvalidOptions();
        }
        if (durationSeconds < MIN_DURATION || durationSeconds > MAX_DURATION) revert InvalidDuration();

        pollId = polls.length;
        uint256[] memory votes = new uint256[](options.length);
        polls.push(
            Poll({
                creator: msg.sender,
                question: question,
                options: options,
                votes: votes,
                deadline: block.timestamp + durationSeconds,
                createdAt: block.timestamp,
                totalVotes: 0
            })
        );
        emit PollCreated(pollId, msg.sender, question, block.timestamp + durationSeconds);
    }

    /// @notice Vote on a poll. One vote per Agent ID holder per poll.
    function vote(uint256 pollId, uint256 optionIndex) external onlyAgentIDHolder {
        if (pollId >= polls.length) revert PollNotFound();
        Poll storage poll = polls[pollId];
        if (block.timestamp >= poll.deadline) revert PollClosed();
        if (optionIndex >= poll.options.length) revert InvalidOption();
        if (voted[pollId][msg.sender]) revert AlreadyVoted();

        voted[pollId][msg.sender] = true;
        poll.votes[optionIndex] += 1;
        poll.totalVotes += 1;
        emit Voted(pollId, msg.sender, optionIndex);
    }

    /// @notice Full poll read: creator, question, options, votes, deadline, createdAt, totalVotes.
    function getPoll(uint256 pollId)
        external
        view
        returns (
            address creator,
            string memory question,
            string[] memory options,
            uint256[] memory votes,
            uint256 deadline,
            uint256 createdAt,
            uint256 totalVotes
        )
    {
        if (pollId >= polls.length) revert PollNotFound();
        Poll storage poll = polls[pollId];
        return (
            poll.creator,
            poll.question,
            poll.options,
            poll.votes,
            poll.deadline,
            poll.createdAt,
            poll.totalVotes
        );
    }

    function getPollCount() external view returns (uint256) {
        return polls.length;
    }

    function hasVoted(uint256 pollId, address voter) external view returns (bool) {
        if (pollId >= polls.length) revert PollNotFound();
        return voted[pollId][voter];
    }
}
