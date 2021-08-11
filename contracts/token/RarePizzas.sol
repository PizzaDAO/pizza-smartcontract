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

    // V1 Variables (do not modify this section when upgrading)

    uint256 public constant MAX_TOKEN_SUPPLY = 10000;
    uint256 public constant MAX_MINTABLE_SUPPLY = 1250;
    uint256 public constant MAX_PURCHASABLE_SUPPLY = 8750;

    string public constant _uriBase = 'ipfs://';

    string private _contractURI;

    // Other contracts this contract interacts with
    IOrderAPIConsumer internal _orderAPIClient;
    IRarePizzasBox internal _rarePizzasBoxContract;

    CountersUpgradeable.Counter public _minted_pizza_count;
    CountersUpgradeable.Counter public _purchased_pizza_count;

    event RarePizzasBoxContractUpdated(address previous, address current);
    event OrderAPIClientUpdated(address previous, address current);
    event InternalArtworkAssigned(uint256 tokenId, bytes32 artworkURI);

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

        _contractURI = 'https://raw.githubusercontent.com/PizzaDAO/pizza-smartcontract/master/data/opensea_pizza_metadata.mainnet.json';
    }

    // IOpenSeaCompatible
    function contractURI() public view virtual override returns (string memory) {
        // Metadata provided via github link so that it can be updated or modified
        return _contractURI;
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
        return MAX_TOKEN_SUPPLY;
    }

    function purchase() public payable virtual override nonReentrant {
        // redirect to the box contract
        _rarePizzasBoxContract.purchase();
    }

    // IOrderAPICallback

    function fulfillResponse(bytes32 request, bytes32 result) public virtual override {
        // TODO: verify should expect the client and not the EOA of the node
        require(_msgSender() == address(_orderAPIClient), 'caller not order api');
        require(_renderRequests[request] != address(0), 'valid request must exist');

        address requestor = _renderRequests[request];
        uint256 boxTokenId = _renderTokenIds[request];

        _internalMintPizza(requestor, boxTokenId, result);
    }

    // IERC721 Overrides

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721Upgradeable, IERC721MetadataUpgradeable)
        returns (string memory)
    {
        require(_exists(tokenId), 'does not exist, paisano');
        return string(abi.encodePacked(_uriBase, _tokenPizzaArtworkURIs[tokenId]));
    }

    // IRarePizzasAdmin

    function redeemRarePizzasBoxForOwner(uint256 boxTokenId) public virtual override onlyOwner {
        address boxOwner = _rarePizzasBoxContract.ownerOf(boxTokenId);
        require(boxOwner != address(0), 'box token must exist');
        _redeemRarePizzasBox(boxOwner, boxTokenId);
    }

    function setContractURI(string memory URI) external virtual override onlyOwner {
        _contractURI = URI;
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
        // TODO: add pizza DNA?
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
}
