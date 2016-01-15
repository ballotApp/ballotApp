'use strict'

//create database connection
let knex = require('knex')({
  client: 'mysql',
  connection: {
    host      : 'mysqlcluster7.registeredsite.com',
    user      : 'ballot_admin',
    password  : '!Qaz2wsx3edc',
    database  : 'greenfield_ballot',
    charset   : 'utf8'
  }
});

//define module requirements
let _ = require('lodash');
let Bookshelf = require('bookshelf')(knex);
let express = require('express');
let bodyParser = require('body-parser');

//create instance of express app as app
let app = express();

//application router
let router = express.Router();

//application body-parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//////////////////////
//      Models      //
//////////////////////
//ballot model

let Ballot = Bookshelf.Model.extend({
  tableName: 'ballot',

  hasTimestamps: true,

  user_vote: function () {
    return this.hasMany(UserVote, 'ballot_id');
  }

});

//user profile model
let UserProfile = Bookshelf.Model.extend({
  tableName: 'user_profile',

  userVote: function () {
    return this.hasMany(UserVote, 'user_id')
  }

});

//user vote model
let UserVote = Bookshelf.Model.extend({
  tableName: 'user_vote',

  userProfile: function () {
    return this.belongsTo(UserProfile);
  },

  ballot: function () {
    return this.belongsTo(Ballot, 'ballot_id');
  },

  countVotes: function(cb, ballotId) {
    console.log('+++ line 70 iside countVotes ballotID =>')
    Bookshelf.knex('user_vote')
    .count('user_id as userVotes')
    .where({ballot_id: ballotId})
    .then(function (userVotes) {
      //let userVotes = 2;
      console.log('++++ line 76 inside countVotes function of UserVote');
      console.log('+++ line 77', userVotes);
      cb(null, userVotes);
    })
    .catch(function(err){
      cb(err);
    });
  }
});

//////////////////////
//   Collections    //
//////////////////////
//Ballots collection
let Ballots = Bookshelf.Collection.extend({
  model: Ballot

});

//UserProfiles collection
let UserProfiles = Bookshelf.Collection.extend({
  model: UserProfile
});

//UserVotes collection
let UserVotes = Bookshelf.Collection.extend({
  model: UserVote
});

//////////////////////
//   API Endpoints  //
//////////////////////
// //Ballots
// //Collection Ballots
// //Model Ballot
//
// /*
//     *GET       /ballots                              //fetch all ballots
//     *POST      /ballots                              //create a new ballots
//     TODO GET       /ballots/:id                          //fetch a single ballot by id
//     TODO GET       /ballots/:id                          //fetch a single ballot by ballot code
//     TODO GET       /ballots/user/:user_id                //fetch all ballots by user_id
//     TODO PUT       /ballots/:id                          //update ballot
//     TODO DELETE    /ballots/:id                          //delete ballot
// */
router.route('/ballots')
//GET       /ballots                              //fetch all ballots
.get(function (req, res) {
  Ballots.forge()
  .fetch()
  .then(function (ballots) {
    res.json({error: false, data: ballots.toJSON()});
  })
  .catch(function (err) {
    res.status(500).json({error: true, data: {message: err.message}});
  });
})
.post(function (req, res) {
  //*POST      /ballots                              //create a new ballots
  //console.log('request => ', req);
  //console.log('request.body => ', req.body);
  //create user
  var user_id, ballot_id;
  var user_name = req.body.name;
  UserProfile.forge({name: req.body.name}) //get newly created id from user_profile table
  .save()
  .then(function(user_profile) {
    user_id = user_profile.get('id');
    console.log('user_id', user_id);
  })
  .then(function(){
    console.log('inserting Ballot with user_id', user_id);
    Ballot.forge({ //create ballot
      ballot_name: req.body.ballotName,
      user_id: user_id,
      ballot_option_one: req.body.ballotOptionOne,
      ballot_option_two: req.body.ballotOptionTwo,
      ballot_option_three: req.body.ballotOptionThree,
      ballot_option_four: req.body.ballotOptionFour,
      ballot_option_five: req.body.ballotOptionFive,
      ballot_code: req.body.ballotCode
    })
    .save()
    .then(function (ballot) {
      ballot_id =  ballot.get('id');
      console.log('ballot_id', ballot_id);
    })
    .then(function(){
      console.log('inserting user vote with ballot_id of ', ballot_id, 'and user_id of ', user_id);
      UserVote.forge({
        user_id: user_id,
        user_name: user_name,
        ballot_id: ballot_id
      })
      .save()
      .then(function (user_vote) {
        res.json({error: false, data: {id: user_vote.get('id')}});
      })
    })
  })
  .catch(function (err) {
    res.status(500).json({error: true, data: {message: err.message}});
  });
})
.put(function (req, res) {
  Ballot.forge({id:req.body.id})
  .fetch({require: true})
  .then(function (ballot) {
    ballot.save({
      ballot_name: req.body.ballotName || ballot.get('ballotName'),
      user_id: req.body.userId || ballot.get('userId'),
      ballot_option_one: req.body.ballotOptionOne || ballot.get('ballotOptionOne'),
      ballot_option_two: req.body.ballotOptionTwo || ballot.get('ballotOptionTwo'),
      ballot_option_three: req.body.ballotOptionThree || ballot.get('ballotOptionThree'),
      ballot_option_four: req.body.ballotOptionFour || ballot.get('ballotOptionFour'),
      ballot_option_five: req.body.ballotOptionFive || ballot.get('ballotOptionFive'),
      ballot_code: req.body.ballotCode || ballot.get('ballotCode')
    })
    .then(function () {
      res.json({error: false, data: {message: 'ballot details updated'}});
    })
    .catch(function() {
      res.status(500).json({error: true, data: {message: err.message}});
    });
  })
  .catch(function (err) {
    res.status(500).json({error: true, data: {message: err.message}});
  })
})
.delete(function (req, res) {
  Ballot.forge({id:req.body.id})
  .fetch({require: true})
  .then(function (ballot) {
    ballot.destroy()
    .then(function() {
      res.json({error: true, data: {message: 'Successfully deleted'}});
    })
    .catch(function (err) {
      res.status(500).json({error: true, data: {message: err.message + 'inside then '}});
    });
  })
  .catch(function (err) {
    res.status(500).json({error: true, data: {message: err.message + ' outside then '}});
  });
});


router.route('/ballots/:ballotCode')
//     GET           // Ballots/ballotCode          //fetch ballot info based on ballotCode
.get(function (req, res) {
  console.log('inside get req.params.ballotCode', req.params.ballotCode, "req.params ", req.params);
  Ballot.forge({ballot_code: req.params.ballotCode})
  .fetch({withRelated: ['user_vote']})
  .then(function (ballot) {
    //console.log('inside get then ballot', ballot);
    if(!ballot) {

      res.status(404).json({error: true, data: {}});
    }
    else {
      //console.log('+++++ line 211 ballot', ballot);
      let ballotInfo = ballot.toJSON();
      //ballotInfo.userVoteCount=2;
      console.log("+++ line 214 server.js ballotInfo.id => ", ballotInfo.id);
      //count number of UserVote
      new UserVote().countVotes(function(err, result) {
        console.log("+++ line 217 server.js number of voters => ", result[0].userVotes);
        ballotInfo.userVoteCount = result[0].userVotes;
        res.json({error: false, data: ballotInfo});
      }, ballotInfo.id);
    }
  })
  .catch(function (err) {
    res.status(500).json({error: true, data: {message: err.message}});
  });
})
.post(function(req, res) {
  var user_id, ballot_id, userVoteCount, username;
  //fetch ballot info by code
  Ballot.forge({ballot_code: req.params.ballotCode})
  .fetch()
  .then(function(ballot) {
    if(!ballot) {
      res.status(404).json({error: true, data: {}});
    }
    else {
      let ballotInfo = ballot.toJSON();
      //get ballot_id
      ballot_id = ballotInfo.id;

    }
  })
  .then(function() {
    //insert user_profile with as Voter+ballot_code+(currentCountVotes + 1)
    //get current vote count see .get function in this route
    new UserVote().countVotes(function(err, result) {
      console.log()
      userVoteCount = result[0].userVotes;
      console.log('userVoteCount', userVoteCount);
      if(!req.body.username) {
        username = 'Voter' + req.params.ballotCode + (parseInt(userVoteCount) + 1);
      }
      else {
        username = req.body.username;
      }
      UserProfile.forge({ name: username})
      .save()
      .then(function(user_profile) {
        user_id = user_profile.get('id');
      })
      .then(function() {
        UserVote.forge({ //insert user_vote with ballot_id and user_id
          user_id: user_id,
          user_name: username,
          ballot_id: ballot_id
        })
        .save()
        .then(function (user_vote) {
          res.json({error: false, data: {id: user_vote.get('id')}});
        })
      })
    }, ballot_id);
  })
  .catch(function(err) {
    res.status(500).json({error: true, data: {message: err.message}});
  });
});

router.route('/ballots/:ballotCode/:username')
//     POST           // Ballots/ballotCode/username          //fetch ballot info based on ballotCode and insert user
.post(function(req, res) {
  var user_id, ballot_id, userVoteCount, username;
  //fetch ballot info by code
  console.log('+++req.params = > ', req.params);
  Ballot.forge({ballot_code: req.params.ballotCode})
  .fetch()
  .then(function(ballot) {
    if(!ballot) {
      res.status(404).json({error: true, data: {}});
    }
    else {
      let ballotInfo = ballot.toJSON();
      //get ballot_id
      ballot_id = ballotInfo.id;

    }
  })
  .then(function() {
    //insert user_profile with as Voter+ballot_code+(currentCountVotes + 1)
    //get current vote count see .get function in this route
    new UserVote().countVotes(function(err, result) {
      console.log()
      userVoteCount = result[0].userVotes;
      console.log('userVoteCount', userVoteCount);
      if(!req.params.username) {
        username = 'Voter' + req.params.ballotCode + (parseInt(userVoteCount) + 1);
      }
      else {
        username = req.params.username;
      }
      UserProfile.forge({ name: username})
      .save()
      .then(function(user_profile) {
        user_id = user_profile.get('id');
      })
      .then(function() {
        UserVote.forge({ //insert user_vote with ballot_id and user_id
          user_id: user_id,
          user_name: username,
          ballot_id: ballot_id
        })
        .save()
        .then(function (user_vote) {
          res.json({error: false, data: {id: user_vote.get('id')}});
        })
      })
    }, ballot_id);
  })
  .catch(function(err) {
    res.status(500).json({error: true, data: {message: err.message}});
  });
});


//serve static assets
app.use(express.static(__dirname + '/..' + '/client'));
app.use('/api', router);

//cors
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

//start simple server listening
app.listen(8000, function() {
  console.log("✔ Express server listening on port %d", 8000, app.get('env'));
});
