'use strict';

/**
 * @ngdoc overview
 * @name ppPollsApp
 * @description
 * # ppPollsApp
 *
 * Main module of the application.
 */
 var app = angular.module('ppPollsApp', ['ngRoute']);

 app.config(function ($routeProvider) {
  $routeProvider
  .when('/home', {
    templateUrl: 'partials/home.html',
    activeTab: 'HOME'
  })
  .when('/polls', {
    controller: 'PollsCtrl',
    controllerAs: 'pollsCtrl',
    templateUrl: 'partials/polls.html',
    activeTab: 'POLLS'
  })
  .when('/player/:name', {
    controller: 'PlayerCtrl',
    controllerAs: 'playerCtrl',
    templateUrl: 'partials/player.html',
    activeTab: 'PLAYER'
  })
  .otherwise({
    redirectTo: '/home'
  });
});

/**
 * @ngdoc function
 * @name ppPollsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ppPollsApp
 */
 app.controller('MainCtrl', function ($rootScope, $http, $scope, $route) {
  this.activeTab = 1;

  this.isActive = function (tab) {
    return ($route && $route.current && $route.current.activeTab && $route.current.activeTab == tab);
  };

  var game = new Game();
  $rootScope.game = game;

  var DATA_URL = location.href.indexOf('firebase') == -1 ? '/matches.json' : 'https://ping-pong-rankings.firebaseio.com/.json'

  $http.get(DATA_URL).then(function (response) {
    if (response.status == 200) {
      var json = response.data;
      var matches = json.data.matches;
      matches.forEach(function (item, i) {
        item.date = new Date(item.date);
      });
      matches.sort(function (match1, match2) {
        return match1.date - match2.date;
      });
      var players = ['Jason', 'Steven', 'David', 'Roman', 'John', 'Tyler', 'Arvin', 'Doug'];
      for (var i = 0; i < players.length; i++) {
        game.addPlayer(players[i]);
      }
      for (var i = 0; i < matches.length; i++) {
        game.addMatch(matches[i]);
      }
    }
  }, function (error) {
    console.log(error);
  });
});

app.controller('PlayerCtrl', function ($rootScope, $scope, $routeParams) {
  var game = $rootScope.game;
  var player = game.findPlayerByName($routeParams.name);
  player.histories = game.getPlayerHistory(player.name);
  $scope.player = player;
  $scope.playerMatches = game.getMatchesByPlayer(player.name);


});

app.controller('PollsCtrl', function ($scope, $http, $rootScope) {
  $scope.game = $rootScope.game;
  this.getSeedClasses = function (previousSeed, currentSeed) {
    return {
      'glyphicon-arrow-up': currentSeed < previousSeed,
      'glyphicon-arrow-down': currentSeed > previousSeed,
      'match-won': currentSeed < previousSeed,
      'match-lost': currentSeed > previousSeed
    }
  }
});