// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";

import "../math/BondingCurve.sol";
import "../interfaces/IOpenSeaCompatible.sol";
import "../interfaces/IRarePizzasBox.sol";

/**
 * @dev Rare Pizzas Box mints pizza box token for callers who call the purchase function.
 */
contract RarePizzasBox is
    ERC721EnumerableUpgradeable,
    OwnableUpgradeable,
    BondingCurve,
    IRarePizzasBox,
    IOpenSeaCompatible
{
    using AddressUpgradeable for address;
    using StringsUpgradeable for uint256;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using SafeMathUpgradeable for uint256;

    uint256 private constant MAX_TOKEN_SUPPLY = 10000;
    uint256 private constant MAX_MINTABLE_SUPPLY = 1250; // TODO: verify

    CountersUpgradeable.Counter private _minted_pizza_count;
    CountersUpgradeable.Counter private _whole_pizza_count;

    // TODO:
    string private _boxMetadataUri =
        "https://ipfs.io/ipfs/some/path/to/box/metadata";

    function initialize() public initializer {
        __ERC721_init("Rare Pizza Box", "RAREPIZZASBOX");
    }

    // IOpenSeaCompatible
    function contractURI() public view override returns (string memory) {
        // TODO: opensea metadata
        return "https://something.to/github";
    }

    // IRarePizzasBox
    function getPrice() public view override returns (uint256) {
        return super.curve(super.totalSupply());
    }

    function maxSupply() public view virtual override returns (uint256) {
        return MAX_TOKEN_SUPPLY;
    }

    function purchase() public payable override {
        require(
            totalSupply() <= maxSupply(),
            "RAREPIZZA: Call exceeds maximum supply"
        );

        require(
            totalSupply().add(1) <= maxSupply(),
            "RAREPIZZA: purchase would exceed maxSupply"
        );

        uint256 price = getPrice();
        require(price == msg.value, "RAREPIZZA: price must be on the curve");
        _safeMint(msg.sender, _getNextPizzaTokenId());
        _whole_pizza_count.increment();
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
        return string(abi.encodePacked(_boxMetadataUri));
    }

    /**
     * @dev See {IERC721Enumerable-totalSupply}.
     */
    function totalSupply()
        public
        view
        override(ERC721EnumerableUpgradeable, IERC721EnumerableUpgradeable)
        returns (uint256)
    {
        return _whole_pizza_count.current();
    }

    // Member Functions

    /**
     * allows the contract owner to mint up to a specific number of boxes
     */
    function mint(address to) public onlyOwner {
        require(
            totalSupply().add(1) <= maxSupply(),
            "RAREPIZZA: mint would exceed maxSupply"
        );
        require(
            _minted_pizza_count.current().add(1) <= MAX_MINTABLE_SUPPLY,
            "RAREPIZZA: mint would exceed MAX_MINTABLE_SUPPLY"
        );
        _safeMint(to, _getNextPizzaTokenId());
        _minted_pizza_count.increment();
        _whole_pizza_count.increment();
    }

    function _getNextPizzaTokenId() private returns (uint256) {
        return totalSupply();
    }

    /**
     * @dev Withdraw ether from this contract (Callable by owner)
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }
}
