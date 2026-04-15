<script>
  import * as d3 from 'd3'
  import eliminatedTeams from '../eliminatedTeams'

  let { participants, gameStats } = $props()

  const totalParticipants = participants.length
  const sortedParticipants = participants.sort((a, b) => {
    return a.draftOrder < b.draftOrder ? -1 : 1
  })

  let numPlayers = $state(8)

  const playerStats = {}

  // Create a map we can use to look up points for a player
  gameStats.forEach(({ player, points, team }) => {
    // First time we see a player, initialize an entry in the map for them
    if (!playerStats[player]) {
      playerStats[player] = {
        points: 0,
        active: !eliminatedTeams.includes(team),
      }
    }

    playerStats[player].points += points
  })

  // Snake through the participants to determine where each player was drafted
  let round = 0 // 0..7 (8 rounds)
  const picks = []
  while (round < 8) {
    if (round % 2 === 0) {
      // Even round means pick from start
      let numPicks = 0 // 0..11 (12 picks)
      while (numPicks < totalParticipants) {
        const participant = sortedParticipants[numPicks]
        const player = participant.players[round]
        const stats = playerStats[player]
        picks.push({
          player,
          points: stats?.points || 0,
          active: stats?.active || false,
          pickedBy: participant.name,
          drafted: picks.length + 1,
        })
        numPicks++
      }
    } else {
      // Odd round means pick from back
      let numPicks = totalParticipants - 1 // 11..0 (12 picks)
      while (numPicks >= 0) {
        const participant = sortedParticipants[numPicks]
        const player = participant.players[round]
        const stats = playerStats[player]
        picks.push({
          player,
          points: stats?.points || 0,
          active: stats?.active || false,
          pickedBy: participant.name,
          drafted: picks.length + 1,
        })
        numPicks--
      }
    }

    round++
  }

  let sortedPicks = $derived(
    picks
      .slice()
      .sort((a, b) => {
        if (a.points === b.points) {
          return a.player < b.player ? -1 : 1
        }

        return a.points > b.points ? -1 : 1
      })
      .map((pick, i) => ({ ...pick, rank: i + 1, net: i + 1 - pick.drafted }))
      .sort((a, b) => {
        if (a.net === b.net) {
          return a.rank > b.rank ? -1 : 1
        }

        return a.net < b.net ? -1 : 1
      }),
  )

  let sortedPicksSlice = $derived(sortedPicks.slice(0, numPlayers))

  const redGreenInterpolator = d3.interpolateHsl(
    'rgba(0, 255, 0, 0.5)',
    'rgba(255, 0, 0, 0.5)',
  )

  let netColor = $derived(
    d3
      .scaleSequential()
      .domain(d3.extent(sortedPicks.map((p) => p.net)))
      .interpolator(redGreenInterpolator),
  )
</script>

<h2 class="text-2xl font-bold py-3">Draft Analysis</h2>

<div class="num-players-selector">
  <input type="range" min="3" max="96" bind:value={numPlayers} />
  <span>showing top {numPlayers}</span>
</div>

<table class="min-w-full divide-y divide-gray-300 text-sm">
  <tr class="font-semibold divide-x">
    <th class="py-2 text-left">Player</th>
    <th class="px-2 text-left">Picked by</th>
    <th class="px-2 text-left">Points</th>
    <th class="px-2 text-left">Drafted</th>
    <th class="px-2 text-left">Rank</th>
    <th class="px-2 text-left">Net</th>
  </tr>

  <tbody class="divide-y divide-gray-200">
    {#each sortedPicksSlice as { player, points, active, pickedBy, drafted, rank, net }}
      <tr class="divide-x">
        <td class="py-2">
          {player}
          {#if !active}
            <span>❌</span>
          {/if}
        </td>
        <td class="px-2">{pickedBy}</td>
        <td class="px-2">{points}</td>
        <td class="px-2">{drafted}</td>
        <td class="px-2">{rank}</td>
        <td class="px-2" style="background: {netColor(net)}">{net}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .num-players-selector {
    display: flex;
    margin-bottom: 8px;
  }

  .num-players-selector input {
    margin: 0;
    margin-right: 8px;
  }
</style>
