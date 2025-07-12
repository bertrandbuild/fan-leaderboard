import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Users, Timer, BarChart, History, FileDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// Mock data used for the demo
import {
  clubPools,
  poolParticipants,
  poolRanking,
  poolsHistory,
  logs,
} from "@/data/pool";

function formatDuration(ms: number) {
  if (ms <= 0) return 'Finished'
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h > 0 ? h + "h " : ""}${m}m ${s}s`;
}

export function PoolAdminPage() {
  const { isConnected, connectWallet } = useWallet()
  const [now, setNow] = useState(Date.now())
  const [showCreate, setShowCreate] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const [pools, setPools] = useState(clubPools)
  const [activePool, setActivePool] = useState(clubPools[0])
  const [participants, setParticipants] = useState(poolParticipants)
  const [ranking, setRanking] = useState(poolRanking)
  const [history, setHistory] = useState(poolsHistory)
  const [logItems,] = useState(logs)

  const [newAmount, setNewAmount] = useState('')
  const [newStart, setNewStart] = useState('')
  const [newEnd, setNewEnd] = useState('')
  const [newScope, setNewScope] = useState('')
  const [winnerCount, setWinnerCount] = useState(3)
  const [prize1, setPrize1] = useState('')
  const [prize2, setPrize2] = useState('')
  const [prize3, setPrize3] = useState('')

  const end = new Date(activePool.end).getTime()
  const start = new Date(activePool.start).getTime()
  const progress = Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)))

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const timeLeft = end - now
  const poolActive = timeLeft > 0

  function handleCreatePool() {
    setShowCreate(true)
  }

  function handlePoolCreated(newPool: any) {
    setPools([newPool, ...pools])
    setActivePool(newPool)
    setHistory([newPool, ...history])
    setShowCreate(false)
    setToastMsg('Pool created successfully!')
    setTimeout(() => setToastMsg(null), 2000)
  }

  function handleExportRanking() {
    setToastMsg('Ranking exported to CSV!')
    setTimeout(() => setToastMsg(null), 1800)
  }

  function handleInjectLiquidity() {
    if (!isConnected) {
      setToastMsg('Please connect your wallet first')
      connectWallet()
    } else {
      setToastMsg('Liquidity injected!')
    }
    setTimeout(() => setToastMsg(null), 2000)
  }

  function removeParticipant(id: string) {
    setParticipants(prev => prev.filter(p => p.id !== id))
    setRanking(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Toast de feedback UX */}
      {toastMsg && (
        <div className="fixed top-4 right-4 bg-orange-600 text-white px-4 py-2 rounded-lg shadow-xl z-50 animate-pulse">
          {toastMsg}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Campaign Management <span className="text-orange-400">– Paris Saint-Germain</span>
          </h1>
          <p className="text-slate-400">Manage liquidity and participants</p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={handleCreatePool}
          >
            <Plus className="w-4 h-4 mr-2" /> Create Campaign
          </Button>
          <Button
            variant="outline"
            className="border-slate-600 text-orange-400 hover:bg-orange-900/30"
            onClick={handleInjectLiquidity}
          >
            Inject Liquidity
          </Button>
        </div>
      </div>

      {/* ACTIVE POOL */}
      <Card className="bg-slate-800 border-slate-700 mb-4">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Timer className="w-5 h-5 text-yellow-400" />
            <CardTitle className="text-white text-lg">Active Campaign</CardTitle>
            <Badge className={poolActive ? "bg-green-500" : "bg-slate-500"}>
              {poolActive ? "Ongoing" : "Finished"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="text-slate-300">
                Injected amount:{" "}
                <span className="text-white font-bold">{activePool.amount.toLocaleString()} fan token</span>
              </div>
              <div className="text-slate-300">Start: <span className="text-white">{activePool.start}</span></div>
              <div className="text-slate-300">End: <span className="text-white">{activePool.end}</span></div>
              <div className="text-slate-300">Scope: <span className="text-white">{activePool.scope}</span></div>
              <div className="text-slate-300">
                Used:{" "}
                <span className="text-orange-300 font-bold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-slate-700" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-yellow-400" />
                <span
                  className={`text-lg font-bold ${
                    poolActive ? "text-yellow-400" : "text-slate-500"
                  }`}
                >
                  {formatDuration(timeLeft)}
                </span>
              </div>
              {poolActive && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-600 text-orange-400"
                >
                  Close campaign
                </Button>
              )}
            </div>
          </div>
          {/* Past Pools History */}
          <Accordion type="single" collapsible className="mt-4">
            <AccordionItem value="history">
              <AccordionTrigger>
                <History className="w-4 h-4 mr-2 text-cyan-400" />
                Previous campaigns history
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2">
                  {history.map((pool) => (
                    <div
                      key={pool.id}
                      className="flex items-center justify-between bg-slate-700 rounded-lg p-2"
                    >
                      <div>
                        <span className="text-white font-semibold">
                          {pool.name}
                        </span>
                        <span className="text-slate-400 text-xs ml-2">
                          {pool.start} → {pool.end}
                        </span>
                        <span className="text-slate-400 text-xs ml-2">{pool.scope}</span>
                      </div>
                      <Badge
                        className={
                          pool.status === 'Finished'
                            ? 'bg-slate-500'
                            : 'bg-green-500'
                        }
                      >
                        {pool.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* GRILLE PARTICIPANTS + CLASSEMENT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Participants */}
        <Card className="bg-slate-800 border-slate-700 flex flex-col h-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <CardTitle className="text-white">Campaign Participants</CardTitle>
            </div>
            <p className="text-slate-400 text-sm">List of users in the campaign</p>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-y-auto flex flex-col gap-3">
              {participants.map(u => (
                <div key={u.id} className="flex items-center justify-between bg-slate-700 rounded-lg p-2 hover:bg-slate-600 transition">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8"><AvatarFallback>{u.username.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                    <div>
                      <div className="text-white font-medium">{u.username}</div>
                      <div className="text-slate-400 text-xs">{u.social}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-cyan-600 text-white text-xs">{u.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => removeParticipant(u.id)} className="border-slate-600 text-slate-400 px-2 py-0.5">Delete</Button>
                  </div>
                </div>
              ))}
              {participants.length === 0 && (
                <div className="text-slate-400 italic text-center">
                  No user registered
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Classement */}
        <Card className="bg-slate-800 border-slate-700 flex flex-col h-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart className="w-5 h-5 text-green-400" />
              <CardTitle className="text-white">Campaign Ranking</CardTitle>
              <Button
                size="sm"
                variant="outline"
                className="ml-auto border-slate-600 text-slate-300"
                onClick={handleExportRanking}
              >
                <FileDown className="w-4 h-4 mr-2" /> Export CSV
              </Button>
            </div>
            <p className="text-slate-400 text-sm">Dynamic ranking of yappers</p>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-y-auto flex flex-col gap-2">
              {ranking.map((u, i) => (
                <div
                  key={u.id}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    i === 0
                      ? "bg-yellow-700"
                      : i === 1
                      ? "bg-gray-700"
                      : i === 2
                      ? "bg-orange-800"
                      : "bg-slate-700"
                  } hover:bg-slate-600 transition`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold w-6 text-center">
                      {i + 1}
                    </span>
                    <Avatar className="w-7 h-7">
                      <AvatarFallback>
                        {u.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-white">{u.username}</div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-slate-400 text-xs">
                      Yaps:{" "}
                      <span className="text-white font-bold">{u.yaps}</span>
                    </div>
                    <div className="text-green-400 text-xs">
                      Points: <span className="font-bold">{u.points}</span>
                    </div>
                  </div>
                </div>
              ))}
              {ranking.length === 0 && (
                <div className="text-slate-400 italic text-center">
                  No ranking for this campaign
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* LOGS / HISTORIQUE (optionnel) */}
      <Card className="bg-slate-800 border-slate-700 flex flex-col mt-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <CardTitle className="text-white">Logs / Activity History</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-44 overflow-y-auto flex flex-col gap-2 text-xs text-slate-400">
            {logItems.map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="font-bold text-slate-300">{l.time}</span>
                <span>{l.msg}</span>
              </div>
            ))}
            {logItems.length === 0 && (
              <div className="italic">No recent activity</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CREATE POOL MODAL */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-2xl p-8 max-w-sm w-full shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-white mb-2">
              Create a new Pool
            </h2>
            <Input
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="Pool amount"
              value={newAmount}
              onChange={e => setNewAmount(e.target.value)}
            />
            <Input
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="Start date"
              type="datetime-local"
              value={newStart}
              onChange={e => setNewStart(e.target.value)}
            />
            <Input
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="End date"
              type="datetime-local"
              value={newEnd}
              onChange={e => setNewEnd(e.target.value)}
            />
            <Input
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="Scope description"
              value={newScope}
              onChange={e => setNewScope(e.target.value)}
            />
            <Input
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="Number of winners"
              type="number"
              value={winnerCount}
              onChange={e => setWinnerCount(parseInt(e.target.value))}
            />
            <Input
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="Prize for 1st place"
              value={prize1}
              onChange={e => setPrize1(e.target.value)}
            />
            <Input
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="Prize for 2nd place"
              value={prize2}
              onChange={e => setPrize2(e.target.value)}
            />
            <Input
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="Prize for 3rd place"
              value={prize3}
              onChange={e => setPrize3(e.target.value)}
            />
            <div className="flex gap-2 mt-2">
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
                onClick={() =>
                  handlePoolCreated({
                    id: `pool-${Date.now()}`,
                    name: `Custom Pool`,
                    amount: parseFloat(newAmount) || 0,
                    start: newStart,
                    end: newEnd,
                    scope: newScope,
                    status: 'Ongoing',
                    winnerCount,
                    prizes: [prize1, prize2, prize3]
                  })
                }
              >
                Create
              </Button>
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 flex-1"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
