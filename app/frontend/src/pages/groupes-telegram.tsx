import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, ExternalLink } from "lucide-react"
import { telegramGroups } from "@/data/telegram"

export function SocialManager() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-6 h-6 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Available Telegram Groups</h1>
        </div>
        <p className="text-slate-400">Access exclusive groups based on your fan tokens</p>
      </div>

      {/* Responsive Split Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Groups Card */}
        <Card className="bg-slate-800 border-slate-700 flex flex-col h-full">
          <CardHeader>
            <CardTitle className="text-white text-lg md:text-xl">Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {telegramGroups.map((group, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-700 rounded-lg p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-white font-semibold">{group.name}</span>
                    <Badge className={`${group.badgeColor} text-white ml-0 sm:ml-2`}>{group.badge}</Badge>
                  </div>
                  <p className="text-slate-400 text-xs">{group.members}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-slate-300 text-xs break-all">{group.link}</span>
                    {group.access === "locked" ? (
                      <Button variant="outline" disabled className="border-slate-600 text-slate-500 bg-transparent">
                        Locked
                      </Button>
                    ) : (
                      <Button
                        asChild
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <a href={group.link} target="_blank" rel="noopener noreferrer">
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

        {/* Access Link Generator Card */}
        <Card className="bg-slate-800 border-slate-700 flex flex-col h-full">
          <CardHeader>
            <CardTitle className="text-white text-lg md:text-xl">Access Link Generator</CardTitle>
            <p className="text-slate-400 text-sm">Create a custom link for Telegram access</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Select Team</label>
                <Select>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Choose a team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="psg">Paris Saint-Germain</SelectItem>
                    <SelectItem value="barca">FC Barcelona</SelectItem>
                    <SelectItem value="juventus">Juventus</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Validity Duration</label>
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
                <Button variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                  Preview
                </Button>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">Generate Link</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
