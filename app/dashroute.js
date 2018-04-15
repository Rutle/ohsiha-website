'use strict';
// ./app/dashroute.js
// Route file for dashboard page.

var dbf         = require('./database');
var TwitterData = require('./models/twitterdata');
var twit        = require('./tweets');
var markovGen   = require('./markovgen')


// GET "/dashboard" URL
exports.getDBoard = function(req, res){
  var twitterLink = true;
	var dataAvailable = true;
  var isArticles = true;
	if (req.user.twitter.token === undefined) {
		twitterLink = false;
	}
  console.log("Dashboard route: ");

  TwitterData.findOne({'author': req.user._id}, function(err, tweetData) {
    if (err) {
      return next(err);
    }
    if(!tweetData) {
      dataAvailable = false;
      console.log("No twitter data.");
    // A document was found.
    } else {
      dataAvailable = true;
      console.log("Twitter data is available");
    }

    dbf.getArticles(req, function(err, articles) {
      if (articles.length === 0) {
        isArticles = false;
        console.log("No articles.");
      }

      var wcData = {};
      var wcArray = [];
      if(dataAvailable) {
        for (var j = 0; j < tweetData.content.length; j++) {
          var tempResArray = [];
          tempResArray = tweetData.content[j].toLowerCase().split(' ');
          for(var k = 0; k < tempResArray.length; k++) {
            if(!wcData[tempResArray[k]]) {
              wcData[tempResArray[k]] = 0;
            }
            wcData[tempResArray[k]]++;
          }
        }
        for(var item in wcData) {
          wcArray.push({text: item, size: wcData[item] + Math.floor(Math.random() * 90)});
        }
        console.log("dataa oli saatavilla");
      }
      res.render('dashboard', {
        userIsLogged: (req.user ? true : false),
        user: req.user,
        isTwitterLinked: twitterLink,
        isDataAvailable: dataAvailable,
        isArticles: isArticles,
        articles: articles,
        wordData: JSON.stringify(wcArray)
      });
    })
  })

/*

	// To reduce database calls we add information to session data about twitter
	// data availability.
  // Session variable twitterDataAvailable is undefined
	if (req.session.twitterDataAvailable === undefined) {
		TwitterData.findOne({'author': req.user._id}, function(err, tweetData) {
			if (err) {
				return next(err);
			}
			// Didn't find a document by user.
			if(!tweetData) {
				req.session.twitterDataAvailable = "false";
        dataAvailable = false;
				console.log("No twitter data.");
      // A document was found.
      } else {
				req.session.twitterDataAvailable = "true";
        dataAvailable = true;
        console.log("Twitter data is available");
			}
      // Fetch articles created by user.
      dbf.getArticles(req, function(err, articles) {
        if (articles.length === 0) {
          isArticles = false;
        }
        console.log("Artikkelit haettu!")
        console.log(articles);
        var wcData = {};
        var wcArray = [];
        if(dataAvailable) {
          for (var j = 0; j < tweetData.content.length; j++) {
            var tempResArray = [];
            tempResArray = tweetData.content[j].toLowerCase().split(' ');
            for(var k = 0; k < tempResArray.length; k++) {
              if(!wcData[tempResArray[k]]) {
                wcData[tempResArray[k]] = 0;
              }
              wcData[tempResArray[k]]++;
            }
          }
          for(var item in wcData) {
            wcArray.push({text: item, size: wcData[item] + Math.floor(Math.random() * 90)});
          }
          console.log("dataa oli saatavilla");
        }
        console.log(wcArray);
        //var wcdatatata = [{text:"Hello",size:20},{text:"World",size:10},{text:"Normally",size:25},{text:"You",size:15},{text:"Want",size:30},{text:"More",size:12},{text:"texts",size:8},{text:"But",size:18},{text:"Who",size:22},{text:"Cares",size:27}];
        res.render('dashboard', {
          userIsLogged: (req.user ? true : false),
          user: req.user,
          isTwitterLinked: twitterLink,
          isDataAvailable: dataAvailable,
          isArticles: isArticles,
          articles: articles,
          wordData: JSON.stringify(wcArray)
        });
      });
		});
  // Session variable twitterDataAvailable is false:
  } else if (req.session.twitterDataAvailable === "false") {
    dataAvailable = false;
    // Fetch articles created by user.
    dbf.getArticles(req, function(err, articles) {
      if (articles.length === 0) {
        isArticles = false;
      }
      console.log("Artikkelit haettu lopussa, koska on false");
      console.log(articles);
      res.render('dashboard', {
        userIsLogged: (req.user ? true : false),
        user: req.user,
        isTwitterLinked: twitterLink,
        isDataAvailable: dataAvailable,
        isArticles: isArticles,
        articles: articles
      });
    });
  // Session variable twitterDataAvailable is true:
	} else {
    console.log("session dataAvailable on true");
    // Fetch articles created by user.
    dbf.getArticles(req, function(err, articles) {
      if (articles.length === 0) {
        isArticles = false;
      }
      TwitterData.findOne({'author': req.user._id}, function(err, tweetData) {
        if (err) {
          return next(err);
        }
        var wcData = {};
        var wcArray = [];
        if(dataAvailable) {
          for (var j = 0; j < tweetData.content.length; j++) {
            var tempResArray = [];
            tempResArray = tweetData.content[j].toLowerCase().split(' ');
            for(var k = 0; k < tempResArray.length; k++) {
              if(!wcData[tempResArray[k]]) {
                wcData[tempResArray[k]] = 0;
              }
              wcData[tempResArray[k]]++;
            }
          }
          for(var item in wcData) {
            wcArray.push({text: item, size: wcData[item] + Math.floor(Math.random() * 90)});
          }
          console.log("dataa oli saatavilla ihan vika else");
        }
        console.log(wcArray);
        //var wcdatatata = [{text:"Hello",size:20},{text:"World",size:10},{text:"Normally",size:25},{text:"You",size:15},{text:"Want",size:30},{text:"More",size:12},{text:"texts",size:8},{text:"But",size:18},{text:"Who",size:22},{text:"Cares",size:27}];
        console.log("Artikkelit haettu lopussa, koska ei ole undefined");
        console.log("Stringify:", JSON.stringify(wcArray));
        res.render('dashboard', {
          userIsLogged: (req.user ? true : false),
          user: req.user,
          isTwitterLinked: twitterLink,
          isDataAvailable: dataAvailable,
          isArticles: isArticles,
          articles: articles,
          wordData: JSON.stringify(wcArray)
        });
      });
    });
  }*/
};

exports.postDBoard = function(req, res, next) {
  var tweets = [];

  // Catch generate and fetch/update data ajax calls from forms in
  // "Generate"-tab.

  // Fetch/update button.
  if (req.body.form === "fetchData") {
    twit.getTweets(req.user.twitter.id, 3, function(err, result) {
      TwitterData.findOne({'author': req.user._id}, function(err, tweetData) {
        if (err)
          return next(err);

        // Found existing document by the user.
        if (tweetData) {
          tweetData.content = result;
          tweetData.dateModified = new Date();
          console.log("existing: ", tweetData);
          tweetData.save(function(err) {
            if(err) {
              console.error(err);
              return next(err);
            }
          });
        // New document
        } else {
          var newTweetData = new TwitterData();
          newTweetData.author = req.user._id;
          newTweetData.content = result;
          console.log("created new: ", newTweetData)
          newTweetData.save(function(err) {
            if(err) {
              console.error(err);
              return next(err);
            }
          });

        }
        // Add information to session that twitter data is available.
        req.session.twitterDataAvailable = "true";
        res.send(JSON.stringify(result));
      });
    });
    // Generate button
  } else if (req.body.form === "generatePost") {
    TwitterData.findOne({'author': req.user._id}, function(err, tweetData) {
      if (err) {
        return next(err);
      }
      if (!tweetData) {
        return res.status(500).send('There was no data to generate a post.');
      } else {
        markovGen.getSentences(tweetData.content, 2, function(err, result) {
          if (err) {
            return res.status(500).send('There was not enough data to generate a post.');
          }

          var data = "";
          for (var i = 0; i < 2; i++) {
            console.log("postaus: ["+result[i].string+"]");
            data += result[i].string + " ";

          }
          return res.status(200).send({
            userIsLogged: (req.user ? true : false),
            title: "Clever musings.",
            dateCreated: new Date().toDateString(),
            data: data,
            author: req.user.twitter.displayName,
            //wordcloudData: wcArray
          });
        })
      }
    });
  }

}
