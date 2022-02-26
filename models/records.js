const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recordsSchema = new Schema({
    name: String,
    disease: String,
    symptoms: String,
    treatment: String,
    description: String,
});

module.exports = mongoose.model("Records", recordsSchema);
