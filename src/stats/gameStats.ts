import {
  db,
  eq,
  inArray,
  NBAGame,
  NBAPlayer,
  NBAPlayerGameStats,
  NBATeam,
  Participant,
} from 'astro:db'
import { type Matchup, getMatchupGameIds } from './matchupUtils'

export type GameStat = Awaited<ReturnType<typeof getGameStats>>[number]

export default async function getGameStats(matchups?: Matchup[]) {
  const baseQuery = db
    .select()
    .from(NBAPlayerGameStats)
    .innerJoin(NBAPlayer, eq(NBAPlayer.id, NBAPlayerGameStats.playerId))
    .innerJoin(NBATeam, eq(NBATeam.id, NBAPlayer.teamId))
    .innerJoin(NBAGame, eq(NBAGame.id, NBAPlayerGameStats.gameId))
    .leftJoin(Participant, eq(Participant.id, NBAPlayer.participantId))

  let stats
  if (matchups && matchups.length > 0) {
    const gameIds = await getMatchupGameIds(matchups)
    stats = await baseQuery.where(inArray(NBAPlayerGameStats.gameId, gameIds))
  } else {
    stats = await baseQuery
  }

  return stats.map((stat) => ({
    player: stat.NBAPlayer.name,
    team: stat.NBATeam.shortName,
    points: stat.NBAPlayerGameStats.points,
    minutes: stat.NBAPlayerGameStats.minutes,
    game: stat.NBAGame,
    participant: stat.Participant?.name || null,
  }))
}
