const express = require("express");
const router = express.Router();
const Record = require("../models/records");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

const { recordsSchema } = require("../schemas.js");

const validateRecord = (req, res, next) => {
    const { error } = recordsSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

router.get(
    "/",
    catchAsync(async (req, res) => {
        const records = await Record.find({});
        res.render("records/index", { records });
    })
);

router.get("/new", (req, res) => {
    res.render("records/new");
});

router.post(
    "/",
    validateRecord,
    catchAsync(async (req, res) => {
        const record = new Record(req.body.record);
        await record.save();
        req.flash("success", "Successfully made a new record!");
        res.redirect(`/records/${record._id}`);
    })
);

router.get(
    "/:id",
    catchAsync(async (req, res) => {
        const record = await Record.findById(req.params.id).populate("forum");
        if (!record) {
            req.flash("error", "Cannot find that record!");
            return res.redirect("/records");
        }
        res.render("records/show", { record });
    })
);

router.get(
    "/:id/edit",
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
    catchAsync(async (req, res) => {
        const { id } = req.params;
        await Record.findByIdAndDelete(id);
        req.flash("success", "Successfully deleted record!");
        res.redirect("/records");
    })
);

module.exports = router;
