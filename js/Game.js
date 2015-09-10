function findRankingChanges(ranking1, ranking2, upset) {
  var rankingDelta = Math.abs(ranking2 - ranking1);
  var expected = 0;
  var upset = 0;
  if (rankingDelta <= 12) {
    expected = 8;
    upset = 8;
  } else if (rankingDelta <= 37) {
    expected = 7;
    upset = 10;
  } else if (rankingDelta <= 62) {
    expected = 6;
    upset = 13;
  } else if (rankingDelta <= 87) {
    expected = 5;
    upset = 16;
  } else if (rankingDelta <= 112) {
    expected = 4;
    upset = 20;
  } else if (rankingDelta <= 137) {
    expected = 3;
    upset = 25;
  } else if (rankingDelta <= 162) {
    expected = 2;
    upset = 30;
  } else if (rankingDelta <= 187) {
    expected = 2;
    upset = 35;
  } else if (rankingDelta <= 212) {
    expected = 1;
    upset = 40;
  } else if (rankingDelta <= 237) {
    expected = 1;
    upset = 45;
  } else {
    expected = 0;
    upset = 50;
  }
  return upset ? upset : expected;
};

/****** PLAYER ******/
function Player(name) {
  this.name = name;
  this.wins = 0;
  this.losses = 0;
  this.ranking = 1000;
};

Player.prototype = {
  addLoss: function (points) {
    this.losses += 1;
    this.ranking -= points;
  },
  addWin: function (points) {
    this.wins += 1;
    this.ranking += points;
  }
}

/****** MATCH ******/
function Match(config) {
  this.date = config.date;
  this.dateString = config.date.toLocaleString().split(',')[0];

  var challengerSets = 0;
  var opponentSets = 0;
  for (var i = 0; i < config.scores.length; i++) {
    challengerSets += (config.scores[i][0] > config.scores[i][1]) ? 1 : 0;
    opponentSets += (config.scores[i][0] < config.scores[i][1]) ? 1 : 0;
  }

  this.winner = {
    name: challengerSets >= opponentSets ? config.challenger : config.opponent,
    setsWon: challengerSets >= opponentSets ? challengerSets : opponentSets,
    ranking: challengerSets >= opponentSets ? config.challengerRanking : config.opponentRanking
  };

  this.loser = {
    name: challengerSets < opponentSets ? config.challenger : config.opponent,
    setsWon: challengerSets < opponentSets ? challengerSets : opponentSets,
    ranking: challengerSets < opponentSets ? config.challengerRanking : config.opponentRanking
  };

  this.challenger = this.winner.name == config.challenger ? this.winner : this.loser;
  this.opponent = this.winner.name == config.opponent ? this.winner : this.loser;

  this.upset = this.winner.ranking > this.loser.ranking;

  this.scores = config.scores;
  this.scoresString = '';
  for (var i = 0; i < this.scores.length; i++) {
    this.scoresString += this.scores[i][0].toString().split('-1').join('?') + '-' + this.scores[i][1].toString().split('-1').join('?');
    if (i != this.scores.length - 1) {
      this.scoresString += ', '
    }
  }

  var points = findRankingChanges(this.winner.ranking, this.loser.ranking, this.upset);
  this.winner.pointsWon = points;
  this.loser.pointsWon = -Math.floor(points / 2);
}

/****** GAME ******/
function Game() {
  this.players = [];
  this.matches = [];
};

Game.prototype = {
  setPreviousSeed: function () {
    this.players.forEach(function (player, i) {
      player.previousSeed = i;
    });
  },
  setCurrentSeed: function () {
    this.players.forEach(function (player, i) {
      player.currentSeed = i;
      player.seedChange = player.currentSeed - player.previousSeed;
    });
  },
  sortPlayers: function () {
    this.players = this.players.sort(function (player1, player2) {
      if (player1.ranking != player2.ranking) {
        return player2.ranking - player1.ranking;
      } else {
        return player2.wins - player1.wins;
      }
    });
  },
  updatePlayerOrder: function () {
    this.setPreviousSeed();
    this.sortPlayers();
    this.setCurrentSeed();
  },
  addPlayer: function (name) {
    var player = new Player(name);
    this.players.push(player);
    return player;
  },
  addMatch: function (params) {
    // find/add players from match
    params.challengerRanking = this.upsertPlayer(params.challenger).ranking;
    params.opponentRanking = this.upsertPlayer(params.opponent).ranking;
    var match = new Match(params);
    this.matches.push(match);

    // update player points
    this.findPlayerByName(match.winner.name).addWin(match.winner.pointsWon);
    this.findPlayerByName(match.loser.name).addLoss(-match.loser.pointsWon);

    this.updatePlayerOrder();
  },
  upsertPlayer: function (name) {
    var player = this.findPlayerByName(name);
    if (!player) {
      player = this.addPlayer(name);
    }
    return player;
  },
  findPlayerByName: function (name) {
    var player = null;
    for (var i = 0; i < this.players.length; i++) {
      if (name.toUpperCase() == this.players[i].name.toUpperCase()) {
        player = this.players[i];
        break;
      }
    }
    return player;
  },
  getMatchesByPlayer: function (player) {
    var matches = [];
    this.matches.forEach(function (match) {
      if (match.challenger.name == player || match.opponent.name == player) {
        matches.push(match);
      }
    });
    return matches;
  },

  getPlayerHistory: function (player) {
    var playerHistories = {};
    this.players.forEach(function (opponent) {
      if (opponent.name == player) {
        return;
      }
      playerHistories[opponent.name] = {
        losses: 0,
        wins: 0,
        currentStreak: 0,
        name: opponent.name
      };
    });
    this.matches.forEach(function (match) {
      if (player == match.winner.name) {
        playerHistories[match.loser.name].wins += 1;
        if (playerHistories[match.loser.name].currentStreak > 0) {
          playerHistories[match.loser.name].currentStreak += 1;
        } else {
          playerHistories[match.loser.name].currentStreak = 1;
        }
      } else if (player == match.loser.name) {
        playerHistories[match.winner.name].losses += 1;
        if (playerHistories[match.winner.name].currentStreak <= 0) {
          playerHistories[match.winner.name].currentStreak -= 1;
        } else {
          playerHistories[match.winner.name].currentStreak = -1;
        }
      }
    });
    var history = [];
    for (var name in playerHistories) {
      var nextHistory = playerHistories[name];
      history.push(nextHistory)
    }
    return history;
  }
}