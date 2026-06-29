const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async(req, res) =>{
   let foundListing = await Listing.findById(req.params.id);
   let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview.author);
   foundListing.reviews.push(newReview);

   await newReview.save();
   await foundListing.save();

   console.log("new review saved");
//    res.send("new review saved");
req.flash("success", "New Review Created!");
   res.redirect(`/listings/${foundListing._id}`);
};

module.exports.destroyReview = async (req, res) =>{
    let {id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id,{$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", " Listing Deleted!");
    res.redirect(`/listings/${id}`);
};
