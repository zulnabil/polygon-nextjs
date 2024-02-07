// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract LiveQnA {
    uint private nonce = 0;
    address private owner;
    uint256 private channelIdCounter = 0;
    uint256 private questionIdCounter = 0;


    struct Channel {
        string name;
        uint256 pin;
        address admin;
    }

    // key = channel id, value = channel obj. Example: channels[0] = { pin: 258263, admin: 0x... }
    mapping(uint256 => Channel) private channels;

    struct Question {
        uint256 id;
        string text;
        string author;
        uint256 channelId;
        uint256 votes;
    }

    // key = question id, value = question object
    mapping(uint256 => Question) public questions;

    // key = channel id, value = total number of questions for the channel
    mapping(uint256 => uint256) public totalQuestionsPerChannel;

    // list of question ids sorted by votes for each channel
    mapping(uint256 => uint256[]) public sortedQuestionIdsByVotes;

    modifier isOwner() {
        require(msg.sender == owner, "Only owner can do this");
        _;
    }

    modifier isPinCorrect(uint256 channelId, uint256 pin) {
        require(channels[channelId].pin == pin, "Your pin is incorrect");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function getRandomPin() private returns (uint) {
        nonce++;
        uint randomHash = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce)));
        uint randomPin = randomHash % 900000 + 100000; // Ensure the pin is a 6-digit number
        return randomPin;
    }

    function getChannel(uint256 channelId) public view isOwner returns (Channel memory) {
        return channels[channelId];
    }

    function createChannel(string memory channelName) public returns (uint256, string memory, uint) {
        uint256 id = channelIdCounter;
        uint pin = getRandomPin();
        channels[id] = Channel(channelName, pin, msg.sender);
        channelIdCounter++;

        return(id, channelName, pin);
    }

    function getQuestionsOfChannel(uint256 channelId, uint256 pin) public view isPinCorrect(channelId, pin) returns (Question[] memory) {
        uint256 totalQuestions = totalQuestionsPerChannel[channelId];

        Question[] memory allQuestions = new Question[](totalQuestions);

        for (uint i = 0; i < totalQuestions; i++) {
            allQuestions[i] = questions[sortedQuestionIdsByVotes[channelId][i]];
        }

        return allQuestions;
    }

    function addQuestionToChannel(uint256 channelId, uint256 pin, string memory text, string memory author) public isPinCorrect(channelId, pin) {
        uint256 questionId = questionIdCounter;
        questions[questionIdCounter] = Question(questionId, text, author, channelId, 0);
        questionIdCounter++;
        totalQuestionsPerChannel[channelId]++;
        sortedQuestionIdsByVotes[channelId].push(questionId);
    }

    function voteQuestionOfChannel(uint256 channelId, uint256 pin, uint256 questionId) public isPinCorrect(channelId, pin) {
        questions[questionId].votes++;
        sortQuestionIdsByVotes(channelId);
    }

    // Function to sort the list of question ids based on votes
    function sortQuestionIdsByVotes(uint256 channelId) private {
        uint256[] storage questionIds = sortedQuestionIdsByVotes[channelId];
        uint256 length = questionIds.length;
        for (uint256 i = 0; i < length; i++) {
            for (uint256 j = i + 1; j < length; j++) {
                if (questions[questionIds[i]].votes < questions[questionIds[j]].votes) {
                    uint256 temp = questionIds[i];
                    questionIds[i] = questionIds[j];
                    questionIds[j] = temp;
                }
            }
        }
    }
}