'use strict';

/**
 * @ngdoc function
 * @name ballotTempApp.controller:BallotInitiationCtrl
 * @description
 * # BallotCreationCtrl
 * Controller of the ballotTempApp
 */
angular.module('angularBestPracticeApp')
  .controller('BallotInitiationCtrl', ['$scope', '$rootScope', 'UserFactory', function($scope, $rootScope, UserFactory){
    $rootScope.randomCode = (new Date()).getTime().toString().slice(8);
    $scope.enterBallotCode = function(){
      $rootScope.userGivenCode = $scope.userGivenCode;
      console.log("this is $rootScope.userGivenCode", $rootScope.userGivenCode);
      console.log("this is the userGivenUserName", $scope.userGivenUserName);
    };

    $scope.saveUser = function(user){
      console.log('inside of saveUser, the user is:', user);
      UserFactory.setUser(user);
    }
  }])
  .factory('UserFactory', function(){
    var user = '';
    var setUser = function(username){
      user = username;
    }
    var getUser = function(){
      return user;
    }

    return {
      getUser: getUser,
      setUser : setUser
    }
  });
