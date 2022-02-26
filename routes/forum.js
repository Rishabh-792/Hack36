const express = require("express");
const router = express.Router({ mergeParams: true });

const Record = require("../models/records");
const Forum = require("../models/forum");

const { forumSchema } = require("../schemas.js");

const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");

const validateForum = (req, res, next) => {
    const { error } = forumSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

router.post(
    "/",
    validateForum,
    catchAsync(async (req, res) => {
        const record = await Record.findById(req.params.id);
        const forum = new Forum(req.body.forum);
        record.forum.push(forum);
        await forum.save();
        await record.save();
        res.redirect(`/records/${record._id}`);
    })
);

router.delete(
    "/:forumId",
    catchAsync(async (req, res) => {
        const { id, forumId } = req.params;
        await Record.findByIdAndUpdate(id, {
            $pull: { forum: forumId },
        });
        await Forum.findByIdAndDelete(forumId);
        res.redirect(`/records/${id}`);
    })
);

module.exports = router;
