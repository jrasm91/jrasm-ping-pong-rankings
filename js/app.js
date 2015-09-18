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
    .when('/rankings', {
      controller: 'PollsCtrl',
      controllerAs: 'pollsCtrl',
      templateUrl: 'partials/rankings.html',
      activeTab: 'RANKINGS'
    })
    .when('/players', {
      controller: 'PollsCtrl',
      controllerAs: 'pollsCtrl',
      templateUrl: 'partials/players.html',
      activeTab: 'PLAYERS'
    })
    .when('/matches', {
      controller: 'PollsCtrl',
      controllerAs: 'pollsCtrl',
      templateUrl: 'partials/matches.html',
      activeTab: 'MATCHES'
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
  this.isActive = function (tab) {
    $rootScope.activeTab = $route && $route.current && $route.current.activeTab ? $route.current.activeTab : 'HOME';
    return tab == $rootScope.activeTab;
  };

  var game = new Game();
  $rootScope.game = game;

  // var DATA_URL = location.href.indexOf('firebase') == -1 ? '/matches.json' : 'https://ping-pong-rankings.firebaseio.com/.json'

  $http.get('data/history.json').then(function (response) {
    if (response.status == 200) {
      var matches = response.data;
      matches.forEach(function (item, i) {
        item.date = new Date(item.date);
      });
      matches.sort(function (match1, match2) {
        return match1.date - match2.date;
      });
      for (var i = 0; i < matches.length; i++) {
        game.addMatch(matches[i]);
      }
    }
  }, function (error) {
    console.log(error);
  });
});

app.controller('PlayerCtrl', function ($rootScope, $scope, $location, $routeParams) {
  $rootScope.playerName = $routeParams.name;
  var game = $rootScope.game;
  var player = game.findPlayerByFullname($routeParams.name)
  if(!player || !player.name){
    return $location.path('/home');
  }
  player.histories = game.getPlayerHistory(player.name);
  player.playerMatches = game.getMatchesByPlayer(player.name);
  
  $scope.player = player;
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