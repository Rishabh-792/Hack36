const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const MongoDBStore = require("connect-mongo");

const Record = require("./models/records");

mongoose.connect("mongodb://localhost:27017/hack", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/records", async (req, res) => {
    const records = await Record.find({});
    res.render("records/index", { records });
});

app.get("/records/new", (req, res) => {
    res.render("records/new");
});

app.post("/records", async (req, res) => {
    const record = new Record(req.body.record);
    await record.save();
    res.redirect(`/records/${record._id}`);
});

app.get("/records/:id", async (req, res) => {
    const record = await Record.findById(req.params.id);
    res.render("records/show", { record });
});

app.get("/records/:id/edit", async (req, res) => {
    const record = await Record.findById(req.params.id);
    res.render("records/edit", { record });
});

app.put("/records/:id", async (req, res) => {
    const { id } = req.params;
    const record = await Record.findByIdAndUpdate(id, {
        ...req.body.record,
    });
    res.redirect(`/records/${record._id}`);
});

app.delete("/records/:id", async (req, res) => {
    const { id } = req.params;
    await Record.findByIdAndDelete(id);
    res.redirect("/records");
});

app.listen(3000, () => {
    console.log("Serving on port 3000");
});
