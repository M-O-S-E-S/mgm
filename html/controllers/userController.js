angular.module('mgmApp')
  .controller('UserController', function($scope, $modal, userService, groupService) {
    $scope.users = userService.getUsers();
    $scope.$on("userService", function() {
      $scope.users = userService.getUsers();
    });

    $scope.search = {
      name: "",
      email: ""
    }

    $scope.error = {
      name: "",
      email: "",
      pword: "",
      template: ""
    }

    $scope.groups = [];

    $scope.user = {
      current: undefined,
      modal: undefined,
      showManage: function(selected) {
        this.current = selected;
        this.modal = $modal.open({
          templateUrl: '/templates/manageUserModal.html',
          keyboard: false,
          scope: $scope
        });
      },
      groups: [],
      nonGroups: [],
      showGroups: function(selected) {
        this.current = selected;
        $scope.groups = groupService.getGroups();
        $scope.user.groups = [];
        $scope.groups.forEach(function(group) {
          group.members.forEach(function(user) {
            if (user.OwnerID == selected.uuid) {
              $scope.user.groups.push(group);
            }
          });
        });
        $scope.user.nonGroups = $.grep($scope.groups, function(el) {
          return $.inArray(el, $scope.user.groups) == -1
        });
        this.modal = $modal.open({
          templateUrl: '/templates/manageUserGroupsModal.html',
          keyboard: false,
          scope: $scope
        });
      },
      addUserToGroup: function(group, role) {
        if (!group || !role) {
          console.log('role or group missing');
          return;
        }
        groupService.addUserToGroup($scope.user.current, group, role).then(
          function() { //success
            alertify.success($scope.user.current.name + " added to " + group.name);
            var index = $scope.user.nonGroups.indexOf(group)
            $scope.user.nonGroups.splice(index, 1);
            $scope.user.groups.push(group);
          },
          function(reason) {
            alertify.error(reason);
          }
        );
      },
      removeFromGroup: function(group) {
        if (!group) {
          return;
        }
        groupService.removeUserFromGroup($scope.user.current, group).then(
          function() { //success
            alertify.success($scope.user.current.name + " removed from " + group.name);
            var index = $scope.user.groups.indexOf(group)
            $scope.user.groups.splice(index, 1);
            $scope.user.nonGroups.push(group);
          },
          function(reason) {
            alertify.error(reason);
          }
        );
      },
      isSuspended: function(u) {
        var enabled = false;
        for (var i = 0; i < u.identities.length; i++) {
          if (u.identities[i].Enabled) {
            enabled = true;
          }
        };
        return !enabled;
      },
      suspend: function() {
        userService.suspend(this.current).then(
          function() {
            alertify.success("User " + $scope.user.current.name + " suspended")
          },
          function(msg) {
            alertify.error(msg);
          }
        );
      },
      restore: function() {
        userService.restore(this.current).then(
          function() {
            alertify.success("User " + $scope.user.current.name + " restored")
          },
          function(msg) {
            alertify.error(msg);
          }
        );
      },
      setEmail: function(email) {
        if (email.trim == this.current.email.trim()) {
          alertify.log('No Change in Email');
          return;
        }
        if (!/(.+)@(.+){2,}\.(.+){2,}/.test(email)) {
          alertify.error('Invalid email entered');
          return;
        }
        userService.setEmail(this.current, email).then(
          function() {
            alertify.success("Email for " + $scope.user.current.name + " changed successfully");
          },
          function(msg) {
            alertify.error(msg);
          }
        );
      },
      setPassword: function(password) {
        userService.setPassword(this.current, password).then(
          function() {
            alertify.success("Password for " + $scope.user.current.name + " changed successfully");
          },
          function(msg) {
            alertify.error(msg);
          }
        );
      },
      setAccessLevel: function(level) {
        if (level === undefined || level === "") {
          alertify.error("invalid user level");
          return;
        }
        if (Math.floor(level) != level) {
          alertify.error("user level is an integert value between 0 and 250");
          return;
        }
        if (level < 0 || level > 250) {
          alertify.error("user level is an integert value between 0 and 250");
          return;
        }
        userService.setAccessLevel(this.current, level).then(
          function() {
            alertify.success("User level for " + $scope.user.current.name + " has been changed to " + level);
          },
          function(msg) {
            alertify.error(msg);
          }
        );
      },
      showAdd: function() {
        this.modal = $modal.open({
          templateUrl: '/templates/createUserModal.html',
          keyboard: false,
          scope: $scope
        });
      },
      create: function(username, email, template, password) {
        $scope.error.name = "";
        $scope.error.email = "";
        $scope.error.pword = "";
        $scope.error.template = "";
        if (username === undefined) {
          $scope.error.name = '"FirstName LastName" required';
          return;
        }
        if (email === undefined) {
          $scope.error.email = 'Invalid email entered';
          return;
        }
        if (password === undefined) {
          $scope.error.pword = 'A password is required';
          return;
        }
        username = username.trim();
        email = email.trim();
        password = password.trim();
        if (username.split(" ").length != 2) {
          $scope.error.name = '"FirstName LastName" required';
          return;
        }
        if (!/(.+)@(.+){2,}\.(.+){2,}/.test(email)) {
          $scope.error.email = 'Invalid email entered';
          return;
        }
        if (password == "") {
          $scope.error.pword = 'A password is required';
          return;
        }
        if (template != "M" && template != "F") {
          $scope.error.template = 'Select your template';
          return;
        }

        //check for conflicts in existing users
        for (var i = 0; i < $scope.users.length; i++) {
          if ($scope.users[i].name.toUpperCase() === username.toUpperCase()) {
            $scope.error.name = "Name already in use";
            return;
          }
        }

        userService.create(username, email, template, password).then(
          function() {
            alertify.success("Account created successfully")
          },
          function(msg) {
            alertify.error(msg);
          }
        );
      },
      remove: function(user) {
        alertify.confirm("Are you sure? This purges the user and their avatar from the grid", function(confirmed) {
          if (confirmed) {
            userService.remove(user).then(
              function() {
                alertify.success("User " + user.name + " has been deleted");
              },
              function(msg) {
                alertify.error(msg);
              }
            );
          }
        });
      }
    }
  });
