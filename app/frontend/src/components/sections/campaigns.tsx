import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { UserRole } from '../../types/auth';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { AlertCircle, Trophy, Users, Calendar, Coins, Plus, Play, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';

interface Campaign {
  id: string;
  club_admin_id: string;
  title: string;
  description?: string;
  fan_token_address: string;
  pool_amount: number;
  max_participants: number;
  first_place_allocation: number;
  second_place_allocation: number;
  third_place_allocation: number;
  start_date: string;
  end_date: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  current_participants: number;
  total_yaps: number;
  created_at: string;
  updated_at: string;
}

interface CampaignResponse {
  campaign: Campaign;
  admin_profile?: {
    id: string;
    unique_id: string;
    nickname?: string;
    avatar_url?: string;
    follower_count: number;
    rank_score: number;
  };
  participants_count: number;
  leaderboard?: Array<{
    rank: number;
    userId: string;
    tiktokProfile: string;
    nickname?: string;
    totalPoints: number;
    yapCount: number;
    potentialReward?: number;
  }>;
}

interface CampaignListResponse {
  campaigns: CampaignResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    has_more: boolean;
  };
}

const Campaigns: React.FC = () => {
  const { user, isAuthenticated } = useAuthContext();
  const [campaigns, setCampaigns] = useState<CampaignResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignResponse | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fan_token_address: '',
    pool_amount: '',
    max_participants: '',
    first_place_allocation: '50',
    second_place_allocation: '30',
    third_place_allocation: '20',
    start_date: '',
    end_date: '',
  });

  const isClubAdmin = user?.role === UserRole.CLUB_ADMIN;

  useEffect(() => {
    fetchCampaigns();
  }, [activeTab]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const status = activeTab === 'all' ? undefined : activeTab;
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (activeTab === 'my' && user?.id) params.append('admin_id', user.id);

      const response = await fetch(`/api/campaigns?${params}`);
      const data: { success: boolean; data: CampaignListResponse } = await response.json();
      
      if (data.success) {
        setCampaigns(data.data.campaigns);
      } else {
        setError('Failed to fetch campaigns');
      }
    } catch (err) {
      setError('Failed to fetch campaigns');
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('You must be logged in to create campaigns');
      return;
    }

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-evm-address': user?.evm_address || '',
        },
        body: JSON.stringify({
          ...formData,
          pool_amount: parseFloat(formData.pool_amount),
          max_participants: parseInt(formData.max_participants),
          first_place_allocation: parseFloat(formData.first_place_allocation),
          second_place_allocation: parseFloat(formData.second_place_allocation),
          third_place_allocation: parseFloat(formData.third_place_allocation),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCreateDialogOpen(false);
        setFormData({
          title: '',
          description: '',
          fan_token_address: '',
          pool_amount: '',
          max_participants: '',
          first_place_allocation: '50',
          second_place_allocation: '30',
          third_place_allocation: '20',
          start_date: '',
          end_date: '',
        });
        fetchCampaigns();
      } else {
        setError(data.message || 'Failed to create campaign');
      }
    } catch (err) {
      setError('Failed to create campaign');
      console.error('Error creating campaign:', err);
    }
  };

  const handleJoinCampaign = async (campaignId: string) => {
    if (!isAuthenticated) {
      setError('You must be logged in to join campaigns');
      return;
    }

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-evm-address': user?.evm_address || '',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        fetchCampaigns();
      } else {
        setError(data.message || 'Failed to join campaign');
      }
    } catch (err) {
      setError('Failed to join campaign');
      console.error('Error joining campaign:', err);
    }
  };

  const handleActivateCampaign = async (campaignId: string) => {
    if (!isAuthenticated) {
      setError('You must be logged in to activate campaigns');
      return;
    }

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-evm-address': user?.evm_address || '',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        fetchCampaigns();
      } else {
        setError(data.message || 'Failed to activate campaign');
      }
    } catch (err) {
      setError('Failed to activate campaign');
      console.error('Error activating campaign:', err);
    }
  };

  const handleCompleteCampaign = async (campaignId: string) => {
    if (!isAuthenticated) {
      setError('You must be logged in to complete campaigns');
      return;
    }

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-evm-address': user?.evm_address || '',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        fetchCampaigns();
      } else {
        setError(data.message || 'Failed to complete campaign');
      }
    } catch (err) {
      setError('Failed to complete campaign');
      console.error('Error completing campaign:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTokenAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const CampaignCard: React.FC<{ campaignData: CampaignResponse }> = ({ campaignData }) => {
    const { campaign, leaderboard } = campaignData;
    const participationPercentage = (campaign.current_participants / campaign.max_participants) * 100;
    const isOwner = user?.id === campaign.club_admin_id;

    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{campaign.title}</CardTitle>
              <CardDescription className="mt-1">{campaign.description}</CardDescription>
            </div>
            <Badge className={getStatusColor(campaign.status)}>
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium">Pool: {formatTokenAmount(campaign.pool_amount)} tokens</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm">
                  {campaign.current_participants}/{campaign.max_participants} participants
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="text-sm">
                  {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Prize Distribution:</div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>🥇 1st Place:</span>
                  <span>{campaign.first_place_allocation}% ({formatTokenAmount(campaign.pool_amount * campaign.first_place_allocation / 100)})</span>
                </div>
                <div className="flex justify-between">
                  <span>🥈 2nd Place:</span>
                  <span>{campaign.second_place_allocation}% ({formatTokenAmount(campaign.pool_amount * campaign.second_place_allocation / 100)})</span>
                </div>
                <div className="flex justify-between">
                  <span>🥉 3rd Place:</span>
                  <span>{campaign.third_place_allocation}% ({formatTokenAmount(campaign.pool_amount * campaign.third_place_allocation / 100)})</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Participation</span>
              <span>{campaign.current_participants}/{campaign.max_participants}</span>
            </div>
            <Progress value={participationPercentage} className="h-2" />
          </div>

          {leaderboard && leaderboard.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Current Leaderboard
              </h4>
              <div className="space-y-2">
                {leaderboard.slice(0, 3).map((entry) => (
                  <div key={entry.rank} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                        {entry.rank}
                      </div>
                      <div>
                        <div className="font-medium">@{entry.tiktokProfile}</div>
                        {entry.nickname && <div className="text-sm text-gray-600">{entry.nickname}</div>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{entry.totalPoints.toFixed(1)} pts</div>
                      <div className="text-sm text-gray-600">{entry.yapCount} yaps</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator className="my-4" />

          <div className="flex gap-2 flex-wrap">
            {campaign.status === 'active' && !isOwner && (
              <Button onClick={() => handleJoinCampaign(campaign.id)} size="sm">
                Join Campaign
              </Button>
            )}
            
            {isOwner && (
              <>
                {campaign.status === 'pending' && (
                  <Button 
                    onClick={() => handleActivateCampaign(campaign.id)} 
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Activate
                  </Button>
                )}
                
                {campaign.status === 'active' && (
                  <Button 
                    onClick={() => handleCompleteCampaign(campaign.id)} 
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Complete
                  </Button>
                )}
              </>
            )}
            
            <Button variant="outline" size="sm" onClick={() => setSelectedCampaign(campaignData)}>
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading campaigns...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Fan Token Campaigns</h1>
          <p className="text-gray-600 mt-1">
            Compete for fan tokens by creating amazing TikTok content!
          </p>
        </div>
        
        {isClubAdmin && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
                <DialogDescription>
                  Set up a new fan token campaign for your community
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div>
                  <Label htmlFor="title">Campaign Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter campaign title"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your campaign..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="fan_token_address">Fan Token Address</Label>
                  <Input
                    id="fan_token_address"
                    value={formData.fan_token_address}
                    onChange={(e) => setFormData({ ...formData, fan_token_address: e.target.value })}
                    placeholder="0x..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pool_amount">Pool Amount</Label>
                    <Input
                      id="pool_amount"
                      type="number"
                      value={formData.pool_amount}
                      onChange={(e) => setFormData({ ...formData, pool_amount: e.target.value })}
                      placeholder="10000"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_participants">Max Participants</Label>
                    <Input
                      id="max_participants"
                      type="number"
                      value={formData.max_participants}
                      onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                      placeholder="100"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Prize Distribution (%)</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <div>
                      <Label htmlFor="first_place" className="text-sm">1st</Label>
                      <Input
                        id="first_place"
                        type="number"
                        value={formData.first_place_allocation}
                        onChange={(e) => setFormData({ ...formData, first_place_allocation: e.target.value })}
                        placeholder="50"
                        max="100"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="second_place" className="text-sm">2nd</Label>
                      <Input
                        id="second_place"
                        type="number"
                        value={formData.second_place_allocation}
                        onChange={(e) => setFormData({ ...formData, second_place_allocation: e.target.value })}
                        placeholder="30"
                        max="100"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="third_place" className="text-sm">3rd</Label>
                      <Input
                        id="third_place"
                        type="number"
                        value={formData.third_place_allocation}
                        onChange={(e) => setFormData({ ...formData, third_place_allocation: e.target.value })}
                        placeholder="20"
                        max="100"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Total: {
                      (parseFloat(formData.first_place_allocation) || 0) +
                      (parseFloat(formData.second_place_allocation) || 0) +
                      (parseFloat(formData.third_place_allocation) || 0)
                    }% (max 100%)
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Create Campaign</Button>
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Campaigns</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          {isClubAdmin && <TabsTrigger value="my">My Campaigns</TabsTrigger>}
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {campaigns.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
                <p className="text-gray-600">
                  {activeTab === 'all' 
                    ? "There are no campaigns available yet." 
                    : `No ${activeTab} campaigns found.`}
                </p>
                {isClubAdmin && activeTab === 'my' && (
                  <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Campaign
                  </Button>
                )}
              </div>
            ) : (
              campaigns.map((campaignData) => (
                <CampaignCard key={campaignData.campaign.id} campaignData={campaignData} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Campaigns; 