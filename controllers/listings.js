const listing = require("../models/listing");
const axios = require("axios");

module.exports.index = async(req, res) =>{
    const allListings = await listing.find({})
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
        res.redirect("/listings");
    }
    console.log(foundListing);
    console.log(foundListing.owner);
   console.log(foundListing.image);
console.log(typeof foundListing.image);
    res.render("listings/show", {listing: foundListing });
};

module.exports.createListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new listing(req.body.listing);

    const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
            params: {
                q: req.body.listing.location,
                format: "json",
                limit: 1,
            },
            headers: {
                "User-Agent": "wanderlust-app",
            },
        }
    );

    if (response.data.length > 0) {
        newListing.geometry = {
            type: "Point",
            coordinates: [
                parseFloat(response.data[0].lon),
                parseFloat(response.data[0].lat),
            ],
        };
    }

    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    await newListing.save();

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
    originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", {listing: originalImageUrl});
};

module.exports.updateListing = async(req, res) => {
    let { id } = req.params;
    let updatedListing = await listing.findByIdAndUpdate(
    id,
    { ...req.body.listing }
);
updatedListing.image = { url, filename };
await updatedListing.save();

    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    } 
    req.flash("success", " Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) =>{
     let {id} = req.params;
     let deletedListing = await listing.findByIdAndDelete(id);
     console.log(deletedListing);
     req.flash("success", " Listing Deleted!");
     res.redirect("/listings");
};
