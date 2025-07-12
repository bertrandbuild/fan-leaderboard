// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./CampaignRewards.sol";
import "./interfaces/IERC20.sol";

/**
 * @title CampaignFactory
 * @dev Factory contract for creating and managing campaign reward contracts
 * @notice This contract creates individual CampaignRewards contracts for completed campaigns
 */
contract CampaignFactory {
    // PSG Fan Token addresses on Chiliz testnet
    address public constant PSG_UNWRAPPED = 0xb0Fa395a3386800658B9617F90e834E2CeC76Dd3;
    address public constant PSG_WRAPPED = 0x6D124526a5948Cb82BB5B531Bf9989D8aB34C899;
    
    // Campaign registry
    struct CampaignInfo {
        address contractAddress;
        string campaignId;
        string campaignTitle;
        address admin;
        address fanToken;
        uint256 totalPool;
        uint256 createdAt;
        bool isActive;
    }
    
    // Storage
    mapping(string => CampaignInfo) public campaigns;
    mapping(address => string[]) public adminCampaigns;
    string[] public allCampaigns;
    
    // Events
    event CampaignCreated(
        string indexed campaignId,
        address indexed contractAddress,
        address indexed admin,
        address fanToken,
        uint256 totalPool
    );
    
    event CampaignFinalized(
        string indexed campaignId,
        address indexed contractAddress,
        uint256 participantCount
    );
    
    /**
     * @dev Create a new campaign contract
     * @param _campaignId Off-chain campaign ID
     * @param _campaignTitle Campaign title
     * @param _admin Campaign admin address
     * @param _fanToken Fan token contract address (must be PSG token)
     * @param _totalPool Total token pool for rewards
     */
    function createCampaign(
        string memory _campaignId,
        string memory _campaignTitle,
        address _admin,
        address _fanToken,
        uint256 _totalPool
    ) external returns (address) {
        require(bytes(_campaignId).length > 0, "Campaign ID cannot be empty");
        require(campaigns[_campaignId].contractAddress == address(0), "Campaign already exists");
        require(_admin != address(0), "Invalid admin address");
        require(_totalPool > 0, "Pool amount must be greater than 0");
        require(
            _fanToken == PSG_UNWRAPPED || _fanToken == PSG_WRAPPED,
            "Only PSG tokens are supported"
        );
        
        // Deploy new campaign contract
        CampaignRewards campaign = new CampaignRewards(
            _campaignId,
            _campaignTitle,
            _admin,
            _fanToken,
            _totalPool
        );
        
        address campaignAddress = address(campaign);
        
        // Store campaign info
        campaigns[_campaignId] = CampaignInfo({
            contractAddress: campaignAddress,
            campaignId: _campaignId,
            campaignTitle: _campaignTitle,
            admin: _admin,
            fanToken: _fanToken,
            totalPool: _totalPool,
            createdAt: block.timestamp,
            isActive: true
        });
        
        // Update indices
        adminCampaigns[_admin].push(_campaignId);
        allCampaigns.push(_campaignId);
        
        emit CampaignCreated(_campaignId, campaignAddress, _admin, _fanToken, _totalPool);
        
        return campaignAddress;
    }
    
    /**
     * @dev Fund a campaign with tokens (must be called by admin)
     * @param _campaignId Campaign ID to fund
     * @param _amount Amount of tokens to transfer
     */
    function fundCampaign(string memory _campaignId, uint256 _amount) external {
        CampaignInfo storage campaign = campaigns[_campaignId];
        require(campaign.contractAddress != address(0), "Campaign does not exist");
        require(msg.sender == campaign.admin, "Only admin can fund campaign");
        require(_amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from admin to campaign contract
        IERC20(campaign.fanToken).transferFrom(
            msg.sender,
            campaign.contractAddress,
            _amount
        );
    }
    
    /**
     * @dev Finalize a campaign with leaderboard (must be called by admin)
     * @param _campaignId Campaign ID to finalize
     * @param _users Array of user addresses
     * @param _points Array of user points
     * @param _allocations Array of token allocations
     */
    function finalizeCampaign(
        string memory _campaignId,
        address[] memory _users,
        uint256[] memory _points,
        uint256[] memory _allocations
    ) external {
        CampaignInfo storage campaign = campaigns[_campaignId];
        require(campaign.contractAddress != address(0), "Campaign does not exist");
        require(msg.sender == campaign.admin, "Only admin can finalize campaign");
        require(campaign.isActive, "Campaign already finalized");
        
        // Set leaderboard on campaign contract
        CampaignRewards(campaign.contractAddress).setLeaderboard(
            _users,
            _points,
            _allocations
        );
        
        campaign.isActive = false;
        
        emit CampaignFinalized(_campaignId, campaign.contractAddress, _users.length);
    }
    
    /**
     * @dev Get campaign information
     * @param _campaignId Campaign ID
     */
    function getCampaignInfo(string memory _campaignId) external view returns (
        address contractAddress,
        string memory campaignTitle,
        address admin,
        address fanToken,
        uint256 totalPool,
        uint256 createdAt,
        bool isActive
    ) {
        CampaignInfo memory campaign = campaigns[_campaignId];
        require(campaign.contractAddress != address(0), "Campaign does not exist");
        
        return (
            campaign.contractAddress,
            campaign.campaignTitle,
            campaign.admin,
            campaign.fanToken,
            campaign.totalPool,
            campaign.createdAt,
            campaign.isActive
        );
    }
    
    /**
     * @dev Get all campaigns for a specific admin
     * @param _admin Admin address
     */
    function getAdminCampaigns(address _admin) external view returns (string[] memory) {
        return adminCampaigns[_admin];
    }
    
    /**
     * @dev Get all campaign IDs
     */
    function getAllCampaigns() external view returns (string[] memory) {
        return allCampaigns;
    }
    
    /**
     * @dev Get total number of campaigns
     */
    function getCampaignCount() external view returns (uint256) {
        return allCampaigns.length;
    }
    
    /**
     * @dev Check if campaign exists
     * @param _campaignId Campaign ID to check
     */
    function campaignExists(string memory _campaignId) external view returns (bool) {
        return campaigns[_campaignId].contractAddress != address(0);
    }
    
    /**
     * @dev Get campaign contract address
     * @param _campaignId Campaign ID
     */
    function getCampaignContract(string memory _campaignId) external view returns (address) {
        return campaigns[_campaignId].contractAddress;
    }
    
    /**
     * @dev Get PSG token addresses
     */
    function getPSGTokens() external pure returns (address unwrapped, address wrapped) {
        return (PSG_UNWRAPPED, PSG_WRAPPED);
    }
    
    /**
     * @dev Check if token is supported
     * @param _token Token address to check
     */
    function isSupportedToken(address _token) external pure returns (bool) {
        return _token == PSG_UNWRAPPED || _token == PSG_WRAPPED;
    }
} 