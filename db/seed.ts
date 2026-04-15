import {
  db,
  NBAGame,
  NBAPlayer,
  NBAPlayerGameStats,
  NBATeam,
  Participant,
} from 'astro:db'

// https://astro.build/db/seed
export default async function seed() {
  // Create some NBA teams
  await db.insert(NBATeam).values([
    { name: 'Lakers', shortName: 'LAL' },
    { name: 'Nuggets', shortName: 'DEN' },
  ])

  // Insert some participants
  await db.insert(Participant).values([
    { name: 'Nick', favoriteTeamId: 1, draftOrder: 1 },
    { name: 'David', favoriteTeamId: 2, draftOrder: 2 },
    { name: 'Daniel', favoriteTeamId: 2, draftOrder: 3 },
  ])

  // Create some NBA players
  await db.insert(NBAPlayer).values([
    { name: 'Lebron James', teamId: 1, participantId: 1 },
    { name: 'Anthony Davis', teamId: 1 },
    { name: 'Nikola Jokic', teamId: 2, participantId: 2 },
    { name: 'Jamal Murray', teamId: 2, participantId: 3 },
    { name: 'Michael Porter Jr.', teamId: 2 },
  ])

  // Log some NBA games
  await db.insert(NBAGame).values([
    {
      date: new Date('2026-04-20'),
      time: '',
      period: 4,
      status: 'Final',
      homeTeamScore: 100,
      awayTeamScore: 95,
      homeTeamId: 1,
      awayTeamId: 2,
    },
    {
      date: new Date('2026-04-20'),
      time: '',
      period: 4,
      status: 'Final',
      homeTeamScore: 105,
      awayTeamScore: 110,
      homeTeamId: 2,
      awayTeamId: 1,
    },
  ])

  // Log some player stats for the games
  await db.insert(NBAPlayerGameStats).values([
    { playerId: 1, gameId: 1, points: 30, minutes: 40 },
    { playerId: 2, gameId: 1, points: 20, minutes: 35 },
    { playerId: 3, gameId: 2, points: 25, minutes: 40 },
    { playerId: 4, gameId: 2, points: 15, minutes: 30 },
    { playerId: 5, gameId: 2, points: 20, minutes: 35 },
  ])
}
