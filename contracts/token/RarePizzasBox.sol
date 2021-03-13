// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol';

import '../math/BondingCurve.sol';
import '../interfaces/IOpenSeaCompatible.sol';
import '../interfaces/IRarePizzasBox.sol';
import '../data/AllowList.sol';

/**
 * @dev Rare Pizzas Box mints pizza box token for callers who call the purchase function.
 */
contract RarePizzasBox is
    OwnableUpgradeable,
    ERC721EnumerableUpgradeable,
    BondingCurve,
    IRarePizzasBox,
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

    uint256 public _public_sale_start_timestamp;

    string public constant _boxMetadataUri = 'https://ipfs.io/ipfs/some/path/to/box/metadata';

    CountersUpgradeable.Counter public _minted_pizza_count;
    CountersUpgradeable.Counter public _purchased_pizza_count;

    // END V1 Variables

    function initialize(address mintTo, uint8 count) public initializer {
        __Ownable_init();
        __ERC721_init('Rare Pizza Box', 'RAREPIZZASBOX');

        // 2021-03-14:15h::9m::26s
        _public_sale_start_timestamp = 1615734566;
        if (count > 0) {
            mint(mintTo, count);
        }
    }

    // IOpenSeaCompatible
    function contractURI() public view virtual override returns (string memory) {
        // TODO: opensea metadata
        return 'https://raw.githubusercontent.com/PizzaDAO/pizza-smartcontract/master/data/opensea_metadata.json';
    }

    // IRarePizzasBox
    function getPrice() public view virtual override returns (uint256) {
        return super.curve(super.totalSupply() + 1);
    }

    function maxSupply() public view virtual override returns (uint256) {
        return MAX_TOKEN_SUPPLY;
    }

    function purchase() public payable virtual override {
        require(
            block.timestamp >= _public_sale_start_timestamp || AllowList.allowed(msg.sender),
            "RAREPIZZA: The sale hasn't started yet"
        );
        require(totalSupply().add(1) <= MAX_TOKEN_SUPPLY, 'RAREPIZZA: purchase would exceed maxSupply');

        uint256 price = getPrice();
        require(price == msg.value, 'RAREPIZZA: price must be on the curve');
        _purchased_pizza_count.increment();
        _safeMint(msg.sender, _getNextPizzaTokenId());
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

    // Member Functions

    /**
     * allows the contract owner to mint up to a specific number of boxes
     */
    function mint(address to, uint8 count) public virtual onlyOwner {
        require(count > 0, 'RAREPIZZA: must provide a count');

        require(totalSupply().add(count) <= maxSupply(), 'RAREPIZZA: mint would exceed maxSupply');
        require(
            _minted_pizza_count.current().add(count) <= MAX_MINTABLE_SUPPLY,
            'RAREPIZZA: mint would exceed MAX_MINTABLE_SUPPLY'
        );

        for (uint256 i = 0; i < count; i++) {
            _minted_pizza_count.increment();
            _safeMint(to, _getNextPizzaTokenId());
        }
    }

    /**
     * allows owner to purchase to a specific address
     */
    function purchaseTo(address to) public payable virtual onlyOwner {
        require(totalSupply().add(1) <= MAX_TOKEN_SUPPLY, 'RAREPIZZA: purchase would exceed maxSupply');
        require(to != msg.sender, 'RAREPIZZA: Thats how capos get whacked');

        uint256 price = getPrice();
        require(price == msg.value, 'RAREPIZZA: price must be on the curve');
        _purchased_pizza_count.increment();
        _safeMint(to, _getNextPizzaTokenId());
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
