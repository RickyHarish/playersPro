const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
app.use(express.json());
let db = null;

const initializeDBAndServer = async () => {
  try {
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000");
    });
    db = await open({ filename: dbPath, driver: sqlite3.Database });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM player_details`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray);
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetailsQuery = `SELECT * FROM player_details WHERE player_id = ${playerId};`;
  const playerArray = await db.get(getPlayerDetailsQuery);
  response.send(playerArray);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;

  const updatePlayerDetailsQuery = `UPDATE player_details SET player_name = ${playerName} WHERE player_id = ${playerId};`;
  await db.run(updatePlayerDetailsQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetails = `SELECT * FROM match_details WHERE match_id = ${matchId};`;
  const matchArray = await db.get(getMatchDetails);
  response.send(matchArray);
});

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `SELECT * FROM player_match_score LEFT JOIN match_details ON player_match_score.match_id = match_details.match_id WHERE player_match_score.player_id = ${playerId};`;
  const matchesOfPlayerArray = await db.all(getPlayerMatchesQuery);
  response.send(matchesOfPlayerArray);
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayersQuery = `SELECT * FROM player_match_score LEFT JOIN player_details ON player_match_score.player_id = player_details.player_id WHERE player_match_score.match_id = ${matchId};`;
  const matchPlayersArray = await db.all(getMatchPlayersQuery);
  response.send(matchPlayersArray);
});

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const totalScoreOfPlayerQuery = `SELECT player_match_score.player_id, player_details.player_name, SUM(player_match_score.score) AS totalScore, SUM(player_match_score.fours) AS totalFours, SUM(player_match_score.sixes) AS totalSixes
    FROM player_match_score LEFT JOIN player_details 
    ON  player_match_score.player_id = player_details.player_id
    WHERE player_details.player_id = ${playerId};`;
  const scoreOfPlayer = await db.get(totalScoreOfPlayerQuery);
  response.send(scoreOfPlayer);
});

module.exports = app;
