import { ethers, Contract, Wallet } from 'ethers';
import { CampaignInfo } from '../types';

// Contract ABIs (simplified for essential functions)
const CAMPAIGN_FACTORY_ABI = [
  "function createCampaign(string memory _campaignId, string memory _campaignTitle, address _admin, address _fanToken, uint256 _totalPool) external returns (address)",
  "function fundCampaign(string memory _campaignId, uint256 _amount) external",
  "function finalizeCampaign(string memory _campaignId, address[] memory _users, uint256[] memory _points, uint256[] memory _allocations) external",
  "function getCampaignInfo(string memory _campaignId) external view returns (address contractAddress, string memory campaignTitle, address admin, address fanToken, uint256 totalPool, uint256 createdAt, bool isActive)",
  "function getCampaignContract(string memory _campaignId) external view returns (address)",
  "function isSupportedToken(address _token) external pure returns (bool)",
  "function getPSGTokens() external pure returns (address unwrapped, address wrapped)",
  "event CampaignCreated(string indexed campaignId, address indexed contractAddress, address indexed admin, address fanToken, uint256 totalPool)",
  "event CampaignFinalized(string indexed campaignId, address indexed contractAddress, uint256 participantCount)"
];

const CAMPAIGN_REWARDS_ABI = [
  "function claimReward() external",
  "function getClaimableAmount(address user) external view returns (uint256)",
  "function getUserInfo(address user) external view returns (uint256 position, uint256 points, uint256 allocation, bool claimed)",
  "function getLeaderboard(uint256 offset, uint256 limit) external view returns (address[] memory users, uint256[] memory points, uint256[] memory allocations, bool[] memory claimed)",
  "function getCampaignInfo() external view returns (string memory id, string memory title, address tokenAddress, uint256 pool, uint256 timestamp, uint256 participantCount)",
  "function getContractBalance() external view returns (uint256)",
  "event RewardClaimed(address indexed user, uint256 amount)"
];

const ERC20_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

/**
 * Web3 Service for interacting with Chiliz Chain contracts
 */
export class Web3Service {
  private provider: ethers.Provider;
  private signer: Wallet;
  private campaignFactory: Contract;
  private factoryAddress: string;
  
  // Chiliz Chain configuration
  private static readonly CHILIZ_RPC = 'https://rpc.ankr.com/chiliz';
  private static readonly CHILIZ_CHAIN_ID = 88882;
  
  // PSG Token addresses on Chiliz testnet
  public static readonly PSG_UNWRAPPED = '0xb0Fa395a3386800658B9617F90e834E2CeC76Dd3';
  public static readonly PSG_WRAPPED = '0x6D124526a5948Cb82BB5B531Bf9989D8aB34C899';
  
  constructor(privateKey: string, factoryAddress: string) {
    this.provider = new ethers.JsonRpcProvider(Web3Service.CHILIZ_RPC);
    this.signer = new Wallet(privateKey, this.provider);
    this.factoryAddress = factoryAddress;
    this.campaignFactory = new Contract(factoryAddress, CAMPAIGN_FACTORY_ABI, this.signer);
  }
  
  /**
   * Initialize Web3 service with contract addresses
   */
  static async create(privateKey: string, factoryAddress: string): Promise<Web3Service> {
    const service = new Web3Service(privateKey, factoryAddress);
    
    // Verify connection and contract
    try {
      await service.provider.getNetwork();
      await service.campaignFactory.getPSGTokens();
      console.log('✅ Web3Service initialized successfully');
      return service;
    } catch (error) {
      console.error('❌ Failed to initialize Web3Service:', error);
      throw error;
    }
  }
  
  /**
   * Deploy a new campaign contract and fund it
   */
  async deployCampaign(
    campaignId: string,
    title: string,
    adminAddress: string,
    fanTokenAddress: string,
    totalPool: number
  ): Promise<{
    contractAddress: string;
    transactionHash: string;
    gasUsed: string;
  }> {
    try {
      console.log(`🚀 Deploying campaign contract for: ${title}`);
      
      // Verify token is supported
      const isSupported = await this.campaignFactory.isSupportedToken(fanTokenAddress);
      if (!isSupported) {
        throw new Error(`Unsupported token: ${fanTokenAddress}`);
      }
      
      // Convert pool amount to wei (assuming 18 decimals)
      const poolAmountWei = ethers.parseUnits(totalPool.toString(), 18);
      
      // Deploy campaign contract
      const tx = await this.campaignFactory.createCampaign(
        campaignId,
        title,
        adminAddress,
        fanTokenAddress,
        poolAmountWei
      );
      
      const receipt = await tx.wait();
      
      // Get contract address from event
      const event = receipt.logs.find((log: any) => {
        try {
          const decoded = this.campaignFactory.interface.parseLog(log);
          return decoded?.name === 'CampaignCreated';
        } catch {
          return false;
        }
      });
      
      if (!event) {
        throw new Error('CampaignCreated event not found');
      }
      
      const decodedEvent = this.campaignFactory.interface.parseLog(event);
      const contractAddress = decodedEvent?.args?.contractAddress;
      
      console.log(`✅ Campaign contract deployed at: ${contractAddress}`);
      
      return {
        contractAddress,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString()
      };
      
    } catch (error) {
      console.error('❌ Failed to deploy campaign:', error);
      throw error;
    }
  }
  
  /**
   * Fund a campaign with tokens
   */
  async fundCampaign(
    campaignId: string,
    amount: number,
    tokenAddress: string
  ): Promise<{
    transactionHash: string;
    gasUsed: string;
  }> {
    try {
      console.log(`💰 Funding campaign ${campaignId} with ${amount} tokens`);
      
      const amountWei = ethers.parseUnits(amount.toString(), 18);
      
      // First approve the factory to spend tokens
      const tokenContract = new Contract(tokenAddress, ERC20_ABI, this.signer);
      const approveTx = await tokenContract.approve(this.factoryAddress, amountWei);
      await approveTx.wait();
      
      // Then fund the campaign
      const fundTx = await this.campaignFactory.fundCampaign(campaignId, amountWei);
      const receipt = await fundTx.wait();
      
      console.log(`✅ Campaign funded successfully`);
      
      return {
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString()
      };
      
    } catch (error) {
      console.error('❌ Failed to fund campaign:', error);
      throw error;
    }
  }
  
  /**
   * Finalize a campaign with leaderboard
   */
  async finalizeCampaign(
    campaignId: string,
    leaderboard: Array<{
      userAddress: string;
      points: number;
      allocation: number;
    }>
  ): Promise<{
    transactionHash: string;
    gasUsed: string;
  }> {
    try {
      console.log(`🏆 Finalizing campaign ${campaignId} with ${leaderboard.length} participants`);
      
      const users = leaderboard.map(entry => entry.userAddress);
      const points = leaderboard.map(entry => entry.points);
      const allocations = leaderboard.map(entry => 
        ethers.parseUnits(entry.allocation.toString(), 18)
      );
      
      const tx = await this.campaignFactory.finalizeCampaign(
        campaignId,
        users,
        points,
        allocations
      );
      
      const receipt = await tx.wait();
      
      console.log(`✅ Campaign finalized successfully`);
      
      return {
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString()
      };
      
    } catch (error) {
      console.error('❌ Failed to finalize campaign:', error);
      throw error;
    }
  }
  
  /**
   * Get campaign contract address
   */
  async getCampaignContract(campaignId: string): Promise<string> {
    try {
      const contractAddress = await this.campaignFactory.getCampaignContract(campaignId);
      return contractAddress;
    } catch (error) {
      console.error('❌ Failed to get campaign contract:', error);
      throw error;
    }
  }
  
  /**
   * Get claimable amount for a user
   */
  async getClaimableAmount(campaignId: string, userAddress: string): Promise<number> {
    try {
      const contractAddress = await this.getCampaignContract(campaignId);
      const campaignContract = new Contract(contractAddress, CAMPAIGN_REWARDS_ABI, this.provider);
      
      const claimableWei = await campaignContract.getClaimableAmount(userAddress);
      return parseFloat(ethers.formatUnits(claimableWei, 18));
      
    } catch (error) {
      console.error('❌ Failed to get claimable amount:', error);
      throw error;
    }
  }
  
  /**
   * Get user info from campaign contract
   */
  async getUserInfo(campaignId: string, userAddress: string): Promise<{
    position: number;
    points: number;
    allocation: number;
    claimed: boolean;
  }> {
    try {
      const contractAddress = await this.getCampaignContract(campaignId);
      const campaignContract = new Contract(contractAddress, CAMPAIGN_REWARDS_ABI, this.provider);
      
      const [position, points, allocationWei, claimed] = await campaignContract.getUserInfo(userAddress);
      
      return {
        position: Number(position),
        points: Number(points),
        allocation: parseFloat(ethers.formatUnits(allocationWei, 18)),
        claimed
      };
      
    } catch (error) {
      console.error('❌ Failed to get user info:', error);
      throw error;
    }
  }
  
  /**
   * Get account balance for CHZ
   */
  async getAccountBalance(): Promise<string> {
    try {
      const balance = await this.provider.getBalance(this.signer.address);
      return ethers.formatUnits(balance, 18);
    } catch (error) {
      console.error('❌ Failed to get account balance:', error);
      throw error;
    }
  }
  
  /**
   * Get token balance for a specific ERC20 token
   */
  async getTokenBalance(tokenAddress: string, userAddress?: string): Promise<number> {
    try {
      const tokenContract = new Contract(tokenAddress, ERC20_ABI, this.provider);
      const address = userAddress || this.signer.address;
      const balanceWei = await tokenContract.balanceOf(address);
      return parseFloat(ethers.formatUnits(balanceWei, 18));
    } catch (error) {
      console.error('❌ Failed to get token balance:', error);
      throw error;
    }
  }
  
  /**
   * Get supported PSG token addresses
   */
  static getPSGTokens(): { unwrapped: string; wrapped: string } {
    return {
      unwrapped: Web3Service.PSG_UNWRAPPED,
      wrapped: Web3Service.PSG_WRAPPED
    };
  }
  
  /**
   * Check if a token is supported
   */
  static isSupportedToken(tokenAddress: string): boolean {
    return tokenAddress === Web3Service.PSG_UNWRAPPED || 
           tokenAddress === Web3Service.PSG_WRAPPED;
  }
}

// Export singleton instance factory
let web3ServiceInstance: Web3Service | null = null;

export const getWeb3Service = async (): Promise<Web3Service> => {
  if (!web3ServiceInstance) {
    const privateKey = process.env.ADMIN_PRIVATE_KEY;
    const factoryAddress = process.env.CAMPAIGN_FACTORY_ADDRESS;
    
    if (!privateKey || !factoryAddress) {
      throw new Error('Missing required environment variables: ADMIN_PRIVATE_KEY, CAMPAIGN_FACTORY_ADDRESS');
    }
    
    web3ServiceInstance = await Web3Service.create(privateKey, factoryAddress);
  }
  
  return web3ServiceInstance;
};

export default Web3Service; 