const express = require("express");
const router = express.Router();
const Record = require("../models/records");
const catchAsync = require("../utils/catchAsync");

const { isLoggedIn, isAuthor, validateRecord } = require("../middleware");

router.get(
    "/",
    catchAsync(async (req, res) => {
        const records = await Record.find({});
        res.render("records/index", { records });
    })
);

router.get("/new", isLoggedIn, (req, res) => {
    res.render("records/new");
});

router.post(
    "/",
    isLoggedIn,
    validateRecord,
    catchAsync(async (req, res) => {
        const record = new Record(req.body.record);
        record.author = req.user;
        await record.save();
        req.flash("success", "Successfully made a new record!");
        res.redirect(`/records/${record._id}`);
    })
);

router.get(
    "/:id",
    catchAsync(async (req, res) => {
        const record = await Record.findById(req.params.id)
            .populate({
                path: "forum",
                populate: {
                    path: "author",
                },
            })
            .populate("author");
        if (!record) {
            req.flash("error", "Cannot find that record!");
            return res.redirect("/records");
        }
        res.render("records/show", { record });
    })
);

router.get(
    "/:id/edit",
    isLoggedIn,
    isAuthor,
    catchAsync(async (req, res) => {
        const record = await Record.findById(req.params.id);
        if (!record) {
            req.flash("error", "Cannot find that record!");
            return res.redirect("/records");
        }
        res.render("records/edit", { record });
    })
);

router.put(
    "/:id",
    isLoggedIn,
    isAuthor,
    validateRecord,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const record = await Record.findByIdAndUpdate(id, {
            ...req.body.record,
        });
        req.flash("success", "Successfully updated record!");
        res.redirect(`/records/${record._id}`);
    })
);

router.delete(
    "/:id",
    isLoggedIn,
    isAuthor,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        await Record.findByIdAndDelete(id);
        req.flash("success", "Successfully deleted record!");
        res.redirect("/records");
    })
);

module.exports = router;
