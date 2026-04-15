import { db, eq, NBAPlayer, NBATeam, Participant } from 'astro:db'

interface ParticipantWithPlayers {
  name: string
  favoriteTeam?: string
  players: string[]
  draftOrder: number
}

// Hardcoded list of participants (for seeding participants and player selections)
const participants: ParticipantWithPlayers[] = [
  {
    name: 'Victors',
    draftOrder: 1,
    players: [
      'Shai Gilgeous-Alexander',
      'Ajay Mitchell',
      'Jarrett Allen',
      'Julian Champagnie',
      'Jaylon Tyson',
      'Dillon Brooks',
      'Immanuel Quickley',
      'Shaedon Sharpe',
    ],
  },

  {
    name: 'David',
    draftOrder: 2,
    players: [
      'Jaylen Brown',
      'Evan Mobley',
      'Amen Thompson',
      'Julius Randle',
      'Reed Sheppard',
      'Paul George',
      'Tari Eason',
      'Kevin Huerter',
    ],
  },

  {
    name: 'Malatesta',
    draftOrder: 3,
    players: [
      'Jayson Tatum',
      'Stephon Castle',
      'Devin Vassell',
      'Sam Hauser',
      'Dylan Harper',
      'Deni Avdija',
      'Ayo Dosunmu',
      'Donte DiVincenzo',
    ],
  },

  {
    name: 'Senac/Whitaker',
    draftOrder: 4,
    players: [
      'Victor Wembanyama',
      'OG Anunoby',
      'Duncan Robinson',
      'Jabari Smith Jr.',
      'LeBron James',
      'Ausar Thompson',
      'VJ Edgecombe',
      'Jaylin Williams',
    ],
  },

  {
    name: 'Robbie',
    draftOrder: 5,
    players: [
      'Nikola Jokic',
      'Aaron Gordon',
      'Tyrese Maxey',
      'Mikal Bridges',
      'Peyton Watson',
      'Jalen Green',
      'Luguentz Dort',
      'Jalen Suggs',
    ],
  },

  {
    name: 'Tomlinson',
    draftOrder: 6,
    players: [
      'Donovan Mitchell',
      'Derrick White',
      'Jalen Johnson',
      'Isaiah Joe',
      'CJ McCollum',
      'Jaden McDaniels',
      'Cason Wallace',
      'Quentin Grimes',
    ],
  },

  {
    name: 'Ethan',
    draftOrder: 7,
    players: [
      'Cade Cunningham',
      'Alperen Sengun',
      'Brandon Ingram',
      'Franz Wagner',
      'Josh Hart',
      'Isaiah Stewart',
      'Jonas Valanciunas',
      'Jonathan Kuminga',
    ],
  },

  {
    name: 'Winston',
    draftOrder: 8,
    players: [
      'Jalen Brunson',
      'Kevin Durant',
      'Devin Booker',
      'Isaiah Hartenstein',
      'Scottie Barnes',
      'Miles McBride',
      'Harrison Barnes',
      'Luke Kennard',
    ],
  },

  {
    name: 'Mikey',
    draftOrder: 9,
    players: [
      'Chet Holmgren',
      "De'Aaron Fox",
      'Anthony Edwards',
      'Paolo Banchero',
      'RJ Barrett',
      'Desmond Bane',
      'Naz Reid',
      'Jrue Holiday',
    ],
  },

  {
    name: 'Daniel',
    draftOrder: 10,
    players: [
      'Jamal Murray',
      'Payton Pritchard',
      'Cameron Johnson',
      'Nickeil Alexander-Walker',
      'Tim Hardaway Jr.',
      'Nikola Vucevic',
      'Kawhi Leonard',
      'Onyeka Okongwu',
    ],
  },

  {
    name: 'Nick',
    draftOrder: 11,
    players: [
      'Jalen Williams',
      'James Harden',
      'Christian Braun',
      'Neemias Queta',
      'Sam Merrill',
      'Max Strus',
      'Bruce Brown',
      'Kon Knueppel',
    ],
  },

  {
    name: 'Moore',
    draftOrder: 12,
    players: [
      'Karl-Anthony Towns',
      'Jalen Duren',
      'Keldon Johnson',
      'Tobias Harris',
      'Daniss Jenkins',
      'Alex Caruso',
      'LaMelo Ball',
      'Brandon Miller',
    ],
  },
]

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
