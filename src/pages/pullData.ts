import type { APIRoute } from 'astro'

import { db, NBATeam, NBAGame, NBAPlayer, NBAPlayerGameStats } from 'astro:db'
import { formatDate } from '../utils'

export const POST: APIRoute = async ({ request }) => {
  // Make sure user provides a secret password
  const password = request.headers.get('Authorization')
  if (password !== import.meta.env.PULL_DATA_PASSWORD) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid password' }),
      { status: 401 },
    )
  }

  // Pull games and stats from the BallDontLie API
  const games = await getGames()
  await insertTeamsAndGames(games)
  await insertPlayerStats(games)

  return new Response(JSON.stringify({ success: true }))
}

const apiBaseURL = 'https://api.balldontlie.io/v1'
const headers = { Authorization: import.meta.env.BALLDONTLIE_API_KEY }

async function apiRequest(url: string) {
  return await fetch(url, { headers })
}

function todayPlusNDays(n: number) {
  const date = new Date()
  date.setDate(date.getDate() + n)
  return date
}

// Do requests to the BallDontLie API to get games between yesterday and tomorrow
async function getGames(): Promise<Game[]> {
  const startOfPlayoffs = new Date('2026-04-19')

  const yesterday = todayPlusNDays(-1)
  const tomorrow = todayPlusNDays(1)

  // We only want to get games from the start of the playoffs
  const start = yesterday < startOfPlayoffs ? startOfPlayoffs : yesterday

  const startStr = formatDate(start)
  const endStr = formatDate(tomorrow)

  const gamesURL = `${apiBaseURL}/games?start_date=${startStr}&end_date=${endStr}&per_page=100`
  const resp = await apiRequest(gamesURL)
  const { data, meta } = await resp.json()

  const allData = data
  let nextCursor = meta.next_cursor

  while (nextCursor) {
    const resp = await apiRequest(`${gamesURL}&cursor=${nextCursor}`)

    const { data, meta } = await resp.json()
    allData.push(...data)
    nextCursor = meta.next_cursor
  }

  return allData
}

async function insertTeamsAndGames(games: Game[]) {
  const batch = []
  for (const game of games) {
    // Insert the teams into the database
    batch.push(
      db
        .insert(NBATeam)
        .values({
          id: game.home_team.id,
          name: game.home_team.name,
          shortName: game.home_team.abbreviation,
        })
        .onConflictDoNothing(), // Ignore errors due to team already existing
    )

    batch.push(
      db
        .insert(NBATeam)
        .values({
          id: game.visitor_team.id,
          name: game.visitor_team.name,
          shortName: game.visitor_team.abbreviation,
        })
        .onConflictDoNothing(), // Ignore errors due to team already existing
    )

    // Insert the games into the database
    const set = {
      // Fields that we will insert or update
      date: new Date(game.date),
      time: game.time,
      period: game.period,
      status: game.status,
      homeTeamScore: game.home_team_score,
      awayTeamScore: game.visitor_team_score,
      homeTeamId: game.home_team.id,
      awayTeamId: game.visitor_team.id,
    }

    batch.push(
      db
        .insert(NBAGame)
        .values({ id: game.id, ...set })
        .onConflictDoUpdate({ target: NBAGame.id, set }),
    )
  }

  if (batch.length === 0) {
    return // Nothing to insert
  }

  return await db.batch([batch[0], ...batch.slice(1)])
}

async function getPlayerStats(games: Game[]): Promise<PlayerStat[]> {
  const gameIds = games.map((game) => game.id).join('&game_ids[]=')
  const playerStatsURL = `${apiBaseURL}/stats?game_ids[]=${gameIds}&per_page=100`
  const resp = await apiRequest(playerStatsURL)
  const { data, meta } = await resp.json()

  const allData = data
  let nextCursor = meta.next_cursor

  while (nextCursor) {
    const resp = await apiRequest(`${playerStatsURL}&cursor=${nextCursor}`)

    const { data, meta } = await resp.json()
    allData.push(...data)
    nextCursor = meta.next_cursor
  }

  return allData
}

async function insertPlayerStats(games: Game[]) {
  // Get the player stats for the games
  const playerStats = await getPlayerStats(games)

  // Insert the player stats into the database
  const batch = []
  for (const stat of playerStats) {
    // Insert the player into the database
    batch.push(
      db
        .insert(NBAPlayer)
        .values({
          id: stat.player.id,
          name: stat.player.first_name + ' ' + stat.player.last_name,
          teamId: stat.team.id,
        })
        .onConflictDoNothing(), // Ignore errors due to player already existing
    )

    const set = {
      // Fields that we will insert or update
      points: stat.pts,
      minutes: stat.min,
      playerId: stat.player.id,
      gameId: stat.game.id,
    }

    batch.push(
      db
        .insert(NBAPlayerGameStats)
        .values({ id: stat.id, ...set })
        .onConflictDoUpdate({ target: NBAPlayerGameStats.id, set }),
    )
  }

  if (batch.length === 0) {
    return // Nothing to insert
  }

  return await db.batch([batch[0], ...batch.slice(1)])
}

// Types for the BallDontLie API (these are not all the fields, just the ones I care about)
interface Game {
  id: number
  date: string // YYYY-MM-DD
  status: string
  period: number
  time: string
  postseason: boolean
  home_team_score: number
  visitor_team_score: number
  home_team: Team
  visitor_team: Team
}

interface Team {
  id: number
  name: string
  abbreviation: string
}

interface Player {
  id: number
  first_name: string
  last_name: string
}

interface PlayerStat {
  id: number
  min: number
  pts: number
  player: Player
  team: Team
  game: Game
}
