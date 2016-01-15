'use strict';

/**
 * @ngdoc function
 * @name ballotTempApp.controller:UserVotingPageCtrl
 * @description
 * # BallotCreationCtrl
 * Controller of the ballotTempApp
 */
angular.module('angularBestPracticeApp')
  .controller('UserVotingPageCtrl',function($scope, $http, $rootScope){
    $http.get("/api/ballots/" + $scope.userGivenCode)
    .success(function(data){
      $scope.ballotData = data;
      $scope.userTopic = $scope.ballotData.data.ballot_name;
      console.log("this is $scope.ballotData", $scope.ballotData);
      $scope.choices[0].choice = $scope.ballotData.data.ballot_option_one;
      $scope.choices[1].choice = $scope.ballotData.data.ballot_option_two;
      $scope.choices[2].choice = $scope.ballotData.data.ballot_option_three;
      $scope.choices[3].choice = $scope.ballotData.data.ballot_option_four;
      $scope.choices[4].choice = $scope.ballotData.data.ballot_option_five;
    });

    $scope.choices = [
      {
        filterId: 1,
      },
      {
        filterId: 2,
      },
      {
        filterId: 3,
      },
      {
        filterId: 4,
      },
      {
        filterId: 5,
      }
    ];

    // $scope.buttonColor = false;
    // $scope.changeButtonColor = function(){
    //   $scope.buttonColor = !$scope.buttonColor;
    // };

    $scope.selectedIndex = 0;

    $scope.select = function(i){
      $scope.selectedIndex = i;
      console.log(this.choice.choice);
    };

    $scope.endVoting = function(){
      console.log("inside endVoting function");
    };
  });














  // $scope.userVotingInfo = [];
  // $scope.saveData = function(){
  //   console.log($scope.userVotingInfo);
  // };
