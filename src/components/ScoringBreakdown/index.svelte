<script>
  import * as d3 from 'd3'
  import { onMount } from 'svelte'

  import { barStep, down, getScoring, margin, up } from './utils'

  let { participants, gameStats } = $props()

  let viz
  onMount(() => {
    // 'scoring' is expected to look like:
    //   { [ participantName ]: { name, team, points}[] }
    const scoring = getScoring(participants, gameStats)

    const rootChildren = Object.entries(scoring).map(([name, players]) => ({
      name,
      children: players,
    }))

    const root = d3
      .hierarchy({ name: 'root', children: rootChildren })
      .sum((d) => d.points)
      .sort((a, b) => (a.value > b.value ? -1 : 1))
      .eachAfter(
        (d) =>
          (d.index = d.parent ? (d.parent.index = d.parent.index + 1 || 0) : 0),
      )

    const getHeight = (root) => {
      let max = 1
      root.each((d) => d.children && (max = Math.max(max, d.children.length)))
      return max * barStep + margin.top + margin.bottom
    }

    const height = getHeight(root)
    const width = document.body.clientWidth - 16

    const svg = d3.select(viz)
    svg.attr('width', width).attr('height', height)

    const xScale = d3
      .scaleLinear()
      .range([margin.left, width - margin.right])
      .domain([0, root.value])

    svg
      .append('rect')
      .attr('class', 'background')
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .attr('width', width)
      .attr('height', height)
      .attr('cursor', 'pointer')
      .on('click', (event, d) => up(svg, d, xScale, xAxis, width))

    const xAxis = (g) =>
      g
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${margin.top})`)
        .call(d3.axisTop(xScale).ticks(width / 80))
        .call((g) =>
          (g.selection ? g.selection() : g).select('.domain').remove(),
        )

    const yAxis = (g) =>
      g
        .attr('class', 'y-axis')
        .attr('transform', `translate(${margin.left + 0.5}, 0)`)
        .call((g) =>
          g
            .append('line')
            .attr('stroke', 'currentColor')
            .attr('y1', margin.top)
            .attr('y2', height - margin.bottom),
        )

    svg.append('g').call(xAxis)
    svg.append('g').call(yAxis)

    down(svg, root, false, xScale, xAxis, width)
  })
</script>

<h2 class="text-2xl font-bold py-3">Scoring Breakdown</h2>

<ul class="list-disc ps-8">
  <li>Click a bar to "zoom in"</li>
  <li>Click the background to "zoom out"</li>
</ul>

<svg bind:this={viz} />
