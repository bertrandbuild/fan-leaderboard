import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, ExternalLink, Star, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { telegramGroups } from "@/data/telegram";
import type { TikTokProfile, RankingResponse } from "@/types/social";
import {
  fetchSeedAccounts,
  manageSeedAccount,
  fetchRanking,
  calculateRanking,
} from "@/lib/socialApi";
import { toast } from "@/components/ui/use-toast";

export function SocialManager() {
  // State
  const [celebrities, setCelebrities] = useState<TikTokProfile[]>([]);
  const [selectedCeleb, setSelectedCeleb] = useState<TikTokProfile | null>(
    null
  );
  const [editWeight, setEditWeight] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCeleb, setNewCeleb] = useState({
    name: "",
    handle: "",
    team: "",
    weight: 10,
  });
  const [rankingInfo, setRankingInfo] = useState<RankingResponse | null>(null);

  useEffect(() => {
    fetchSeedAccounts()
      .then((data) => setCelebrities(data.profiles))
      .catch((err) => console.error(err));
  }, []);

  // Handle selection/edit
  function handleSelectCeleb(celeb: TikTokProfile) {
    // Toujours prendre la version fraîche depuis celebrities
    const fresh = celebrities.find((c) => c.unique_id === celeb.unique_id);
    if (fresh) {
      setSelectedCeleb(fresh);
      setEditWeight(String(fresh.rank_score.toFixed(2)));
    }
  }

  useEffect(() => {
    if (!selectedCeleb) {
      setRankingInfo(null);
      return;
    }
    fetchRanking(selectedCeleb.unique_id)
      .then((data) => setRankingInfo(data))
      .catch((err) => console.error(err));
  }, [selectedCeleb]);

  async function handleSaveWeight() {
    if (selectedCeleb) {
      try {
        const data = await calculateRanking(selectedCeleb.unique_id);
        setRankingInfo(data);
        toast({
          title: "Ranking calculated",
          description: `${selectedCeleb.unique_id} updated!`,
        });
      } catch (err) {
        console.error(err);
        toast({ title: "Error", description: "Failed to calculate ranking" });
      }
    }
  }

  async function handleAddCeleb(e: React.FormEvent) {
    e.preventDefault();
    if (!newCeleb.name || !newCeleb.handle || !newCeleb.team) return;
    try {
      await manageSeedAccount(newCeleb.handle, "add");
      const data = await fetchSeedAccounts();
      setCelebrities(data.profiles);
      setNewCeleb({ name: "", handle: "", team: "", weight: 10 });
      setShowAddForm(false);
      toast({
        title: "Celebrity added",
        description: `${newCeleb.name} added!`,
      });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to add celebrity" });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-6 h-6 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">
            Available Telegram Groups
          </h1>
        </div>
        <p className="text-slate-400">
          Access exclusive groups based on your fan tokens
        </p>
      </div>

      {/* ----- TOP: Groups & Access Link Generator ----- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Groups */}
        <Card className="bg-slate-800 border-slate-700 flex flex-col h-full">
          <CardHeader>
            <CardTitle className="text-white text-lg md:text-xl">
              Groups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {telegramGroups.map((group, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-700 rounded-lg p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-white font-semibold">
                      {group.name}
                    </span>
                    <Badge
                      className={`${group.badgeColor} text-white ml-0 sm:ml-2`}
                    >
                      {group.badge}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-xs">{group.members}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-slate-300 text-xs break-all">
                      {group.link}
                    </span>
                    {group.access === "locked" ? (
                      <Button
                        variant="outline"
                        disabled
                        className="border-slate-600 text-slate-500 bg-transparent"
                      >
                        Locked
                      </Button>
                    ) : (
                      <Button
                        asChild
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <a
                          href={group.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Join
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Access Link Generator */}
        <Card className="bg-slate-800 border-slate-700 flex flex-col h-full">
          <CardHeader>
            <CardTitle className="text-white text-lg md:text-xl">
              Access Link Generator
            </CardTitle>
            <p className="text-slate-400 text-sm">
              Create a custom link for Telegram access
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">
                  Select Team
                </label>
                <Select>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Choose a team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="psg">Paris Saint-Germain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">
                  Validity Duration
                </label>
                <Select>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hour</SelectItem>
                    <SelectItem value="24h">24 hours</SelectItem>
                    <SelectItem value="7d">7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-4 mt-2">
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 bg-transparent"
                >
                  Preview
                </Button>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  Generate Link
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ----- BOTTOM: Active Celebrities (full width) ----- */}
      <Card className="bg-slate-800 border-slate-700 flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <CardTitle className="text-white">Active Celebrities</CardTitle>
            </div>
            <Button
              size="icon"
              className="bg-yellow-600 hover:bg-yellow-500 text-white"
              onClick={() => setShowAddForm((v) => !v)}
              aria-label="Add Celebrity"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-slate-400 text-sm">
            Personalities boosting tweets
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Add Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddCeleb}
              className="bg-slate-700 rounded-lg p-4 mb-2 space-y-2"
            >
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Name"
                  value={newCeleb.name}
                  onChange={(e) =>
                    setNewCeleb((v) => ({ ...v, name: e.target.value }))
                  }
                  className="bg-slate-800 border-slate-600 text-white"
                />
                <Input
                  value={newCeleb.handle}
                  onChange={(e) =>
                    setNewCeleb((v) => ({ ...v, handle: e.target.value }))
                  }
                  placeholder="Handle"
                  className="bg-slate-800 border-slate-600 text-white"
                />
                <Input
                  placeholder="Team"
                  value={newCeleb.team}
                  onChange={(e) =>
                    setNewCeleb((v) => ({ ...v, team: e.target.value }))
                  }
                  className="bg-slate-800 border-slate-600 text-white"
                />
                <Input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="Weight"
                  value={newCeleb.weight}
                  onChange={(e) =>
                    setNewCeleb((v) => ({
                      ...v,
                      weight: Number(e.target.value),
                    }))
                  }
                  className="bg-slate-800 border-slate-600 text-white w-20"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  Add
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-600 text-slate-300 bg-transparent"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Listing */}
          {celebrities.map((celeb, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors
              ${
                selectedCeleb && selectedCeleb.unique_id === celeb.unique_id
                  ? "border-2 border-yellow-500 bg-slate-800/70"
                  : ""
              }`}
              onClick={() => handleSelectCeleb(celeb)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-orange-500 text-white text-xs">
                    {celeb.nickname ||
                      celeb.unique_id
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-white font-medium text-sm hover:text-orange-400 transition-colors">
                    {celeb.nickname}
                  </div>
                  <div className="text-slate-400 text-xs">
                    {celeb.unique_id}
                  </div>
                </div>
              </div>
              <Badge className="bg-yellow-600 text-white text-xs">
                Score: {celeb.rank_score.toFixed(2)}
              </Badge>
            </div>
          ))}

          {/* Edition de célébrité */}
          {selectedCeleb && (
            <div className="mt-4 bg-slate-700 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-orange-500 text-white text-xs">
                    {selectedCeleb.nickname ||
                      selectedCeleb.unique_id
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-white font-medium text-sm">
                    {selectedCeleb.nickname || selectedCeleb.unique_id}
                  </div>
                  <div className="text-slate-400 text-xs">
                    {selectedCeleb.unique_id}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-slate-300 text-xs font-medium mb-1 block">
                  Boost weight
                </label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={editWeight}
                  onChange={(e) => setEditWeight(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                />
                 {rankingInfo && (
                  <p className="text-slate-300 text-xs mt-1">Score: {rankingInfo.ranking.rank_score.toFixed(2)}</p>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={handleSaveWeight}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-2 border-slate-600 text-slate-300 bg-transparent"
                  onClick={() => {
                    setSelectedCeleb(null);
                    setEditWeight("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
