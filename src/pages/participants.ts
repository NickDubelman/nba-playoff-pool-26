import type { APIRoute } from 'astro'

import { db, eq, NBAPlayer, NBATeam, Participant } from 'astro:db'
import participants from '../participants'

export const POST: APIRoute = async ({ request }) => {
  for (const participant of participants) {
    // Lookup the favorite team (if participant has one)
    let favoriteTeamId: number | null = null

    if (participant.favoriteTeam) {
      const teams = await db
        .select()
        .from(NBATeam)
        .where(eq(NBATeam.shortName, participant.favoriteTeam))

      if (teams.length === 0) {
        const error = `Team with abbreviation ${participant.favoriteTeam} not found`
        return new Response(JSON.stringify({ success: false, error }))
      }

      favoriteTeamId = teams[0].id
    }

    // Check if participant already exists
    const existingParticipant = await db
      .select()
      .from(Participant)
      .where(eq(Participant.name, participant.name))

    let participantId: number | null = null
    if (existingParticipant.length > 0) {
      // Already exists, just update
      participantId = existingParticipant[0].id
      await db
        .update(Participant)
        .set({ favoriteTeamId })
        .where(eq(Participant.id, participantId))
    } else {
      // Insert participant
      const result = await db
        .insert(Participant)
        .values({ name: participant.name, favoriteTeamId })

      participantId = Number(result.lastInsertRowid)
    }

    if (!participantId) {
      const error = `Failed to insert participant ${participant.name}`
      return new Response(JSON.stringify({ success: false, error }))
    }

    // Update players to reference the participant
    for (const player of participant.players) {
      await db
        .update(NBAPlayer)
        .set({ participantId })
        .where(eq(NBAPlayer.name, player))
    }
  }

  return new Response(JSON.stringify({ success: true }))
}
