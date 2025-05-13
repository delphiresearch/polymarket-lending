// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title IndexVault
 * @dev Contract for managing index tokens that represent bundles of prediction market positions
 */
contract IndexVault is ERC1155, Ownable {
    using SafeERC20 for IERC20;
    
    // USDC token contract
    IERC20 public usdc;
    
    // Index data structure
    struct Index {
        uint256 id;
        string name;
        string description;
        uint256 creationTimestamp;
        uint256 expiryTimestamp;
        uint256 initialValue;
        uint256 finalValue;
        bool isSettled;
        address[] componentTokens;
        uint256[] componentWeights;
    }
    
    // Mapping from index ID to Index struct
    mapping(uint256 => Index) public indices;
    
    // Events
    event IndexComposed(uint256 indexed indexId, string name, uint256 initialValue);
    event IndexPurchased(uint256 indexed indexId, address indexed buyer, uint256 amount);
    event IndexRedeemed(uint256 indexed indexId, address indexed redeemer, uint256 amount, uint256 usdcAmount);
    event IndexSettled(uint256 indexed indexId, uint256 finalValue);
    
    /**
     * @dev Constructor
     * @param _usdcAddress Address of the USDC token contract
     * @param _uri Base URI for token metadata
     */
    constructor(address _usdcAddress, string memory _uri) ERC1155(_uri) {
        usdc = IERC20(_usdcAddress);
    }
    
    /**
     * @dev Compose a new index
     * @param _id Index ID (in YYMMDD-N format encoded as uint256)
     * @param _name Name of the index
     * @param _description Description of the index
     * @param _expiryTimestamp Timestamp when the index expires
     * @param _initialValue Initial value of the index in USDC (with 6 decimals)
     * @param _componentTokens Array of component token addresses
     * @param _componentWeights Array of component weights (must sum to 1e18)
     */
    function compose(
        uint256 _id,
        string memory _name,
        string memory _description,
        uint256 _expiryTimestamp,
        uint256 _initialValue,
        address[] memory _componentTokens,
        uint256[] memory _componentWeights
    ) external onlyOwner {
        require(indices[_id].creationTimestamp == 0, "Index already exists");
        require(_componentTokens.length == _componentWeights.length, "Component arrays length mismatch");
        require(_componentTokens.length > 0, "No components provided");
        
        // Create the index
        indices[_id] = Index({
            id: _id,
            name: _name,
            description: _description,
            creationTimestamp: block.timestamp,
            expiryTimestamp: _expiryTimestamp,
            initialValue: _initialValue,
            finalValue: 0,
            isSettled: false,
            componentTokens: _componentTokens,
            componentWeights: _componentWeights
        });
        
        emit IndexComposed(_id, _name, _initialValue);
    }
    
    /**
     * @dev Buy index tokens
     * @param _indexId ID of the index to buy
     * @param _amount Amount of index tokens to buy
     */
    function buy(uint256 _indexId, uint256 _amount) external {
        Index storage index = indices[_indexId];
        require(index.creationTimestamp > 0, "Index does not exist");
        require(!index.isSettled, "Index is already settled");
        require(block.timestamp < index.expiryTimestamp, "Index has expired");
        
        // Calculate USDC amount needed
        uint256 usdcAmount = _amount * index.initialValue;
        
        // Transfer USDC from buyer to vault
        usdc.safeTransferFrom(msg.sender, address(this), usdcAmount);
        
        // Mint index tokens to buyer
        _mint(msg.sender, _indexId, _amount, "");
        
        emit IndexPurchased(_indexId, msg.sender, _amount);
    }
    
    /**
     * @dev Settle an index after all component markets have resolved
     * @param _indexId ID of the index to settle
     * @param _finalValue Final value of the index in USDC (with 6 decimals)
     */
    function settle(uint256 _indexId, uint256 _finalValue) external {
        Index storage index = indices[_indexId];
        require(index.creationTimestamp > 0, "Index does not exist");
        require(!index.isSettled, "Index is already settled");
        require(block.timestamp >= index.expiryTimestamp, "Index has not expired yet");
        
        // Set final value and mark as settled
        index.finalValue = _finalValue;
        index.isSettled = true;
        
        emit IndexSettled(_indexId, _finalValue);
    }
    
    /**
     * @dev Redeem index tokens for USDC
     * @param _indexId ID of the index to redeem
     * @param _amount Amount of index tokens to redeem
     */
    function redeem(uint256 _indexId, uint256 _amount) external {
        Index storage index = indices[_indexId];
        require(index.creationTimestamp > 0, "Index does not exist");
        require(index.isSettled, "Index is not settled yet");
        
        // Calculate USDC amount to return
        uint256 usdcAmount = _amount * index.finalValue;
        
        // Burn index tokens from redeemer
        _burn(msg.sender, _indexId, _amount);
        
        // Transfer USDC to redeemer
        usdc.safeTransfer(msg.sender, usdcAmount);
        
        emit IndexRedeemed(_indexId, msg.sender, _amount, usdcAmount);
    }
    
    /**
     * @dev Get index details
     * @param _indexId ID of the index
     * @return Index struct with all details
     */
    function getIndex(uint256 _indexId) external view returns (Index memory) {
        return indices[_indexId];
    }
    
    /**
     * @dev Update the base URI for token metadata
     * @param _newUri New base URI
     */
    function setURI(string memory _newUri) external onlyOwner {
        _setURI(_newUri);
    }
}
