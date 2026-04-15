import {
  db,
  eq,
  and,
  isNotNull,
  notInArray,
  sum,
  count,
  ne,
  NBAPlayer,
  NBAPlayerGameStats,
  NBATeam,
  Participant,
} from 'astro:db'
import eliminatedTeams from '../eliminatedTeams'

export default async function getParticipantScores() {
  // Get all participants
  const participants = await db.select().from(Participant)

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
    .where(ne(NBAPlayerGameStats.minutes, 0))
    .groupBy(Participant.id)

  let remainingPlayersByParticipant: Record<string, number> = {}

  if (eliminatedTeams.length === 0) {
    // If no eliminated teams yet, all participants have 8 players remaining
    participants.forEach((participant) => {
      remainingPlayersByParticipant[participant.name] = 8
    })
  } else {
    const remainingPlayers = await db
      .select()
      .from(NBAPlayer)
      .innerJoin(NBATeam, eq(NBATeam.id, NBAPlayer.teamId))
      .innerJoin(Participant, eq(Participant.id, NBAPlayer.participantId))
      .where(
        and(
          isNotNull(NBAPlayer.participantId),
          notInArray(NBATeam.shortName, eliminatedTeams),
        ),
      )

    remainingPlayersByParticipant = remainingPlayers.reduce<
      Record<string, number>
    >((acc, player) => {
      if (!acc[player.Participant.name]) {
        acc[player.Participant.name] = 0
      }
      acc[player.Participant.name]++
      return acc
    }, {})
  }

  return participantScores.map((score) => ({
    name: score.name,
    points: score.points || 0,
    gamesPlayed: score.gamesPlayed,
    remainingPlayers: remainingPlayersByParticipant[score.name] || 0,
  }))
}
