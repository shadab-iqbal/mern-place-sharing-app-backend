const { Schema, model, Types } = require("mongoose");

const placeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  address: { type: String, required: true },
  creator: { type: Types.ObjectId, ref: "User", required: true },
});

const Place = model("Place", placeSchema);

module.exports = Place;
