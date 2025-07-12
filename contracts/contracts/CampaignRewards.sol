// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IERC20.sol";

/**
 * @title CampaignRewards
 * @dev Contract for managing individual campaign rewards and leaderboard
 * @notice This contract is deployed for each completed campaign and manages reward distribution
 */
contract CampaignRewards {
    // Campaign information
    string public campaignId;
    string public campaignTitle;
    address public admin;
    address public fanToken;
    uint256 public totalPool;
    uint256 public createdAt;
    
    // Leaderboard structure
    struct LeaderboardEntry {
        address userAddress;
        uint256 points;
        uint256 allocation; // Amount of tokens allocated to this user
        bool claimed;
    }
    
    // Storage
    LeaderboardEntry[] public leaderboard;
    mapping(address => uint256) public userToLeaderboardIndex;
    mapping(address => bool) public hasEntry;
    
    // Events
    event RewardClaimed(address indexed user, uint256 amount);
    event LeaderboardFinalized(uint256 totalEntries, uint256 totalRewards);
    event EmergencyWithdraw(address indexed admin, uint256 amount);
    
    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    modifier validUser(address user) {
        require(hasEntry[user], "User not in leaderboard");
        _;
    }
    
    /**
     * @dev Constructor sets up the campaign contract
     * @param _campaignId Off-chain campaign ID
     * @param _campaignTitle Campaign title
     * @param _admin Campaign admin address
     * @param _fanToken Fan token contract address
     * @param _totalPool Total token pool for rewards
     */
    constructor(
        string memory _campaignId,
        string memory _campaignTitle,
        address _admin,
        address _fanToken,
        uint256 _totalPool
    ) {
        campaignId = _campaignId;
        campaignTitle = _campaignTitle;
        admin = _admin;
        fanToken = _fanToken;
        totalPool = _totalPool;
        createdAt = block.timestamp;
    }
    
    /**
     * @dev Set the final leaderboard (can only be called once by admin)
     * @param _users Array of user addresses
     * @param _points Array of user points
     * @param _allocations Array of token allocations
     */
    function setLeaderboard(
        address[] memory _users,
        uint256[] memory _points,
        uint256[] memory _allocations
    ) external onlyAdmin {
        require(_users.length == _points.length && _points.length == _allocations.length, 
                "Arrays length mismatch");
        require(leaderboard.length == 0, "Leaderboard already set");
        
        uint256 totalAllocations = 0;
        
        for (uint256 i = 0; i < _users.length; i++) {
            require(_users[i] != address(0), "Invalid user address");
            require(!hasEntry[_users[i]], "Duplicate user in leaderboard");
            
            leaderboard.push(LeaderboardEntry({
                userAddress: _users[i],
                points: _points[i],
                allocation: _allocations[i],
                claimed: false
            }));
            
            userToLeaderboardIndex[_users[i]] = i;
            hasEntry[_users[i]] = true;
            totalAllocations += _allocations[i];
        }
        
        require(totalAllocations <= totalPool, "Total allocations exceed pool");
        
        emit LeaderboardFinalized(leaderboard.length, totalAllocations);
    }
    
    /**
     * @dev Claim rewards for the caller
     */
    function claimReward() external validUser(msg.sender) {
        uint256 index = userToLeaderboardIndex[msg.sender];
        LeaderboardEntry storage entry = leaderboard[index];
        
        require(!entry.claimed, "Reward already claimed");
        require(entry.allocation > 0, "No allocation for this user");
        
        entry.claimed = true;
        
        // Transfer tokens to user
        IERC20(fanToken).transfer(msg.sender, entry.allocation);
        
        emit RewardClaimed(msg.sender, entry.allocation);
    }
    
    /**
     * @dev Check if user can claim and how much
     * @param user User address to check
     */
    function getClaimableAmount(address user) external view returns (uint256) {
        if (!hasEntry[user]) return 0;
        
        uint256 index = userToLeaderboardIndex[user];
        LeaderboardEntry memory entry = leaderboard[index];
        
        if (entry.claimed) return 0;
        return entry.allocation;
    }
    
    /**
     * @dev Get user's leaderboard position and info
     * @param user User address
     */
    function getUserInfo(address user) external view returns (
        uint256 position,
        uint256 points,
        uint256 allocation,
        bool claimed
    ) {
        require(hasEntry[user], "User not in leaderboard");
        
        uint256 index = userToLeaderboardIndex[user];
        LeaderboardEntry memory entry = leaderboard[index];
        
        return (index + 1, entry.points, entry.allocation, entry.claimed);
    }
    
    /**
     * @dev Get full leaderboard (paginated)
     * @param offset Starting index
     * @param limit Maximum number of entries to return
     */
    function getLeaderboard(uint256 offset, uint256 limit) external view returns (
        address[] memory users,
        uint256[] memory points,
        uint256[] memory allocations,
        bool[] memory claimed
    ) {
        require(offset < leaderboard.length, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > leaderboard.length) {
            end = leaderboard.length;
        }
        
        uint256 length = end - offset;
        users = new address[](length);
        points = new uint256[](length);
        allocations = new uint256[](length);
        claimed = new bool[](length);
        
        for (uint256 i = 0; i < length; i++) {
            LeaderboardEntry memory entry = leaderboard[offset + i];
            users[i] = entry.userAddress;
            points[i] = entry.points;
            allocations[i] = entry.allocation;
            claimed[i] = entry.claimed;
        }
    }
    
    /**
     * @dev Get total number of leaderboard entries
     */
    function getLeaderboardLength() external view returns (uint256) {
        return leaderboard.length;
    }
    
    /**
     * @dev Get campaign info
     */
    function getCampaignInfo() external view returns (
        string memory id,
        string memory title,
        address tokenAddress,
        uint256 pool,
        uint256 timestamp,
        uint256 participantCount
    ) {
        return (campaignId, campaignTitle, fanToken, totalPool, createdAt, leaderboard.length);
    }
    
    /**
     * @dev Emergency withdraw by admin (only if something goes wrong)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyAdmin {
        require(amount <= IERC20(fanToken).balanceOf(address(this)), "Insufficient balance");
        
        IERC20(fanToken).transfer(admin, amount);
        emit EmergencyWithdraw(admin, amount);
    }
    
    /**
     * @dev Get contract's token balance
     */
    function getContractBalance() external view returns (uint256) {
        return IERC20(fanToken).balanceOf(address(this));
    }
} 