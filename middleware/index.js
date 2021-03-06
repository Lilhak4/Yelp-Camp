const Campground = require('../models/campground');
const Comment = require('../models/comment');
const Review = require('../models/review');
const middlewareObj = {};

middlewareObj.checkCampgroundOwnership = (req, res, next) => {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, (err, foundCampground) => {
      if (err) {
        console.log(err);
        req.flash('error', 'Campground not found');
        res.redirect('/campgrounds');
      } else {
        // does user own campground?
        // method of mongoose that returns useable id 
        if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
          next();
        } else {
          req.flash('error', 'You do not have permission to do that');
          res.redirect('back');
        }
      }
    });
  } else {
    req.flash('error', 'You need to be logged in');
    res.redirect('back');
  }
}

middlewareObj.checkCommentOwnership = (req, res, next) => {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      if (err) {
        console.log(err)
        res.redirect('/campgrounds')
      } else {
        // does user own comment?
        // method of mongoose that returns useable id 
        if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
          next();
        } else {
          req.flash('error', 'You do not have permission to do that');
          res.redirect('back');
        }
      }
    });
  } else {
    req.flash('error', 'You need to be logged in');
    res.redirect('back');
  }
}

middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'You need to be logged in to do that');
  res.redirect("/login");
}

middlewareObj.checkReviewOwnership = (req, res, next) => {
  if (req.isAuthenticated()) {
    Review.findById(req.params.review_id, (err, foundReview) => {
      if (err || !foundReview) {
        res.redirect("back");
      } else {
        // does user own the comment?
        if (foundReview.author.id.equals(req.user._id) || req.user.isAdmin) {
          next();
        } else {
          req.flash("error", "You don't have permission to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
};

middlewareObj.checkReviewExistence = (req, res, next) => {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id).populate("reviews").exec((err, foundCampground) => {
      if (err || !foundCampground) {
        req.flash("error", "Campground not found.");
        res.redirect("back");
      } else {
        // check if req.user._id exists in foundCampground.reviews
        const foundUserReview = foundCampground.reviews.some((review) => {
          return review.author.id.equals(req.user._id);
        });
        if (foundUserReview) {
          req.flash("error", "You already wrote a review.");
          return res.redirect("/campgrounds/" + foundCampground._id);
        }
        // if the review was not found, go to the next middleware
        next();
      }
    });
  } else {
    req.flash("error", "You need to login first.");
    res.redirect("back");
  }
};

module.exports = middlewareObj