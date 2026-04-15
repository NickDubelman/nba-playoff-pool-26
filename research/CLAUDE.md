I want to use Claude AI agents to help me decide which players to draft for my NBA Playoffs "Scoring
Pool".

The strategy is not always straightforward. In simple terms, you want to pick players you think will
have the highest `points per game * total games played in the playoffs`. You need to have some idea
of how far you think each team will go in the playoffs, and which players will be the main scorers
on those teams. You also might consider teams that will have easy routes to the finals (lower games
played) or teams that will have tougher routes (more games played). You also need to consider
injuries and availability of players. If a player is out for the rest of the season you should NEVER
draft them.

The `./stats` directory contains CSVs from Basketball Reference with the regular season stats for the
2025-2026 season. When doing analysis, you should ALWAYS use the latest.

You have access to the `duckdb` CLI which can load CSV and run SQL queries on them. You can use this
to do analysis.

The draft is a snake format with 12 total participants and I have the 11th pick.
