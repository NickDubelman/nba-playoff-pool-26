<script lang="ts">
  import type { GameStat } from '../stats/gameStats'

  let { gameStats, title }: { gameStats: GameStat[]; title: string } = $props()

  let numPlayers = $state(8)

  let topPlayers = $derived.by(() => {
    const playerStats = {} // a map from player name to corresponding stats

    gameStats.forEach(({ player, team, points, participant }) => {
      // First time we see a player, initialize an entry in the map for them
      if (!playerStats[player]) {
        playerStats[player] = { team, participant, points: 0, gamesPlayed: 0 }
      }

      playerStats[player].points += points
      playerStats[player].gamesPlayed++
    })

    return Object.entries(playerStats)
      .map(([name, { team, participant, points, gamesPlayed }]) => ({
        name,
        team,
        participant,
        points,
        gamesPlayed,
      }))
      .sort((a, b) => {
        if (a.points !== b.points) {
          return a.points > b.points ? -1 : 1
        }

        return a.name < b.name ? -1 : 1
      })
      .slice(0, numPlayers)
  })
</script>

<h2 class="text-2xl font-bold py-3">{title}</h2>

<div class="num-players-selector">
  <input type="range" min="3" max="81" bind:value={numPlayers} />
  <span>showing top {numPlayers}</span>
</div>

<table class="w-full">
  <thead>
    <tr>
      <th>Player</th>
      <th style="width: 42px">Team</th>
      <th>Picked by</th>
      <th style="width: 56px">Points</th>
      <th style="width: 56px">Games Played</th>
      <th>PPG</th>
    </tr>
  </thead>
  <tbody>
    {#each topPlayers as { name, team, participant, points, gamesPlayed }}
      <tr>
        <td>{name}</td>
        <td>{team}</td>
        <td class:red={!participant}>
          {participant || 'Not picked'}
        </td>
        <td>{points}</td>
        <td>{gamesPlayed}</td>
        <td
          >{gamesPlayed
            ? Math.round((points / gamesPlayed) * 100) / 100
            : 0}</td
        >
      </tr>
    {/each}
  </tbody>
</table>

<style>
  table {
    font-size: 0.86em;
    border-collapse: collapse;
  }

  td {
    border: 1px solid #ddd;
    border-collapse: collapse;
  }

  tr th {
    text-align: left;
  }

  tr td {
    padding: 8px 4px 8px 4px;
  }

  .red {
    color: red;
  }

  .num-players-selector {
    display: flex;
    margin-bottom: 8px;
  }

  .num-players-selector input {
    margin: 0;
    margin-right: 8px;
  }
</style>
