import { useState, useEffect } from "react";
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
// Simule des données (adapte selon ton projet réel)
import {
  clubPools,
  poolParticipants,
  poolRanking,
  poolsHistory,
  logs,
} from "@/data/pull";

function formatDuration(ms: number) {
  if (ms <= 0) return "Terminé";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h > 0 ? h + "h " : ""}${m}m ${s}s`;
}

export function PullAdminPage() {
  // Pool actif
  const [now, setNow] = useState(Date.now());
  const [showCreate, setShowCreate] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  // Utilise la première pool active du mock
  const pool = clubPools[0];
  const end = new Date(pool.end).getTime();
  const start = new Date(pool.start).getTime();
  const progress = Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeLeft = end - now;
  const poolActive = timeLeft > 0;

  function handleCreatePool() {
    setShowCreate(true);
  }
  function handlePoolCreated() {
    setShowCreate(false);
    setToastMsg("Pool créée avec succès !");
    setTimeout(() => setToastMsg(null), 2000);
  }
  function handleExportRanking() {
    setToastMsg("Classement exporté en CSV !");
    setTimeout(() => setToastMsg(null), 1800);
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
            Gestion de la Pull{" "}
            <span className="text-orange-400">– Paris Saint-Germain</span>
          </h1>
          <p className="text-slate-400">
            Administration de la liquidité et des participants
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={handleCreatePool}
          >
            <Plus className="w-4 h-4 mr-2" /> Créer une Pull
          </Button>
          <Button
            variant="outline"
            className="border-slate-600 text-orange-400 hover:bg-orange-900/30"
          >
            Injecter liquidité
          </Button>
        </div>
      </div>

      {/* POOL ACTIF */}
      <Card className="bg-slate-800 border-slate-700 mb-4">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Timer className="w-5 h-5 text-yellow-400" />
            <CardTitle className="text-white text-lg">Pool active</CardTitle>
            <Badge className={poolActive ? "bg-green-500" : "bg-slate-500"}>
              {poolActive ? "En cours" : "Terminée"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="text-slate-300">
                Montant injecté :{" "}
                <span className="text-white font-bold">{pool.amount.toLocaleString()} fan token</span>
              </div>
              <div className="text-slate-300">
                Début : <span className="text-white">{pool.start}</span>
              </div>
              <div className="text-slate-300">
                Fin : <span className="text-white">{pool.end}</span>
              </div>
              <div className="text-slate-300">
                Consommé :{" "}
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
                  Clôturer la pull
                </Button>
              )}
            </div>
          </div>
          {/* Historique Pools Passés */}
          <Accordion type="single" collapsible className="mt-4">
            <AccordionItem value="historique">
              <AccordionTrigger>
                <History className="w-4 h-4 mr-2 text-cyan-400" />
                Historique des pools passés
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2">
                  {poolsHistory.map((pool) => (
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
                      </div>
                      <Badge
                        className={
                          pool.status === "Terminée"
                            ? "bg-slate-500"
                            : "bg-green-500"
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
              <CardTitle className="text-white">
                Utilisateurs participants
              </CardTitle>
            </div>
            <p className="text-slate-400 text-sm">
              Liste des participants à la pull
            </p>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-y-auto flex flex-col gap-3">
              {poolParticipants.map(u => (
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
                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-400 px-2 py-0.5">Voir</Button>
                  </div>
                </div>
              ))}
              {poolParticipants.length === 0 && (
                <div className="text-slate-400 italic text-center">
                  Aucun utilisateur inscrit
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
              <CardTitle className="text-white">
                Classement de la Pull
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                className="ml-auto border-slate-600 text-slate-300"
                onClick={handleExportRanking}
              >
                <FileDown className="w-4 h-4 mr-2" /> Exporter CSV
              </Button>
            </div>
            <p className="text-slate-400 text-sm">
              Classement dynamique des yappers
            </p>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-y-auto flex flex-col gap-2">
              {poolRanking.map((u, i) => (
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
              {poolRanking.length === 0 && (
                <div className="text-slate-400 italic text-center">
                  Aucun classement pour cette pull
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
            <CardTitle className="text-white">
              Logs / Historique d’activité
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-44 overflow-y-auto flex flex-col gap-2 text-xs text-slate-400">
            {logs.map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="font-bold text-slate-300">{l.time}</span>
                <span>{l.msg}</span>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="italic">Aucune activité récente</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* MODALE de création de pool (exemple simplifié) */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-2xl p-8 max-w-sm w-full shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-white mb-2">
              Créer une nouvelle Pull
            </h2>
            <Input
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="Montant du pool"
            />
            <Input
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="Date de début"
              type="datetime-local"
            />
            <Input
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="Date de fin"
              type="datetime-local"
            />
            <div className="flex gap-2 mt-2">
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
                onClick={handlePoolCreated}
              >
                Créer
              </Button>
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 flex-1"
                onClick={() => setShowCreate(false)}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
