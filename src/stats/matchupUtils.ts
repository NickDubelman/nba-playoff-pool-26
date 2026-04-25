import { db, eq, or, and, NBAGame, NBATeam } from 'astro:db'

export type Matchup = [string, string] // [teamShortNameA, teamShortNameB]

export async function getMatchupGameIds(matchups: Matchup[]): Promise<number[]> {
  const allTeams = await db.select().from(NBATeam)
  const teamIdMap = new Map(allTeams.map((t) => [t.shortName, t.id]))

  const conditions = matchups.map(([teamA, teamB]) => {
    const aId = teamIdMap.get(teamA)!
    const bId = teamIdMap.get(teamB)!
    return or(
      and(eq(NBAGame.homeTeamId, aId), eq(NBAGame.awayTeamId, bId)),
      and(eq(NBAGame.homeTeamId, bId), eq(NBAGame.awayTeamId, aId)),
    )
  })

  const games = await db
    .select({ id: NBAGame.id })
    .from(NBAGame)
    .where(or(...conditions))

  return games.map((g) => g.id)
}
