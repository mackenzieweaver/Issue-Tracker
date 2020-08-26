'use strict';

// database connection
const uri = "mongodb+srv://macknz7:I6ZoDlS9ipLuP8qB@cluster0.j79xz.mongodb.net/issuetracker?retryWrites=true&w=majority";
const mongoose = require('mongoose');
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('database connected');
});

// schemas
const issueSchema = new mongoose.Schema({
  issue_title: String,
  issue_text: String,
  created_on: Date,
  updated_on: Date,
  created_by: String,
  assigned_to: String,
  open: Boolean,
  status_text: String, 
});

// models
const Issue = mongoose.model("Issue", issueSchema);

module.exports = function (app) {
    
    app.get('/new', function (req, res){
      var project = req.params.project;
      if (Object.keys(req.query).length == 0){
        Issue.find({ issue_title: project }, function(err, issues) {
          if (err) {
            console.log(err);
          } else {
            res.send(issues);
          }
        });
      } else {
        Issue.find(req.query, function(err, issues) {
          if (err) {
            console.log(err);
          } else {
            res.send(issues);
          }
        });
      }
    });
    
    app.post('/new', function (req, res){
      const issue = new Issue({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_on: new Date(),
        updated_on: new Date(),
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        open: true,
        status_text: req.body.status_text
      });
      issue.save().then(issue => res.send(issue));
    });

    app.post('/update', function(req, res){
        Issue.findById(req.body._id, function(err, issue){
            if(err){
            res.send('could not update ' + req.body._id);
            } else if(
                req.body.issue_title == '' &&
                req.body.issue_text == '' &&
                req.body.created_by == '' &&
                req.body.assigned_to == '' &&
                req.body.status_text == '' &&
                !req.body.open
            ){
            res.send('no updated field sent');
            } else {
            issue.issue_title = req.body.issue_title ?  req.body.issue_title : issue.issue_title;
            issue.issue_text = req.body.issue_text ?  req.body.issue_text : issue.issue_text;
            issue.updated_on = new Date();
            issue.created_by = req.body.created_by ?  req.body.created_by : issue.created_by;
            issue.assigned_to = req.body.assigned_to ? req.body.assigned_to : issue.assigned_to;
            issue.open = req.body.open ? false : true;
            issue.status_text = req.body.status_text ? req.body.status_text : issue.status_text;
            issue.save().then(res.send('successfully updated'));
            }
        })
    });

    app.post('/delete', function (req, res) {
        Issue.findById(req.body._id, function(err, issue){
        if(err){
            res.send('_id error');
        } else {
            Issue.deleteOne({_id: req.body._id}, (err, issue) => {
            if(err){
                console.log(err);
            } else if(issue.n == 0){
                res.send('could not delete ' + req.body._id);
            } else {
                res.send('deleted ' + req.body._id);
            }
            });
        }
        });
    });    

    app.get('/open', function (req, res) {
        Issue.find({open: true}, function(err, docs){
            if(err){
                console.log(err);
            } else {
                res.render('issues', {issues: docs});
            }
        });
    });

    app.get('/closed', function (req, res) {
        Issue.find({open: false}, function(err, docs){
            if(err){
                console.log(err);
            } else {
                res.render('issues', {issues: docs});
            }
        });
    });
};
