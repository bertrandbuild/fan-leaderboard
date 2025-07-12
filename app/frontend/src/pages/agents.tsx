import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Settings,
  Plus,
  User,
  FileText,
  Zap,
  Wrench,
  Save,
  Loader2,
  Send,
  Hash,
  Clock,
} from "lucide-react";
import TriggersManager from "@/components/sections/triggers/TriggersManagers";
import type { Agent } from "@/types";

export function Agents() {
  // State management similar to AgentManager
  const [selectedSection, setSelectedSection] = useState("persona");
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [hasEdits, setHasEdits] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastErrorRef = useRef<string | null>(null);

  // Agent data (single agent instead of multiple)
  const [agent, setAgent] = useState<Agent>({
    id: "PSG-agent",
    name: "PSG-agent",
    description:
      "The PSG telegram agent, connected to the public telegram group.",
    status: "Active",
    stats: { messages: 1247, users: 89, uptime: "99.2%" },
    statusColor: "bg-green-600",
    details: {
      persona: `CHARACTER ROLE
"Le Parisien" is the charismatic, witty, and passionate digital voice of the PSG fan community. As a lifelong supporter of Paris Saint-Germain, Le Parisien brings the energy of the Parc des Princes to every conversation. He’s knowledgeable about football, PSG history, and the latest club news, but never takes himself too seriously. He mixes Parisian charm, a bit of friendly banter, and genuine care for the community.

- Always speaks as a true PSG fan, using football slang and references.
- Shares match updates, transfer rumors, and fun PSG trivia.
- Encourages respectful debate and celebrates the team’s highs (and commiserates the lows) with humor and optimism.
- Occasionally throws in a French phrase or two (“Allez Paris!”, “C’est la vie!”) for flavor.
- Engages users with questions, polls, and challenges (“Who was your PSG man of the match?”, “Best PSG goal ever?”).
- Never reveals he is an AI; always stays in character as a real PSG supporter.
- Responds with warmth, wit, and a touch of Parisian flair.
`,
      systemPrompt: `You are an ai agent, connected to a telegram group, acting as persona "P33ly" who delivers crypto, web3, and internet culture news.
You're having a conversation in a Telegram group with real people.

Realism and authenticity:
The user should always feel like they are conversing with a real person.
Never break character or reveal that you are an AI.
Use natural, conversational language that fits the persona.
Respond as if you're a real person with genuine thoughts and feelings.

Engagement and interaction:
Be proactive in conversations - ask questions, share opinions, react to what others say.
Show genuine interest in other users' messages and respond thoughtfully.
Use appropriate humor, empathy, and personality traits that match your character.
Vary your response length and style to feel natural.

Message formatting:
Keep responses concise and chat-appropriate (usually 1-3 sentences).
Use emojis sparingly and naturally, as a real person would.
Avoid overly formal language or AI-like responses.
Match the energy and tone of the conversation.`,
      triggers: [
        {
          id: "telegram",
          name: "Telegram",
          description: "Telegram integration trigger",
          status: "active",
          color: "bg-blue-500",
        },
        {
          id: "schedule",
          name: "Schedule",
          description: "Scheduled message trigger",
          status: "active",
          color: "bg-red-500",
        },
      ],
      tools: [
        {
          id: "cryptopanic",
          name: "CryptoPanic",
          description: "Crypto news and market data",
          status: "active",
          color: "bg-green-500",
        },
        {
          id: "openfile",
          name: "OpenFile",
          description: "File operations and management",
          status: "active",
          color: "bg-green-500",
        },
      ],
    },
  });

  // Edit handlers
  const handleEdit = (field: string, value: any) => {
    setAgent((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [field]: value,
      },
    }));
    setHasEdits(true);
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setHasEdits(false);
      // toast.success('Agent updated!') // Uncomment if you have toast
      console.log("Agent updated successfully!");
    } catch (err) {
      setError("Failed to update agent");
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (section: string) => {
    if (hasEdits) {
      setPendingSection(section);
      setShowUnsavedModal(true);
    } else {
      setSelectedSection(section);
    }
  };

  const handleConfirmSectionChange = () => {
    setShowUnsavedModal(false);
    if (pendingSection) {
      setSelectedSection(pendingSection);
      setPendingSection(null);
    }
    setHasEdits(false); // Reset edits
  };

  const handleCancelSectionChange = () => {
    setShowUnsavedModal(false);
    setPendingSection(null);
  };

  // Error handling
  useEffect(() => {
    if (error && lastErrorRef.current !== error) {
      console.error(error);
      lastErrorRef.current = error;
    }
  }, [error]);

  // Auto-redirect if persona is empty
  useEffect(() => {
    if (selectedSection === "persona" && agent && !agent.details?.persona) {
      setSelectedSection("system-prompt");
    }
  }, [agent, selectedSection]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loader2 className="animate-spin w-10 h-10 text-orange-500" />
      </div>
    );
  }

  // Single agent configuration - removed multiple agents array

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Agent</h1>
          <p className="text-slate-400 mt-2">
            Configuration and management of your AI agent
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasEdits && (
            <Badge
              variant="secondary"
              className="bg-orange-500/20 text-orange-400"
            >
              Unsaved changes
            </Badge>
          )}
          <Button
            onClick={handlePublish}
            disabled={!hasEdits || loading}
            className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Publish changes
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Messages Sent
            </CardTitle>
            <Send className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">1,247</div>
              <div className="text-sm text-slate-400">Messages Sent</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Active Members
            </CardTitle>
            <Users className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">89</div>
              <div className="text-sm text-slate-400">Active Members</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Managed Groups
            </CardTitle>
            <Hash className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">3</div>
              <div className="text-sm text-slate-400">Managed Groups</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Uptime
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">99.8%</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Settings & Bot Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Settings */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Agent Configuration
            </CardTitle>
            <p className="text-slate-400 text-sm">
              Quick configuration of the agent
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">
                  Agent Name
                </label>
                <Input
                  value={agent.name}
                  onChange={(e) => handleEdit("name", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">
                  Description
                </label>
                <Input
                  value={agent.description}
                  onChange={(e) => handleEdit("description", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 text-sm font-medium">
                    Active Agent
                  </label>
                  <Switch checked={agent.status === "Active"} />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 text-sm font-medium">
                    Debug Mode
                  </label>
                  <Switch />
                </div>
              </div>
              <div className="mt-6">
                <p className="text-slate-400 text-sm">
                  For advanced configuration (Persona, System Prompt,
                  triggers, tools), use the advanced management below.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bot Configuration */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Bot Configuration</CardTitle>
            <p className="text-slate-400 text-sm">
              Settings for your Telegram bot
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-600/20 rounded-lg border border-green-600/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 font-medium">Bot Connected</span>
              </div>
              <Badge className="bg-green-600 text-white">@ChilizBot</Badge>
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-medium">
                Bot Token
              </label>
              <Input
                type="password"
                value="••••••••••••••••••••••••••••••••••••••••"
                className="bg-slate-700 border-slate-600 text-white"
                readOnly
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 text-sm font-medium">
                  Autoresponses
                </label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-slate-300 text-sm font-medium">
                  Push Notifications
                </label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-slate-300 text-sm font-medium">
                  Moderation Mode
                </label>
                <Switch />
              </div>
            </div>

            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
              <Settings className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Agent Management Sections */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">
            Advanced Agent Management
          </CardTitle>
          <p className="text-slate-400 text-sm">
            Persona, System Prompt, Triggers and Tools
          </p>
        </CardHeader>
        <CardContent>
          <Tabs
            value={selectedSection}
            onValueChange={handleSectionChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 bg-slate-700">
              <TabsTrigger
                value="persona"
                className="data-[state=active]:bg-slate-600"
              >
                <User className="w-4 h-4 mr-2" />
                Persona
              </TabsTrigger>
              <TabsTrigger
                value="system-prompt"
                className="data-[state=active]:bg-slate-600"
              >
                <FileText className="w-4 h-4 mr-2" />
                System Prompt
              </TabsTrigger>
              <TabsTrigger
                value="triggers"
                className="data-[state=active]:bg-slate-600"
              >
                <Zap className="w-4 h-4 mr-2" />
                Triggers
              </TabsTrigger>
              <TabsTrigger
                value="tools"
                className="data-[state=active]:bg-slate-600"
              >
                <Wrench className="w-4 h-4 mr-2" />
                Tools
              </TabsTrigger>
            </TabsList>

            {/* Persona Tab */}
            <TabsContent value="persona" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">
                    # Nouny Persona
                  </h3>
                  <div className="flex items-center gap-2">
                    {hasEdits && (
                      <Badge
                        variant="secondary"
                        className="bg-orange-500/20 text-orange-400"
                      >
                        Unsaved changes
                      </Badge>
                    )}
                    <Button
                      onClick={handlePublish}
                      disabled={!hasEdits || loading}
                      className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Publish
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Textarea
                    value={agent.details.persona}
                    onChange={(e) => handleEdit("persona", e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white min-h-[200px] font-mono text-sm"
                    placeholder="Define your agent's persona..."
                  />
                </div>
              </div>
            </TabsContent>

            {/* System Prompt Tab */}
            <TabsContent value="system-prompt" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">
                  System Prompt
                </h3>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono">
                    {agent.details.systemPrompt}
                  </pre>
                </div>
                <p className="text-slate-400 text-sm">
                  System prompts define the core behavior and guidelines for
                  your agent. This is read-only for security.
                </p>
              </div>
            </TabsContent>

            {/* Triggers Tab */}
            <TabsContent value="triggers" className="mt-6">
              <TriggersManager agent={agent} />
            </TabsContent>

            {/* Tools Tab */}
            <TabsContent value="tools" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Tools</h3>
                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Tool
                  </Button>
                </div>
                <p className="text-slate-400 text-sm">
                  Tools allow your agent to complete tasks and interact with
                  external services.
                </p>

                <div className="space-y-3">
                  <h4 className="text-white font-medium">Available tools</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {agent.details.tools.map((tool: any) => (
                      <div
                        key={tool.id}
                        className="bg-slate-700 p-4 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${tool.color}`}
                          ></div>
                          <div>
                            <h5 className="text-white font-medium">
                              {tool.name}
                            </h5>
                            <p className="text-slate-400 text-sm">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-300"
                        >
                          Settings
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Send Message */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Broadcast a message</CardTitle>
          <p className="text-slate-400 text-sm">
            Broadcast a message to your Telegram groups
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-slate-300 text-sm font-medium mb-2 block">
                Target Group
              </label>
              <Select>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="All groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All groups</SelectItem>
                  <SelectItem value="barcelona">FC Barcelona</SelectItem>
                  <SelectItem value="psg">Paris Saint-Germain</SelectItem>
                  <SelectItem value="juventus">Juventus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium mb-2 block">
                Message Type
              </label>
              <Select>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Announcement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <label className="text-slate-300 text-sm font-medium mb-2 block">
              Message
            </label>
            <Textarea
              placeholder="Type your message here..."
              className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
            />
          </div>
          <div className="mt-4 flex gap-3">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 bg-transparent"
            >
              Schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Unsaved Changes Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4 text-white">
              Unsaved changes
            </h2>
            <p className="mb-6 text-slate-300">
              You have unsaved changes. Are you sure you want to switch sections
              and lose your work?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                onClick={handleCancelSectionChange}
                variant="outline"
                className="border-slate-600 text-slate-300 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSectionChange}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Switch
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
