pragma solidity ^0.8.1;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IERC2981.sol";
import "./Base64.sol";
import "./Account.sol";

/**
 * @author Ramkumar Rajaram
 * @title KrisTicks NFT contract
 * @dev Extends ERC-721 NFT contract and implements ERC-2981
 */

contract KrisTicksNFT is Ownable, ERC721Enumerable, ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Account account;

    // Address of the royalties recipient
    address private _royaltiesReceiver;
    // Percentage of each sale to pay as royalties
    uint256 public constant royaltiesPercentage = 5;

    // Events
    event Mint(uint256 tokenId, address recipient);

    //Rolyalty receiver, that is SIA's address will be stored while creating the NFT object
    constructor(address initialRoyaltiesReceiver, address accountContractAddress) ERC721("KrisTicks", "KTS") {
        _royaltiesReceiver = initialRoyaltiesReceiver;
        account = Account(accountContractAddress);
    }

    // /** Overrides ERC-721's _baseURI function */
    // function _baseURI() internal view override returns (string memory) {
    //     return "https://gateway.pinata.cloud/ipfs/";
    // }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, amount);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    /// @notice Getter function for _royaltiesReceiver
    /// @return the address of the royalties recipient
    function royaltiesReceiver() external view returns (address) {
        return _royaltiesReceiver;
    }

    /// @notice Changes the royalties' recipient address (in case rights are
    ///         transferred for instance)
    /// @param newRoyaltiesReceiver - address of the new royalties recipient
    function setRoyaltiesReceiver(address newRoyaltiesReceiver)
        external
        onlyOwner
    {
        require(newRoyaltiesReceiver != _royaltiesReceiver); // dev: Same address
        _royaltiesReceiver = newRoyaltiesReceiver;
    }

    /// @notice Returns a token's URI
    /// @dev See {IERC721Metadata-tokenURI}.
    /// @param tokenId - the id of the token whose URI to return
    /// @return a string containing an URI pointing to the token's ressource
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /// @notice Informs callers that this contract supports ERC2981
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /// @notice Returns all the tokens owned by an address
    /// @param _owner - the address to query
    /// @return ownerTokens - an array containing the ids of all tokens
    ///         owned by the address
    function tokensOfOwner(address _owner)
        external
        view
        returns (uint256[] memory ownerTokens)
    {
        uint256 tokenCount = balanceOf(_owner);
        uint256[] memory result = new uint256[](tokenCount);

        if (tokenCount == 0) {
            return new uint256[](0);
        } else {
            for (uint256 i = 0; i < tokenCount; i++) {
                result[i] = tokenOfOwnerByIndex(_owner, i);
            }
            return result;
        }
    }

    /// @notice Called with the sale price to determine how much royalty
    //          is owed and to whom.
    /// @param _salePrice - sale price of the NFT asset specified by _tokenId
    /// @return royaltyReceiver - address of who should be sent the royalty payment
    /// @return royaltyAmount - the royalty payment amount for _value sale price
    function royaltyInfo(uint256 _salePrice)
        external
        view
        returns (address royaltyReceiver, uint256 royaltyAmount)
    {
        uint256 _royalties = (_salePrice * royaltiesPercentage) / 100;
        return (_royaltiesReceiver, _royalties);
    }

    /// @notice Called to transfer ownership of NFT from seller to buyer
    /// @param _from - address of the owner of NFT who intends to sell the NFT
    /// @param _to - address of the buyer of NFT
    /// @param _tokenId - tokenId of the NFT token
    function safeTransfer(
        address _from,
        address _to,
        uint256 _tokenId
    ) external {
        require(account.accountStatus(_from));      // Check if sender is active
        require(account.accountStatus(_to));        // Check if recipient is active
        require(msg.sender == _from);  
        super._transfer(_from, _to, _tokenId);
    }

    function formatTokenURI(
        string memory expiryDate,
        string memory origin,
        string memory destination,
        string memory flightNumber,
        string memory dateOfTravel
    ) private pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"expiryDate":"',
                                expiryDate,
                                ', "origin": ',
                                origin,
                                ', "destination": ',
                                destination,
                                ', "flightNumber": ',
                                flightNumber,
                                ', "dateOfTravel": ',
                                dateOfTravel,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    /// @notice Mints tokens
    /// @param recipient - the address to which the token will be transfered
    /// @return tokenId - the id of the token
    function mint(
        address recipient,
        string memory expiryDate,
        string memory origin,
        string memory destination,
        string memory flightNumber,
        string memory dateOfTravel
    ) external onlyOwner returns (uint256 tokenId) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(recipient, newItemId);
        string memory _tokenURI = formatTokenURI(
            expiryDate,
            origin,
            destination,
            flightNumber,
            dateOfTravel
        );
        _setTokenURI(newItemId, _tokenURI);
        emit Mint(newItemId, recipient);
        return newItemId;
    }
}
