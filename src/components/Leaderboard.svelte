<script lang="ts">
  import { interpolateHsl, scaleSequential, extent } from 'd3'

  type ParticipantScore = {
    name: string
    points: number
    remainingPlayers: number
    gamesPlayed: number
  }

  let { participantScores = [] }: { participantScores: ParticipantScore[] } =
    $props()

  const greenRedInterpolator = interpolateHsl(
    'rgba(255, 0, 0, 0.5)',
    'rgba(0, 255, 0, 0.5)',
  )

  let sortBy = 'points'

  const pointsColor = scaleSequential()
    .domain(extent(participantScores.map((p) => p.points)) as [number, number])
    .interpolator(greenRedInterpolator)

  const playersRemainingColor = scaleSequential()
    .domain(
      extent(participantScores.map((p) => p.remainingPlayers)) as [
        number,
        number,
      ],
    )
    .interpolator(greenRedInterpolator)

  const gamesPlayedColor = scaleSequential()
    .domain(
      extent(participantScores.map((p) => p.gamesPlayed)) as [number, number],
    )
    .interpolator(greenRedInterpolator)

  const ppgColor = scaleSequential()
    .domain(
      extent(
        participantScores.map((p) => (p.points ? p.points / p.gamesPlayed : 0)),
      ) as [number, number],
    )
    .interpolator(greenRedInterpolator)

  const sortedScores = participantScores.sort((a, b) => {
    switch (sortBy) {
      case 'points':
        if (a.points !== b.points) {
          return a.points > b.points ? -1 : 1
        }
        break

      case 'players remaining':
        if (a.remainingPlayers !== b.remainingPlayers) {
          return a.remainingPlayers > b.remainingPlayers ? -1 : 1
        }
        break

      case 'games played':
        if (a.gamesPlayed !== b.gamesPlayed) {
          return a.gamesPlayed > b.gamesPlayed ? -1 : 1
        }
        break

      case 'ppg': {
        const aPPG = a.points / a.gamesPlayed
        const bPPG = b.points / b.gamesPlayed

        if (aPPG !== bPPG) {
          return aPPG > bPPG ? -1 : 1
        }
        break
      }
    }

    return a.name < b.name ? -1 : 1
  })

  function getParticipantLink(name: string) {
    // replace / with +
    return `/participants/${name.replace(/\//g, '+')}`
  }
</script>

<h2 class="text-2xl font-bold py-3">Leaderboard</h2>

<table class="w-full">
  <thead>
    <tr>
      <th>Participant</th>
      <th>Points</th>
      <th>Players Remaining</th>
      <th>Games Played</th>
      <th>PPG</th>
    </tr>
  </thead>
  <tbody>
    {#each sortedScores as { name, points, gamesPlayed, remainingPlayers }}
      <tr>
        <td>
          <a
            href={getParticipantLink(name)}
            class="text-blue-600 font-medium hover:underline">{name}</a
          >
        </td>
        <td style="background: {pointsColor(points)}">{points}</td>
        <td style="background: {playersRemainingColor(remainingPlayers)}">
          {remainingPlayers}
        </td>
        <td style="background: {gamesPlayedColor(gamesPlayed)}">
          {gamesPlayed}
        </td>
        <td style="background: {ppgColor(points && points / gamesPlayed)}">
          {points && Math.round((points / gamesPlayed) * 100) / 100}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  table {
    border-collapse: collapse;
  }

  tr:not(:last-child) {
    border-bottom: solid 1px #eee;
  }

  tr th {
    text-align: left;
  }
</style>
