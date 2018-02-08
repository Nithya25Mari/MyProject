$scope.registerClick = function () {
              
            $("div#divLoading").addClass('show');

            $http.post('/signup', $scope.register).success(function (response) {


                $scope.registerreset();
               
                if (response.ErrorCode == "HCR001") {
                    $scope.ErrorClass = "red"
                }
                if (response.ErrorCode == "HCR002") {
                    $scope.ErrorClass = "red"
                }
                if (response.ErrorCode == "HCR003") {
                    $scope.ErrorClass = "red"
                }
                if (response.ErrorCode == "HCR004") {
                    $scope.ErrorClass = "red"
                }
                if (response.ErrorCode == "HCR005") {
                    $scope.ErrorClass = "green"
                    $scope.ErrorClass = "green"
                    $scope.register = null;
                }
                if (response.ErrorCode == "HCR006") {
                    $scope.ErrorClass = "red"
                }
                if (response.ErrorCode == "HCR007") {
                    $scope.ErrorClass = "red"
                }
                $timeout(function (e) {
                    $("div#divLoading").removeClass('show');
                }, 200)

                
                $scope.ErrorMessageShown = response.ErrorMsg;

                setTimeout(function () {
                    $scope.ErrorMessageShown = "";
                    $scope.$digest();
                }, 5000);
               
            }).error(function (err) {
              
            });
        };
