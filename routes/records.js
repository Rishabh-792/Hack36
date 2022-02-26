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
        try {
            const record = new Record(req.body.record);
            await record.save();
            res.redirect(`/records/${record._id}`);
        } catch (e) {
            next(e);
        }
    })
);

router.get(
    "/:id",
    catchAsync(async (req, res) => {
        const record = await Record.findById(req.params.id).populate("forum");
        res.render("records/show", { record });
    })
);

router.get(
    "/:id/edit",
    catchAsync(async (req, res) => {
        const record = await Record.findById(req.params.id);
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
        res.redirect(`/records/${record._id}`);
    })
);

router.delete(
    "/:id",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        await Record.findByIdAndDelete(id);
        res.redirect("/records");
    })
);

module.exports = router;
