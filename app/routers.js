// app/routers.js

exports.userLogin = function(req, res){
    console.log(req.flash('loginMessage'));
    var successMessage = false;
    if(!(req.flash('loginMessage').size > 0)) {
      successMessage = true;
    }
    res.render('login', {
      message: req.flash('loginMessage'),
      success: successMessage
    });
};

exports.userLogout = function(req, res){
  req.logout();
  res.redirect('/');
};

exports.userProfile = function(req, res){
  res.render('profile', {
      user : req.user
  });
};


exports.userSignup = function(req, res){
  res.render('signup', {
    message: req.flash('signupMessage')
  });
};
