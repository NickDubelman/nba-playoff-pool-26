import {
  db,
  eq,
  NBAGame,
  NBAPlayer,
  NBAPlayerGameStats,
  NBATeam,
  Participant,
} from 'astro:db'

export default async function getGameStats() {
  const stats = await db
    .select()
    .from(NBAPlayerGameStats)
    .innerJoin(NBAPlayer, eq(NBAPlayer.id, NBAPlayerGameStats.playerId))
    .innerJoin(NBATeam, eq(NBATeam.id, NBAPlayer.teamId))
    .innerJoin(NBAGame, eq(NBAGame.id, NBAPlayerGameStats.gameId))
    .leftJoin(Participant, eq(Participant.id, NBAPlayer.participantId))

  return stats.map((stat) => ({
    player: stat.NBAPlayer.name,
    team: stat.NBATeam.shortName,
    points: stat.NBAPlayerGameStats.points,
    minutes: stat.NBAPlayerGameStats.minutes,
    game: stat.NBAGame,
    participant: stat.Participant?.name || null,
  }))
}
