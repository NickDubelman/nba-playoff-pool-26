# DuckDB Query Cheatsheet — NBA Playoff Pool 2026

All queries use the latest stats file. Replace the path if a newer CSV is added.

```bash
STATS="research/stats/2026-04-10.csv"
```

---

## Top Scorers League-Wide

```sql
duckdb -c "
SELECT Player, Team, G, ROUND(PTS,1) AS PPG, ROUND(MP,1) AS MPG
FROM read_csv('research/stats/2026-04-10.csv')
WHERE Team NOT IN ('2TM','3TM','4TM') AND PTS IS NOT NULL
ORDER BY PTS DESC
LIMIT 30
"
```

---

## Top Scorers for a Specific Team

```sql
duckdb -c "
SELECT Player, Pos, G, ROUND(PTS,1) AS PPG, ROUND(MP,1) AS MPG, ROUND(FG,1) AS FGM, ROUND(\"FG%\",3) AS FGpct
FROM read_csv('research/stats/2026-04-10.csv')
WHERE Team = 'OKC'
ORDER BY PTS DESC
"
```

> Replace `'OKC'` with any team code. See team codes below.

---

## Projected Playoff Points (PPG × Estimated Games)

Plug in your own games estimate per team to rank players by total expected points.

```sql
duckdb -c "
WITH games AS (
  SELECT * FROM (VALUES
    ('OKC', 18), ('BOS', 16), ('CLE', 14), ('LAL', 14),
    ('NYK', 12), ('MEM', 12), ('HOU', 10), ('GSW', 10),
    ('IND',  8), ('MIA',  8), ('DEN',  8), ('MIN',  8),
    ('ORL',  5), ('ATL',  5), ('DAL',  5), ('SAC',  5)
  ) t(Team, proj_games)
)
SELECT s.Player, s.Team, ROUND(s.PTS,1) AS PPG, g.proj_games,
       ROUND(s.PTS * g.proj_games, 0) AS proj_total_pts
FROM read_csv('research/stats/2026-04-10.csv') s
JOIN games g ON s.Team = g.Team
WHERE s.PTS IS NOT NULL AND s.G >= 30
ORDER BY proj_total_pts DESC
LIMIT 40
"
```

> Update the `games` CTE with your own projections as the bracket becomes clearer.

---

## Search for a Specific Player

```sql
duckdb -c "
SELECT Player, Team, Pos, Age, G, ROUND(PTS,1) AS PPG, ROUND(MP,1) AS MPG,
       ROUND(\"FG%\",3) AS FGpct, ROUND(\"3P%\",3) AS ThreePpct, ROUND(\"FT%\",3) AS FTpct
FROM read_csv('research/stats/2026-04-10.csv')
WHERE Player ILIKE '%doncic%'
"
```

---

## Players with High Usage (Potential Targets on Deep Teams)

```sql
duckdb -c "
SELECT Player, Team, G, ROUND(PTS,1) AS PPG, ROUND(MP,1) AS MPG, ROUND(FGA,1) AS FGA
FROM read_csv('research/stats/2026-04-10.csv')
WHERE Team NOT IN ('2TM','3TM','4TM') AND G >= 40 AND PTS >= 18
ORDER BY PTS DESC
"
```

---

## Injury-Risk Flag: Low Games Played (Possible Availability Concerns)

```sql
duckdb -c "
SELECT Player, Team, G, ROUND(PTS,1) AS PPG
FROM read_csv('research/stats/2026-04-10.csv')
WHERE Team NOT IN ('2TM','3TM','4TM') AND PTS >= 15 AND G < 50
ORDER BY PTS DESC
"
```

> Players with high PPG but low games played may have injury history — investigate before drafting.

---

## Compare Multiple Players Head-to-Head

```sql
duckdb -c "
SELECT Player, Team, G, ROUND(PTS,1) AS PPG, ROUND(MP,1) AS MPG,
       ROUND(\"FG%\",3) AS FGpct, ROUND(\"3P\",1) AS ThreeP
FROM read_csv('research/stats/2026-04-10.csv')
WHERE Player IN ('Shai Gilgeous-Alexander', 'Luka Dončić', 'Jayson Tatum')
ORDER BY PTS DESC
"
```

---

## Full Roster for a Team (Sorted by PPG)

```sql
duckdb -c "
SELECT Player, Pos, Age, G, ROUND(PTS,1) AS PPG, ROUND(AST,1) AS APG,
       ROUND(TRB,1) AS RPG, ROUND(MP,1) AS MPG
FROM read_csv('research/stats/2026-04-10.csv')
WHERE Team = 'BOS'
ORDER BY PTS DESC
"
```

---

## Team Code Reference

| Code | Team | Code | Team |
|------|------|------|------|
| ATL | Atlanta Hawks | MIA | Miami Heat |
| BOS | Boston Celtics | MIL | Milwaukee Bucks |
| BRK | Brooklyn Nets | MIN | Minnesota Timberwolves |
| CHI | Chicago Bulls | NOP | New Orleans Pelicans |
| CHO | Charlotte Hornets | NYK | New York Knicks |
| CLE | Cleveland Cavaliers | OKC | Oklahoma City Thunder |
| DAL | Dallas Mavericks | ORL | Orlando Magic |
| DEN | Denver Nuggets | PHI | Philadelphia 76ers |
| DET | Detroit Pistons | PHO | Phoenix Suns |
| GSW | Golden State Warriors | POR | Portland Trail Blazers |
| HOU | Houston Rockets | SAC | Sacramento Kings |
| IND | Indiana Pacers | SAS | San Antonio Spurs |
| LAC | LA Clippers | TOR | Toronto Raptors |
| LAL | LA Lakers | UTA | Utah Jazz |
| MEM | Memphis Grizzlies | WAS | Washington Wizards |

---

## Notes

- `2TM`, `3TM`, `4TM` rows are players who were traded mid-season — their stats are split. Use the individual team rows or filter them out.
- Always update the `proj_games` CTE as the bracket is set — early projections shift a lot.
- Use `/research-player <name>` or `/research-team <name>` for live injury and narrative research.
