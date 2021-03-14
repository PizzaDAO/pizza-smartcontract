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
import '../data/AllowList.sol';
import '../data/BoxArt.sol';

/**
 * @dev Rare Pizzas Box mints pizza box token for callers who call the purchase function.
 */
contract RarePizzasBox is
    OwnableUpgradeable,
    ERC721EnumerableUpgradeable,
    AllowList,
    BondingCurve,
    BoxArt,
    IRarePizzasBox,
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

    // END V1 Variables

    function initialize(address chainlinkBTCETHFeed) public initializer {
        __Ownable_init();
        __ERC721_init('Rare Pizza Box', 'ZABOX');

        // 2021-03-14:15h::9m::26s
        publicSaleStart_timestampInS = 1615734566;
        // starting value:  30.00 ETH
        bitcoinPriceInWei = 30000000000000000000;

        if (chainlinkBTCETHFeed != address(0)) {
            _chainlinkBTCETHFeed = chainlinkBTCETHFeed;
        }
    }

    // IOpenSeaCompatible
    function contractURI() public view virtual override returns (string memory) {
        // TODO: opensea metadata
        return 'https://raw.githubusercontent.com/PizzaDAO/pizza-smartcontract/master/data/opensea_metadata.json';
    }

    // IRarePizzasBox
    function getPrice() public view virtual override returns (uint256) {
        return getPriceInWei();
    }

    function getPriceInWei() public view virtual returns (uint256) {
        return ((super.curve(_minted_pizza_count.current() + 1) * bitcoinPriceInWei) / oneEth);
    }

    function maxSupply() public view virtual override returns (uint256) {
        return MAX_TOKEN_SUPPLY;
    }

    function purchase() public payable virtual override {
        require(
            block.timestamp >= publicSaleStart_timestampInS || allowed(msg.sender),
            "RAREPIZZA: sale hasn't started yet"
        );
        require(totalSupply().add(1) <= MAX_TOKEN_SUPPLY, 'RAREPIZZA: exceeds supply.');

        uint256 price = getPrice();
        require(msg.value >= price, 'RAREPIZZA: price too low');

        _purchased_pizza_count.increment();
        uint256 id = _getNextPizzaTokenId();
        _safeMint(msg.sender, id);
        _assignBoxArtwork(id);
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
        require(_exists(tokenId), 'RAREPIZZA: does not exist yet, paisano');
        return string(abi.encodePacked(_uriBase, getUriString(_tokenBoxArtworkURIs[tokenId])));
    }

    // Member Functions

    /**
     * Get the current bitcoin price in wei
     */
    function getBitcoinPriceInWei() public view returns (uint256) {
        return bitcoinPriceInWei;
    }

    /**
     * allows the contract owner to mint up to a specific number of boxes
     * owner can mit to themselves
     */
    function mint(address to, uint8 count) public virtual onlyOwner {
        require(count > 0, 'RAREPIZZA: need a number');

        require(totalSupply().add(count) <= maxSupply(), 'RAREPIZZA: exceeds supply.');
        require(
            _minted_pizza_count.current().add(count) <= MAX_MINTABLE_SUPPLY,
            'RAREPIZZA: mint would exceed MAX_MINTABLE_SUPPLY'
        );

        for (uint256 i = 0; i < count; i++) {
            _minted_pizza_count.increment();
            uint256 id = _getNextPizzaTokenId();
            _safeMint(to, id);
            _assignBoxArtwork(id);
        }
    }

    /**
     * allows owner to purchase to a specific address
     owner cannot purchase for themselves
     */
    function purchaseTo(address to) public payable virtual onlyOwner {
        require(totalSupply().add(1) <= MAX_TOKEN_SUPPLY, 'RAREPIZZA: exceeds supply.');
        require(to != msg.sender, 'RAREPIZZA: Thats how capos get whacked');

        uint256 price = getPrice();
        require(msg.value >= price, 'RAREPIZZA: price too low');
        _purchased_pizza_count.increment();
        uint256 id = _getNextPizzaTokenId();
        _safeMint(to, id);
        _assignBoxArtwork(id);
    }

    /**
     * allows the owner to update the cached bitcoin price
     */
    function updateBitcoinPriceInWei(uint256 fallbackValue) public virtual onlyOwner {
        if (_chainlinkBTCETHFeed != address(0)) {
            try AggregatorV3Interface(_chainlinkBTCETHFeed).latestRoundData() returns (
                uint80 roundId,
                int256 answer,
                uint256 startedAt,
                uint256 updatedAt,
                uint80 answeredInRound
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
        if (fallbackValue > 0) {
            uint256 old = bitcoinPriceInWei;
            bitcoinPriceInWei = fallbackValue;
            emit BTCETHPriceUpdated(old, bitcoinPriceInWei);
        }
        // nothing got updated.  The miners thank you for your contribution.
    }

    /**
     * assign artwork index
     */
    function _assignBoxArtwork(uint256 tokenId) internal {
        uint256 pseudoRandom =
            uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), tokenId, msg.sender))) % MAX_BOX_INDEX;
        _tokenBoxArtworkURIs[tokenId] = pseudoRandom;
    }

    function _getNextPizzaTokenId() private view returns (uint256) {
        return totalSupply();
    }

    /**
     * @dev Withdraw ether from this contract (Callable by owner)
     */
    function withdraw() public virtual onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }
}
