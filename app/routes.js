'use strict';
// ./app/routes.js
// Route file

var dbf         = require('./database');
var TwitterData = require('./models/twitterdata');
var twit        = require('./tweets');
var markovGen   = require('./markovgen');
var User        = require('./models/user');
var Article     = require('./models/article');
const { matchedData } = require('express-validator/filter');

// GET "/dashboard" URL
exports.getDBoard = function(req, res){
  var twitterLink = true;
	var dataAvailable = true;
  var isArticles = true;
  var localLink = true;
	if (req.user.twitter.id === undefined) {
		twitterLink = false;
	}
  if (req.user.local.email === undefined) {
    localLink = false;
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

    dbf.getUserArticlesSorted(req.user._id, function(err, articles) {
      if (articles.length === 0) {
        isArticles = false;
        console.log("No articles.");
      }

      res.render('dashboard', {
        userIsLogged: (req.user ? true : false),
        user: req.user,
        isTwitterLinked: twitterLink,
        isLocalLinked: localLink,
        isDataAvailable: dataAvailable,
        isArticles: isArticles,
        articles: articles,
        //wordData: JSON.stringify(wcArray)
      });
    })
  })

/* Left it just in case

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
    twit.getTweets(req.user.twitter.id, 200, function(err, result) {
      TwitterData.findOne({'author': req.user._id}, function(err, tweetData) {
        if (err)
          return next(err);

        // Found existing document by the user.
        if (tweetData) {
          tweetData.content = result;
          tweetData.dateModified = new Date();
          //console.log("existing: ", tweetData);
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
          //console.log("created new: ", newTweetData)
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
        return res.status(500).send('There was a database error.');
      }
      if (!tweetData) {
        return res.status(500).send('There was no data to generate a post.');
      } else {
        markovGen.getSentences(tweetData.content, 5, function(err, result) {
          if (err) {
            return res.status(500).send('There was not enough data to generate a post.');
          }

          var data = {};
          data.refs = [];
          data.data = "";

          for (var i = 0; i < result.length; i++) {
            var tempstring = result[i].string;
            tempstring = tempstring[0].toUpperCase()+tempstring.substr(1);
            data.data += tempstring+ ". ";
            result[i].refs.forEach(function(element) {
              data.refs.push(element.string);
            });

          }
          //console.log(data.refs);
          return res.status(200).send({
            userIsLogged: (req.user ? true : false),
            title: "Clever musings.",
            dateCreated: new Date().toDateString(),
            data: data.data,
            refs: data.refs,  // Could have displayed there to the user. Senteces that were used as resource.
            author: req.user.twitter.displayName,
            //wordcloudData: wcArray
          });
        })
      }
    });
  } else if (req.body.form === "generateWordCloud") {
    //console.log("generateCloud")
    TwitterData.findOne({'author': req.user._id}, function(err, tweetData) {
      if (err) {
        return res.status(500).send('There was no data to generate a post.');
      }
      if(!tweetData) {
        return res.status(500).send('There was no data to generate a wordcloud.');
        //console.log("No twitter data.");
      // A document was found.
      }
      //console.log("paasstiin");
      var wcData = {};
      var wcArray = [];
      for (var j = 0; j < tweetData.content.length; j++) {
        var tempResArray = [];
        tempResArray = tweetData.content[j].toLowerCase().split(' ');
        for(var k = 0; k < tempResArray.length; k++) {
          // Leave out words that have length of 3 or less.
          if(!(tempResArray[k].trim().length <= 3)) {
            if(!wcData[tempResArray[k]]) {
              wcData[tempResArray[k]] = 0;
            }
            wcData[tempResArray[k]]++;
          } else {
            //console.log(tempResArray[k]);
          }

        }
      }

      for(var item in wcData) {
        wcArray.push({text: item, size: wcData[item]});
      }
      //console.log("wcArray: ", wcArray);

      return res.status(200).send({wordData: wcArray});
    });
  }

}

exports.addPost = function(req, res){
  //console.log("Article posted!");
  //console.log(req.body.generatedPost);
  var blogPost = req.body.generatedPost;
  var title = req.body.title;
  var dateCreated = new Date();

  User.findById(req.user._id, function(err, user) {
    if(err) {
      return res.render('error', {error: 'Database error when trying to find an user.'});
    }
    if(!user) {
      //return res.status(500).send({error: 'Trouble finding user.'});
    }
    var newArticle = new Article();
    newArticle.author = user._id;
    newArticle.title = title;
    newArticle.content = blogPost;
    var dateCreated = new Date(newArticle.dateCreated);

    // Add a new article into database.
    newArticle.save(function(err, product, numAffected) {
      if(err) {
        //return res.status(500).send({error: 'Database error when trying to save the article.'});
      }
      //console.log(product);
      return res.redirect('/article/'+newArticle.articleId);
    });

  });
  //console.log(dateCreated);

  /*
  res.render('articlepreview', {
    isSuccess: true,
    userIsLogged: (req.user ? true : false),
    user: req.user,
  });*/
}
exports.postComment = function(req, res) {
  const comData = matchedData(req);
  //console.log(req.user.fullName);
	// Explanation:
	// Article schema contains an array which contains objects with fields text,
	// author and dateCreated. We make an object like that.
	var comment = {text: comData.commentData, author: req.user._id,
								 dateCreated: new Date(), name: req.user.fullName};
	// We get the article and update it with the mongoose function and use option
	// '$push' to insert the object into the array. With the 'new: true' we recieve
	// the new updated document back to which we then use .populate functions
	// to fetch the author objects from User documents.
	// Getting updated document back is no longer relevant as I'm just redirecting
	// back to the article. Still leaving it back there.
	Article.findOneAndUpdate({'articleId':req.params.articleId},
													 {$push:{comments: comment} },
													 {new: true}).populate('comments.author')
													 .exec(function(err, data) {
			if(err) {
				return res.render('error', {error: "Comment failed.", errors: err});
			}
			res.redirect('/article/'+req.params.articleId);
		});
};

exports.updateProfile = function(req, res) {
  const userData = matchedData(req);
	//console.log("userData: ", userData)
	User.findOne({'local.email': req.user.local.email}, function(err, user) {
		if(err) {
			return next(err);
		}
		//console.log(req.body.password)
		user.comparePassword(userData.password, function(err, isMatch) {
			if (err) {
				res.status(500);
				return res.render('error', { error: 'Error happened when comparing passwords.' });
			}
			if(isMatch) {
				// Modify user's information acquired from the form.
				if (!(req.body.fname === "")) {
					user.local.firstName = userData.fname;
				}
				if (!(req.body.lname === "")) {
					user.local.lastName = userData.lname;
				}
				// Update information.
				user.save(function (err) {
					if(err) {
						console.error(err);
						res.status(500);
						return res.render('error', { error: 'Database error when trying to save changes.' });
					}
				});
				res.render('profileUpdated', {
					userIsLogged: (req.user ? true : false),
					user: req.user,
					isSuccess: true,
				});
			} else {
				return res.render('profileUpdated', {
					isSuccess: false,
					errors: ["Wrong password"],
					userIsLogged: (req.user ? true : false),
					user: req.user
				});
			}
		});
	});
}

exports.deleteUser = function(req, res){
  // Perhaps also remove all blog posts by this user as well.
  var user = req.user._id;

	User.findByIdAndRemove({ _id: user }, function(err, user) {
		if(err) {
			res.status(500);
			return res.render('error', { error: 'Database error when trying to delete user.' });
		}
		//console.log("user removed");
		TwitterData.findOneAndRemove({author: user}, function(err, data) {
			if(err) {
				res.status(500);
				return res.render('error', { error: 'Database error when trying to delete tweetdata.' });
			}
      //console.log("data: ", data);
			Article.find({author: user}).remove().exec( function(err, articles) {
        //console.log(articles);
				if(err) {
          console.log(err);
					res.status(500);
					return res.render('error', { error: 'Database error when trying to delete articles.' });
				}
        //console.log("poistettiin: ", articles);
			});
		});
	});
	req.logout();
	res.redirect('/');
};

exports.showArticle = function(req, res) {
  dbf.getArticle(req, function(err, data) {
    if(err) {
			res.status(500);
			return res.render('error', { error: 'Database error when trying to find an article.' });
    }
    // Couldn't find an article with given ID.
    if (data.length === 0) {
      isArticle = false;
      res.render('fullarticle', {
        userIsLogged: (req.user ? true : false),
        user: req.user,
        articleExists: false
      });
    } else {
			//console.log(data.comments);
      res.render('fullarticle', {
        userIsLogged: (req.user ? true : false),
        user: req.user,
        title: data.title,
        blogPost: data.content,
        author: data.author.fullName,
        dateCreated: new Date(data.dateCreated).toDateString(),
        articleExists: true,
				articleId: data.articleId,
				comments: data.comments
      })
    }

  });
};

exports.blog = function(req, res) {
	var currentPage = 0;
	if(typeof(req.params.page) === 'undefined' || req.params.page === "0" || req.params.page === "1") {
		// Main page
		currentPage = 1;
	} else {
		currentPage = parseInt(req.params.page);
	}
	var isArticles = true;
	dbf.getArticlesSorted(function(err, articles) {
		if(err) {
			isArticles = false;
			res.status(500);
			return res.render('error', { error: 'Database error.' });
		}

		if(articles.length === 0) {
			isArticles = false;
		}

		var pageArticles = articles.slice(((currentPage-1)*5), (currentPage*5));
		var articleCount = articles.length;
		var maxPageCount = Math.floor(articleCount/5);

		//5 article previews per page.
		if (articleCount % 5 === 0) {
			maxPageCount = Math.floor(articleCount/5);
		} else {
			maxPageCount = Math.floor(articleCount/5) + 1
		}

		res.render('blog', {
			user : req.user,
			userIsLogged : (req.user ? true : false),
			articles: pageArticles,
			isArticles: isArticles,
			prevPage: currentPage-1,
			curPage: currentPage,
			nextPage: currentPage+1,
			maxPages: maxPageCount
		});
	})
}
