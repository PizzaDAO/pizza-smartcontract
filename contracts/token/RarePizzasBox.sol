// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol';

import '@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol';

import '../math/BondingCurve.sol';
import '../interfaces/IOpenSeaCompatible.sol';
import '../interfaces/IRarePizzasBox.sol';
import '../interfaces/IRarePizzasBoxAdmin.sol';
import '../data/BoxArt.sol';

/**
 * @dev Rare Pizzas Box mints pizza box token for callers who call the purchase function.
 */
contract RarePizzasBox is
    OwnableUpgradeable,
    ERC721EnumerableUpgradeable,
    BoxArt,
    BondingCurve,
    IRarePizzasBox,
    IRarePizzasBoxAdmin,
    IOpenSeaCompatible
{
    using AddressUpgradeable for address;
    using StringsUpgradeable for uint256;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using SafeMathUpgradeable for uint256;

    // V1 Variables (do not modify this section when upgrading)

    event BTCETHPriceUpdated(uint256 old, uint256 current);

    uint256 public constant MAX_TOKEN_SUPPLY = 10000;
    uint256 public constant MAX_MINTABLE_SUPPLY = 1250;
    uint256 public constant MAX_PURCHASABLE_SUPPLY = 8750;

    uint256 public publicSaleStart_timestampInS;
    uint256 public bitcoinPriceInWei;

    string public constant _uriBase = 'https://ipfs.io/ipfs/';

    address internal _chainlinkBTCETHFeed;

    CountersUpgradeable.Counter public _minted_pizza_count;
    CountersUpgradeable.Counter public _purchased_pizza_count;

    mapping(uint256 => uint256) internal _tokenBoxArtworkURIs;

    mapping(address => uint256) internal _presaleAllowed;
    mapping(address => uint256) internal _presalePurchaseCount;

    // END V1 Variables

    // V2 Events Added

    event PresaleAllowedUpdated();
    event SaleStartTimestampUpdated(uint256 old, uint256 current);

    // END V2 Events Added

    function initialize(address chainlinkBTCETHFeed) public initializer {
        __Ownable_init();
        __ERC721_init('Rare Pizza Box', 'ZABOX');

        // Date and time (GMT): Set to PI
        publicSaleStart_timestampInS = 3141592653;
        // starting value:  31.00 ETH
        bitcoinPriceInWei = 31000000000000000000;

        if (chainlinkBTCETHFeed != address(0)) {
            _chainlinkBTCETHFeed = chainlinkBTCETHFeed;
        }
    }

    // IOpenSeaCompatible
    function contractURI() public view virtual override returns (string memory) {
        // Metadata provided via github link so that it can be updated or modified
        return
            'https://raw.githubusercontent.com/PizzaDAO/pizza-smartcontract/master/data/opensea_metadata.mainnet.json';
    }

    // IRarePizzasBox
    function getBitcoinPriceInWei() public view virtual override returns (uint256) {
        return bitcoinPriceInWei;
    }

    function getPrice() public view virtual override returns (uint256) {
        return getPriceInWei();
    }

    function getPriceInWei() public view virtual override returns (uint256) {
        return ((super.curve(_purchased_pizza_count.current() + 1) * bitcoinPriceInWei) / oneEth);
    }

    function maxSupply() public view virtual override returns (uint256) {
        return MAX_TOKEN_SUPPLY;
    }

    function purchase() public payable virtual override {
        require(
            block.timestamp >= publicSaleStart_timestampInS ||
                (_presalePurchaseCount[msg.sender] < _presaleAllowed[msg.sender]),
            "sale hasn't started"
        );
        require(totalSupply().add(1) <= MAX_TOKEN_SUPPLY, 'exceeds supply.');

        uint256 price = getPrice();
        require(msg.value >= price, 'price too low');
        payable(msg.sender).transfer(msg.value - price);

        // Presale addresses can purchase up to X total
        _presalePurchaseCount[msg.sender] += 1;
        _purchased_pizza_count.increment();
        _internalMintWithArtwork(msg.sender);

        // BUY ONE GET ONE FREE!
        if (_purchased_pizza_count.current().add(1) == MAX_PURCHASABLE_SUPPLY) {
            _presalePurchaseCount[msg.sender] += 1;
            _purchased_pizza_count.increment();
            _internalMintWithArtwork(msg.sender);
        }
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
        return string(abi.encodePacked(_uriBase, getUriString(_tokenBoxArtworkURIs[tokenId])));
    }

    // IRarePizzasBoxAdmin

    function mint(address toPizzaiolo, uint8 count) public virtual override onlyOwner {
        require(toPizzaiolo != address(0), 'dont be silly');
        require(count > 0, 'need a number');
        require(totalSupply().add(count) <= maxSupply(), 'would exceed supply.');
        require(_minted_pizza_count.current().add(count) <= MAX_MINTABLE_SUPPLY, 'would exceed mint');

        for (uint256 i = 0; i < count; i++) {
            _minted_pizza_count.increment();
            _internalMintWithArtwork(toPizzaiolo);
        }
    }

    function purchaseTo(address toPaisano) public payable virtual override onlyOwner {
        require(toPaisano != address(0), 'dont be silly');
        require(totalSupply().add(1) <= MAX_TOKEN_SUPPLY, 'would exceed supply.');
        require(toPaisano != msg.sender, 'thats how capos get whacked');

        uint256 price = getPrice();
        require(msg.value >= price, 'price too low');
        payable(msg.sender).transfer(msg.value - price);

        _purchased_pizza_count.increment();
        _internalMintWithArtwork(toPaisano);
    }

    function setPresaleAllowed(uint8 count, address[] memory toPaisanos) public virtual override onlyOwner {
        for (uint256 i = 0; i < toPaisanos.length; i++) {
            require(toPaisanos[i] != address(0), 'dont be silly');
            _presaleAllowed[toPaisanos[i]] = count;
        }

        emit PresaleAllowedUpdated();
    }

    function setSaleStartTimestamp(uint256 epochSeconds) public virtual override onlyOwner {
        uint256 old = publicSaleStart_timestampInS;
        publicSaleStart_timestampInS = epochSeconds;

        emit SaleStartTimestampUpdated(old, epochSeconds);
    }

    function updateBitcoinPriceInWei(uint256 fallbackValue) public virtual override onlyOwner {
        if (_chainlinkBTCETHFeed != address(0)) {
            try AggregatorV3Interface(_chainlinkBTCETHFeed).latestRoundData() returns (
                uint80, // roundId,
                int256 answer,
                uint256, // startedAt,
                uint256, // updatedAt,
                uint80 // answeredInRound
            ) {
                uint256 old = bitcoinPriceInWei;
                bitcoinPriceInWei = uint256(answer);
                emit BTCETHPriceUpdated(old, bitcoinPriceInWei);
                return;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    // contract doesnt implement interface, use fallback
                } else {
                    //we got an error and dont care, use fallback
                }
            }
        }
        // obviously if the link integration fails,
        // the owner could set an arbitrary value here that is way out of range.
        if (fallbackValue > 0) {
            uint256 old = bitcoinPriceInWei;
            bitcoinPriceInWei = fallbackValue;
            emit BTCETHPriceUpdated(old, bitcoinPriceInWei);
        }
        // nothing got updated.  The miners thank you for your contribution.
    }

    function withdraw() public virtual override onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }

    // Internal Stuff

    function _assignBoxArtwork(uint256 tokenId) internal virtual {
        uint256 pseudoRandom =
            uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), tokenId, msg.sender))) % MAX_BOX_INDEX;
        _tokenBoxArtworkURIs[tokenId] = pseudoRandom;
    }

    function _getNextPizzaTokenId() internal view virtual returns (uint256) {
        return totalSupply();
    }

    function _internalMintWithArtwork(address to) internal virtual {
        uint256 id = _getNextPizzaTokenId();
        _safeMint(to, id);
        _assignBoxArtwork(id);
    }
}
