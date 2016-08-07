
// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.version'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.when('/main', {
    templateUrl: chrome.extension.getURL('src/app/src/routes/main.html'),
    controller: 'MainCtrl'
  });

  $routeProvider.otherwise({redirectTo: '/main'});
}])

.controller('MainCtrl', ['$scope', function($scope) {

}])

;
