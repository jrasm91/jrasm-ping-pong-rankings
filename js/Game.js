function findRankingChanges(ranking1, ranking2, upset) {
  var rankingDelta = Math.abs(ranking2 - ranking1);
  var expectedPoints = 0;
  var upsetPoints = 0;
  if (rankingDelta <= 12) {
    expectedPoints = 8;
    upsetPoints = 8;
  } else if (rankingDelta <= 37) {
    expectedPoints = 7;
    upsetPoints = 10;
  } else if (rankingDelta <= 62) {
    expectedPoints = 6;
    upsetPoints = 13;
  } else if (rankingDelta <= 87) {
    expectedPoints = 5;
    upsetPoints = 16;
  } else if (rankingDelta <= 112) {
    expectedPoints = 4;
    upsetPoints = 20;
  } else if (rankingDelta <= 137) {
    expectedPoints = 3;
    upsetPoints = 25;
  } else if (rankingDelta <= 162) {
    expectedPoints = 2;
    upsetPoints = 30;
  } else if (rankingDelta <= 187) {
    expectedPoints = 2;
    upsetPoints = 35;
  } else if (rankingDelta <= 212) {
    expectedPoints = 1;
    upsetPoints = 40;
  } else if (rankingDelta <= 237) {
    expectedPoints = 1;
    upsetPoints = 45;
  } else {
    expectedPoints = 0;
    upsetPoints = 50;
  }
  return upset ? upsetPoints : expectedPoints;
};

/****** PLAYER ******/
function Player(fullname) {
  this.fullname = fullname;
  this.firstname = fullname.split('_')[0];
  this.lastname = fullname.split('_')[1];
  this.displayName = this.firstname.charAt(0) + '. ' + this.lastname;
  this.name = this.displayName;
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
  this.dateString = (this.date.getMonth() + 1) + '/' + this.date.getDate() + '/' + this.date.getFullYear();

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

  this.upset = this.winner.ranking < this.loser.ranking;

  var points = findRankingChanges(this.winner.ranking, this.loser.ranking, this.upset);
  this.winner.pointsWon = points;
  this.loser.pointsWon = -points;

  this.scores = config.scores;
  this.scoresString = '';
  for (var i = 0; i < this.scores.length; i++) {
    this.scoresString += this.scores[i][0].toString().split('-1').join('?') + '-' + this.scores[i][1].toString().split('-1').join('?');
    if (i != this.scores.length - 1) {
      this.scoresString += ', '
    }
  }
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
  addPlayer: function (fullname) {
    var player = new Player(fullname);
    this.players.push(player);
    return player;
  },
  addMatch: function (params) {
    // find/add players from match
    var challenger = this.upsertPlayer(params.challenger);
    params.challenger = challenger.displayName;
    params.challengerRanking = challenger.ranking;
    
    var opponent = this.upsertPlayer(params.opponent);
    params.opponent = opponent.displayName;
    params.opponentRanking = opponent.ranking;
    
    var match = new Match(params);
    this.matches.push(match);

    // update player points
    this.findPlayerByDisplayName(match.winner.name).addWin(match.winner.pointsWon);
    this.findPlayerByDisplayName(match.loser.name).addLoss(Math.abs(match.loser.pointsWon));

    this.updatePlayerOrder();
  },
  upsertPlayer: function (fullname) {
    fullname = fullname.split(' ').join('_');
    var player = this.findPlayerByFullname(fullname);
    if (!player) {
      player = this.addPlayer(fullname);
    }
    return player;
  },
  findPlayerByFullname: function (fullname) {
    var player = null;
    for (var i = 0; i < this.players.length; i++) {
      if (fullname.toUpperCase() == this.players[i].fullname.toUpperCase()) {
        player = this.players[i];
        break;
      }
    }
    return player;
  },
  findPlayerByDisplayName: function (displayName) {
    var player = null;
    for (var i = 0; i < this.players.length; i++) {
      if (displayName.toUpperCase() == this.players[i].displayName.toUpperCase()) {
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