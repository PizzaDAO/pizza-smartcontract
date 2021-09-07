// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol';

import '@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol';

import '../interfaces/IOpenSeaCompatible.sol';
import '../interfaces/IRarePizzas.sol';
import '../interfaces/IRarePizzasAdmin.sol';
import '../interfaces/IRarePizzasBox.sol';
import '../interfaces/IOrderAPIConsumer.sol';

contract RarePizzas is
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    ERC721EnumerableUpgradeable,
    IRarePizzas,
    IRarePizzasAdmin,
    IOrderAPICallback,
    IOpenSeaCompatible
{
    using AddressUpgradeable for address;
    using StringsUpgradeable for uint256;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using SafeMathUpgradeable for uint256;

    event RarePizzasBoxContractUpdated(address previous, address current);
    event OrderAPIClientUpdated(address previous, address current);
    event InternalArtworkAssigned(uint256 tokenId, bytes32 artworkURI);

    bytes constant sha256MultiHash = hex'1220';
    bytes constant ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

    // V1 Variables (do not modify this section when upgrading)

    string public constant _uriBase = 'ipfs://';
    string private _contractURI;

    // Other contracts this contract interacts with
    IOrderAPIConsumer internal _orderAPIClient;
    IRarePizzasBox internal _rarePizzasBoxContract;

    // A collection of Box Token Id's that have been redeemed
    mapping(uint256 => address) internal _redeemedBoxTokenAddress;

    // A collection of all of the pizza artwork IPFS hashes
    mapping(uint256 => bytes32) internal _tokenPizzaArtworkURIs;

    // A collection of render jobs associated with the requestor
    mapping(bytes32 => address) internal _renderRequests;

    // A collection of render jobs associated with the box token id
    mapping(bytes32 => uint256) internal _renderTokenIds;

    // END V1 Variables

    function initialize(address rarePizzasBoxContract) public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();
        __ERC721_init('Rare Pizzas', 'PIZZA');

        if (rarePizzasBoxContract != address(0)) {
            _rarePizzasBoxContract = IRarePizzasBox(rarePizzasBoxContract);
        }

        // TODO: update with real value
        _contractURI = 'https://raw.githubusercontent.com/PizzaDAO/pizza-smartcontract/master/data/opensea_pizza_metadata.mainnet.json';
    }

    // IOpenSeaCompatible

    function contractURI() public view virtual override returns (string memory) {
        // Metadata provided via github link so that it can be updated or modified
        return _contractURI;
    }

    function setContractURI(string memory URI) external virtual override onlyOwner {
        _contractURI = URI;
    }

    // IRarePizzas

    function isRedeemed(uint256 boxTokenId) public view override returns (bool) {
        return _redeemedBoxTokenAddress[boxTokenId] != address(0);
    }

    function redeemRarePizzasBox(uint256 boxTokenId) public override nonReentrant {
        require(_msgSender() == _rarePizzasBoxContract.ownerOf(boxTokenId), 'caller must own box');
        _redeemRarePizzasBox(_msgSender(), boxTokenId);
    }

    // IRarePizzasBox overrides

    // redirect to the box contract

    function getBitcoinPriceInWei() public view virtual override returns (uint256) {
        return _rarePizzasBoxContract.getBitcoinPriceInWei();
    }

    function getPrice() public view virtual override returns (uint256) {
        return _rarePizzasBoxContract.getPriceInWei();
    }

    function getPriceInWei() public view virtual override returns (uint256) {
        return _rarePizzasBoxContract.getPriceInWei();
    }

    function maxSupply() public view virtual override returns (uint256) {
        return _rarePizzasBoxContract.maxSupply();
    }

    function purchase() public payable virtual override nonReentrant {
        _rarePizzasBoxContract.purchase();
    }

    // IOrderAPICallback

    function fulfillResponse(bytes32 request, bytes32 result) public virtual override {
        require(_msgSender() == address(_orderAPIClient), 'caller not order api');
        require(_renderRequests[request] != address(0), 'valid request must exist');

        address requestor = _renderRequests[request];
        uint256 boxTokenId = _renderTokenIds[request];

        _internalMintPizza(requestor, boxTokenId, result);
    }

    // IERC721 Overrides

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721Upgradeable, IERC721MetadataUpgradeable)
        returns (string memory)
    {
        require(_exists(tokenId), 'does not exist, paisano');
        return string(abi.encodePacked(_uriBase, _base58Encode(_tokenPizzaArtworkURIs[tokenId])));
    }

    // IRarePizzasAdmin

    function redeemRarePizzasBoxForOwner(uint256 boxTokenId) public virtual override onlyOwner {
        address boxOwner = _rarePizzasBoxContract.ownerOf(boxTokenId);
        require(boxOwner != address(0), 'box token must exist');
        _redeemRarePizzasBox(boxOwner, boxTokenId);
    }

    function setOrderAPIClient(address orderAPIClient) public virtual override onlyOwner {
        address previous = address(_orderAPIClient);
        _orderAPIClient = IOrderAPIConsumer(orderAPIClient);
        emit OrderAPIClientUpdated(previous, address(_orderAPIClient));
    }

    function setRarePizzasBoxContract(address boxContract) public virtual override onlyOwner {
        address previous = address(_rarePizzasBoxContract);
        _rarePizzasBoxContract = IRarePizzasBox(boxContract);
        emit RarePizzasBoxContractUpdated(previous, address(_rarePizzasBoxContract));
    }

    function setPizzaArtworkURI(uint256 tokenId, bytes32 uri) public virtual override onlyOwner {
        _tokenPizzaArtworkURIs[tokenId] = uri;
        emit InternalArtworkAssigned(tokenId, uri);
    }

    function withdraw() public virtual override onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }

    // Internal Stuff

    function _assignPizzaArtwork(uint256 tokenId, bytes32 artworkURI) internal virtual {
        _tokenPizzaArtworkURIs[tokenId] = artworkURI;
        emit InternalArtworkAssigned(tokenId, artworkURI);
    }

    function _getPizzaTokenId(uint256 boxTokenId) internal view virtual returns (uint256) {
        // TODO: pizza DNA?
        return boxTokenId;
    }

    function _externalMintPizza(address requestor, uint256 boxTokenId) internal virtual {
        bytes32 requestId = _orderAPIClient.executeRequest(requestor);
        _renderRequests[requestId] = requestor;
        _renderTokenIds[requestId] = boxTokenId;
    }

    function _internalMintPizza(
        address requestor,
        uint256 boxTokenId,
        bytes32 artwork
    ) internal virtual {
        uint256 id = _getPizzaTokenId(boxTokenId);
        _safeMint(requestor, id);
        _assignPizzaArtwork(id, artwork);
    }

    function _redeemRarePizzasBox(address requestor, uint256 boxTokenId) internal virtual {
        require(_redeemedBoxTokenAddress[boxTokenId] == address(0), 'box already redeemed');
        _redeemedBoxTokenAddress[boxTokenId] = requestor;
        _externalMintPizza(requestor, boxTokenId);
    }

    function _base58Encode(bytes32 input) internal pure virtual returns (bytes memory) {
        // based on: https://github.com/MrChico/verifyIPFS/blob/master/contracts/verifyIPFS.sol#L28
        if (input.length == 0) return new bytes(0);

        // prepend the stripped multihash values
        bytes memory source = abi.encodePacked(sha256MultiHash, input);
        // the ipfs hash takes up 46 characters
        uint8[] memory digits = new uint8[](46);
        digits[0] = 0;
        uint8 digitlength = 1;
        for (uint256 i = 0; i < source.length; ++i) {
            uint256 carry = uint8(source[i]);
            for (uint256 j = 0; j < digitlength; ++j) {
                carry += uint256(digits[j]) * 256;
                digits[j] = uint8(carry % 58);
                carry = carry / 58;
            }

            while (carry > 0) {
                digits[digitlength] = uint8(carry % 58);
                digitlength++;
                carry = carry / 58;
            }
        }
        return _toAlphabet(_reverse(digits));
    }

    function _reverse(uint8[] memory input) internal pure virtual returns (uint8[] memory) {
        uint8[] memory output = new uint8[](input.length);
        for (uint256 i = 0; i < input.length; i++) {
            output[i] = input[input.length - 1 - i];
        }
        return output;
    }

    function _toAlphabet(uint8[] memory indices) internal pure virtual returns (bytes memory) {
        bytes memory output = new bytes(indices.length);
        for (uint256 i = 0; i < indices.length; i++) {
            output[i] = ALPHABET[indices[i]];
        }
        return output;
    }
}
