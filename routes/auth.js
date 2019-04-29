const express = require("express");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const {User} = require("../models/user");
const _ = require("lodash");
const router = express.Router();

router.post("/", async (req, res) => {
    const {error} = validate(req.body);
    if (error) res.status(400).send(error.details[0].message);

    let user = await User.findOne({email: req.body.email});
    if (!user) res.status(400).send("Invalid email or password");

    const invalidPassword = await bcrypt.compare(req.body.password, user.password);
    if (!invalidPassword) res.status(400).send("Invalid email or password");

    user.generateAuthToken();

    res.send(token);
})

function validate(req) {
    const schema = {
        email: Joi.string().min(3).max(255).email().required(),
        password: Joi.string().min(6).max(255).required()
    }
    return Joi.validate(req, schema);
}

module.exports = router;