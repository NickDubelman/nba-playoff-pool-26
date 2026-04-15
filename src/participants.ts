import { db, eq, NBAPlayer, NBATeam, Participant } from 'astro:db'

interface ParticipantWithPlayers {
  name: string
  favoriteTeam?: string
  players: string[]
  draftOrder: number
}

// Hardcoded list of participants (for seeding participants and player selections)
const participants: ParticipantWithPlayers[] = []

// Function to get participants as per the db (dynamic)
export async function getParticipants(): Promise<ParticipantWithPlayers[]> {
  const rows = await db
    .select()
    .from(Participant)
    .innerJoin(NBAPlayer, eq(NBAPlayer.participantId, Participant.id))
    .leftJoin(NBATeam, eq(NBATeam.id, Participant.favoriteTeamId))

  // Create a map from participant id to participant (as we accumulate the players)
  const participantMap = rows.reduce<Record<number, ParticipantWithPlayers>>(
    (acc, row) => {
      const participant: ParticipantWithPlayers = acc[row.Participant.id] || {
        name: row.Participant.name,
        favoriteTeam: row.NBATeam?.shortName || undefined,
        draftOrder: row.Participant.draftOrder || 0,
        players: [],
      }

      participant.players.push(row.NBAPlayer.name)

      acc[row.Participant.id] = participant

      return acc
    },
    {},
  )

  // Sort each participant's players according to the hardcoded list above
  // This sort order reflects the order in which the players were drafted
  for (const { name, players } of Object.values(participantMap)) {
    players.sort(
      (a, b) =>
        participants.find((p) => p.name === name)?.players.indexOf(a)! -
        participants.find((p) => p.name === name)?.players.indexOf(b)!,
    )
  }

  // Turn the rows into a list of participants
  return Object.values(participantMap).sort((a, b) =>
    a.name.localeCompare(b.name),
  )
}

export default participants
