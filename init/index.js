const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const axios = require("axios");

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

        const response = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params: {
                    q: `${obj.location}, ${obj.country}`,
                    format: "json",
                    limit: 1,
                },
                headers: {
                    "User-Agent": "wanderlust-app",
                },
            }
        );

        if (response.data.length > 0) {
            obj.geometry = {
                type: "Point",
                coordinates: [
                    parseFloat(response.data[0].lon),
                    parseFloat(response.data[0].lat),
                ],
            };
        }

        obj.owner = "6a3bd9943067c9a7f644b75f";
        listings.push(obj);
    }

    await Listing.insertMany(listings);

    console.log("Data initialized successfully");
};

initDB();