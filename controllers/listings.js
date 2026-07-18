const listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const axios = require("axios");

module.exports.index = async(req, res) =>{
    const allListings = await listing.find({});
    console.log(allListings.length);
    res.render("listings/index", {allListings});
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const foundListing = await listing.findById(id).populate({path: "reviews", populate: {path: "author",},}).populate("owner");
    if(!foundListing){
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    console.log(foundListing);
    console.log(foundListing.geometry);
console.log(foundListing.geometry?.coordinates);
    console.log(foundListing.owner);
   console.log(foundListing.image);
console.log(typeof foundListing.image);
    res.render("listings/show", {listing: foundListing });
};


module.exports.createListing = async (req, res, next) => {
  const geoResponse = await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1,
})
  .send();
 
  
let url = req.file.path;
let filename = req.file.filename;
    

    const newListing = new listing(req.body.listing);

    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    console.log(geoResponse.body.features);
    newListing.geometry = geoResponse.body.features[0].geometry;
    
    let savedListing = await newListing.save();
    console.log(savedListing)

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async(req, res) =>{
    let {id} = req.params;
    const foundListing = await listing.findById(id);
    if(!foundListing){
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }
    let originalImageUrl = foundListing.image.url;
   originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", {
    listing: foundListing,
    originalImageUrl,
});
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    let updatedListing = await listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { new: true }
    );

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;

        updatedListing.image = { url, filename };
        await updatedListing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) =>{
     let {id} = req.params;
     let deletedListing = await listing.findByIdAndDelete(id);
     console.log(deletedListing);
     req.flash("success", " Listing Deleted!");
     res.redirect("/listings");
};
