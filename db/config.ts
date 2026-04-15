import { defineDb, defineTable, column } from 'astro:db'

const Participant = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text({ unique: true }),
    draftOrder: column.number({ optional: true }),
    favoriteTeamId: column.number({
      references: () => NBATeam.columns.id,
      optional: true,
    }),
  },
})

const NBATeam = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    shortName: column.text(),
  },
})

const NBAPlayer = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    teamId: column.number({ references: () => NBATeam.columns.id }),
    participantId: column.number({
      references: () => Participant.columns.id,
      optional: true,
    }),
  },
})

const NBAGame = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    date: column.date(),
    time: column.text({ optional: true }),
    period: column.number(),
    status: column.text(),
    homeTeamScore: column.number(),
    awayTeamScore: column.number(),
    homeTeamId: column.number({ references: () => NBATeam.columns.id }),
    awayTeamId: column.number({ references: () => NBATeam.columns.id }),
  },
})

const NBAPlayerGameStats = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    points: column.number(),
    minutes: column.number(),
    playerId: column.number({ references: () => NBAPlayer.columns.id }),
    gameId: column.number({ references: () => NBAGame.columns.id }),
  },
})

// https://astro.build/db/config
export default defineDb({
  tables: {
    Participant,
    NBATeam,
    NBAPlayer,
    NBAGame,
    NBAPlayerGameStats,
  },
})
