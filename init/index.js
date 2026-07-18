const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(()=>{
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });


//CREATING-- DATABASE
async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});

    let listings = [];

    for (let obj of initData.data) {
        console.log("Processing:", obj.location, obj.country);
        const geoResponse = await geocodingClient
    .forwardGeocode({
        query: `${obj.location}, ${obj.country}`,
        limit: 1,
    })
    .send();
    console.log(geoResponse.body.features);

obj.geometry = geoResponse.body.features[0].geometry;
        

        obj.owner = "6a3bd9943067c9a7f644b75f";
        listings.push(obj);
    }
    console.log("Total listings:", listings.length);
    await Listing.insertMany(listings);

    console.log("Data initialized successfully");
};

initDB();