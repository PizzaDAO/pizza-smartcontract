import '../random/RandomConsumerV2.sol';

contract FakeRandomV2 is RandomConsumerV2 {
    bytes32 public testHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
    uint256 public testID = 7777;

    constructor(
        address vrfCoordinator,
        bytes32 keyHash,
        address callbackContract
    ) public RandomConsumerV2(vrfCoordinator, keyHash, callbackContract, 88) {}

    // Mock Overrides

    function requestRandomWords() public override returns (uint256 requestId) {
        // test does not need the   other checks
        require(_callbackContract != address(0), 'Callback must be set');
        requestId = testID;
    }

    // Testing functtion

    function fulfillRandomWordsWrapper(uint256 requestId, uint256[] memory randomness) public {
        super.fulfillRandomWords(requestId, randomness);
    }
}
