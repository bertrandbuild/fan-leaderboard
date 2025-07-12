// Mock data used for the Pull Management page

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomUsername() {
  const names = ["YapFan", "ParisLionel", "ChilizQueen", "CryptoKing", "TokenStar", "Fanatic42", "GoalMaster", "Yapster", "PSGHero", "Juventino"]
  return names[randomInt(0, names.length - 1)] + randomInt(10, 999)
}

function randomSocial(username: string) {
  return "@" + username.toLowerCase()
}

function randomStatus() {
  return Math.random() > 0.2 ? "Active" : "Inactive"
}

function randomDate(offsetHours: number) {
  const d = new Date(Date.now() + offsetHours * 3600 * 1000)
  return d.toISOString().slice(0, 16).replace("T", " ")
}

export function generateMockPullData() {
  // Pool active
  const now = new Date()
  const poolId = `pool-${randomInt(100, 999)}`
  const clubPools = [
    {
      id: poolId,
      name: `PSG Pool ${now.getMonth() + 1}/${now.getFullYear()}`,
      start: randomDate(-1),
      end: randomDate(1),
      amount: randomInt(500_000, 2_000_000),
      status: "Ongoing",
      scope: "Season Kickoff"
    },
  ]
  // Participants
  const poolParticipants = Array.from({ length: randomInt(3, 8) }, (_, i) => {
    const username = randomUsername()
    return {
      id: `user-${i + 1}`,
      username,
      social: randomSocial(username),
      status: randomStatus(),
    }
  })
  // Classement
  const poolRanking = poolParticipants
    .map(u => ({
      id: u.id,
      username: u.username,
      yaps: randomInt(50, 200),
      points: randomInt(1000, 5000),
    }))
    .sort((a, b) => b.points - a.points)
  // Historique
  const poolsHistory = [
    {
      id: `pool-${randomInt(1, 99)}`,
      name: `PSG Pool ${now.getMonth()}/2024`,
      start: randomDate(-48),
      end: randomDate(-47),
      status: "Finished",
      scope: "Summer Event"
    },
  ]
  // Logs
  const logs = [
    { time: "10:01", msg: "Pool created by admin" },
    { time: "10:05", msg: `${poolParticipants[0]?.username} joined the pool` },
    { time: "10:10", msg: `${poolParticipants[1]?.username} joined the pool` },
    { time: "10:15", msg: `${poolParticipants[2]?.username} joined the pool` },
    { time: "10:30", msg: "Additional liquidity injected" },
    { time: "10:45", msg: "Ranking exported" },
  ]
  return { clubPools, poolParticipants, poolRanking, poolsHistory, logs }
}

// Default values for initial state
const { clubPools, poolParticipants, poolRanking, poolsHistory, logs } = generateMockPullData()
export { clubPools, poolParticipants, poolRanking, poolsHistory, logs } 