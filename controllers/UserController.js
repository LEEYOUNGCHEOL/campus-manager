var UserModel = require('../models/UserModel.js');
var _ = require('underscore');
var moment = require('moment');

/**
* UserController.js
*
* @description :: Server-side logic for managing users.
*/
module.exports = {

  /**
  * UserController.list()
  */
  list: function(req, res) {
    UserModel.find({
      client: req.user.client
    }, null, {
      sort: 'last_name',
    }, function(err, users){
      if(err) {
        return res.json(500, {
          message: 'Error getting user.'
        });
      }
      return res.json(users);
    });
  },

  /**
  * UserController.show()
  */
  show: function(req, res) {
    var id = req.params.id;
    UserModel.findOne({
      _id: id,
      client: req.user.client
    }, function(err, user){
      if(err) {
        return res.json(500, {
          message: 'Error getting user.'
        });
      }
      if(!user) {
        return res.json(404, {
          message: 'No such user'
        });
      }
      return res.json(user);
    });
  },

  /**
  * UserController.create()
  */
  create: function(req, res) {
    var user = new UserModel();

    var attributes = [
      'idn',
      'first_name',
      'last_name',
      'email',
      'phone',
      'website',
      'github',
      'is_admin',
      'is_instructor',
      'is_student',
      'codecademy',
      'zipcode',
      'photo'
    ];

    _.each(attributes, function(attr) {
      user[attr] =  req.body[attr] ? req.body[attr] : user[attr];
    });
    user.username = req.body.username ? req.body.username.toLowerCase() : user.username;

    UserModel.findOne({
      _id: req.user.id
    }).populate('client').exec(function(err, currentUser) {
      user.client = currentUser.client.id;
      user.save(function(err, user){
        if(err) {
          return res.json(500, {
            message: 'Error saving user',
            error: err
          });
        }
        return res.json(user);
      });
    });
  },

  /**
  * UserController.update()
  */
  update: function(req, res) {
    var id = req.params.id;
    UserModel.findOne({
      _id: id,
      client: req.user.client
    }, function(err, user){
      if(err) {
        return res.json(500, {
          message: 'Error saving user',
          error: err
        });
      }
      if(!user) {
        return res.json(404, {
          message: 'No such user'
        });
      }

      var attributes = [
        'idn',
        'first_name',
        'last_name',
        'email',
        'phone',
        'website',
        'github',
        'is_admin',
        'is_instructor',
        'is_student',
        'attendance',
        'codecademy',
        'zipcode',
        'photo'
      ];

      _.each(attributes, function(attr) {
        user[attr] =  req.body[attr] ? req.body[attr] : user[attr];
      });
      user.username = req.body.username ? req.body.username.toLowerCase() : user.username;

      user.save(function(err, user){
        if(err) {
          return res.json(500, {
            message: 'Error getting user.'
          });
        }
        if(!user) {
          return res.json(404, {
            message: 'No such user'
          });
        }
        return res.json(user);
      });
    });
  },

  /**
  * UserController.remove()
  */
  remove: function(req, res) {
    var id = req.params.id;
    UserModel.remove({
      _id: id,
      client: req.user.client
    }, function(err, user){
      if(err) {
        return res.json(500, {
          message: 'Error getting user.'
        });
      }
      return res.json(user);
    });
  },

  import: function(req, res) {
    _.each(req.body, function(reqUser) {
      UserModel.findOne({ username: reqUser['username'] }, function(err, existingUser) {
        var user = existingUser ? existingUser : new UserModel();

        var attributes = [
          'idn',
          'first_name',
          'last_name',
          'phone',
          'website',
          'github',
          'codecademy',
          'zipcode',
          'photo'
        ];

        _.each(attributes, function(attr) {
          user[attr] = reqUser[attr] ? reqUser[attr] : user[attr];
        });
        user.username = reqUser.username ? reqUser.username.toLowerCase() : user.username;

        user.is_student = true;

        UserModel.findOne({ _id: req.user.id }).populate('client').exec(function(err, currentUser) {
          user.client = currentUser.client.id;
          user.save();
        });
      });
    });
    return res.json(req.body);
  },

  attendance: function(req, res) {
    _.each(req.body, function(checkIn) {
      UserModel.findOne({ idn: checkIn['IDN'] }, function(err, user) {
        if(err) {
          return res.json(500, {
            message: 'Error saving user',
            error: err
          });
        }
        if (!user.attendance) {
          user.attendance = [];
        }
        if (!_.some(user.attendance, function(date) { return moment(date).isSame(checkIn['Timestamp'], 'day')})) {
          user.attendance.push(checkIn['Timestamp']);
        }
        user.save();
      });
    });
    return res.json(req.body);
  }
};