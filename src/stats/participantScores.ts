import {
  db,
  eq,
  and,
  isNotNull,
  inArray,
  sum,
  count,
  ne,
  NBAPlayer,
  NBAPlayerGameStats,
  NBATeam,
  Participant,
} from 'astro:db'
import { SQL } from 'drizzle-orm'
import eliminatedTeams from '../eliminatedTeams'
import { type Matchup, getMatchupGameIds } from './matchupUtils'

export default async function getParticipantScores(matchups?: Matchup[]) {
  // Get all participants
  const participants = await db.select().from(Participant)

  // Build where conditions — always exclude DNP rows, optionally restrict to specific games
  const whereConditions: SQL[] = [ne(NBAPlayerGameStats.minutes, 0)]

  if (matchups && matchups.length > 0) {
    const gameIds = await getMatchupGameIds(matchups)
    whereConditions.push(inArray(NBAPlayerGameStats.gameId, gameIds))
  }

  // Compute the participant scores (total player points and total games played)
  const participantScores = await db
    .select({
      name: Participant.name,
      points: sum(NBAPlayerGameStats.points).mapWith(Number),
      gamesPlayed: count(NBAPlayerGameStats.id),
    })
    .from(Participant)
    .innerJoin(NBAPlayer, eq(NBAPlayer.participantId, Participant.id))
    .leftJoin(NBAPlayerGameStats, eq(NBAPlayerGameStats.playerId, NBAPlayer.id))
    .where(and(...whereConditions))
    .groupBy(Participant.id)

  let remainingPlayersByParticipant: Record<string, number> = {}

  // Initialize all participants to 8 (full roster)
  participants.forEach((participant) => {
    remainingPlayersByParticipant[participant.name] = 8
  })

  if (eliminatedTeams.length > 0) {
    // Count how many of each participant's players are on eliminated teams
    // (players on eliminated teams are guaranteed to be in the DB since they've played)
    const eliminatedPlayers = await db
      .select()
      .from(NBAPlayer)
      .innerJoin(NBATeam, eq(NBATeam.id, NBAPlayer.teamId))
      .innerJoin(Participant, eq(Participant.id, NBAPlayer.participantId))
      .where(
        and(
          isNotNull(NBAPlayer.participantId),
          inArray(NBATeam.shortName, eliminatedTeams),
        ),
      )

    for (const player of eliminatedPlayers) {
      remainingPlayersByParticipant[player.Participant.name] =
        (remainingPlayersByParticipant[player.Participant.name] ?? 8) - 1
    }
  }

  return participantScores.map((score) => ({
    name: score.name,
    points: score.points || 0,
    gamesPlayed: score.gamesPlayed,
    remainingPlayers: remainingPlayersByParticipant[score.name] || 0,
  }))
}
