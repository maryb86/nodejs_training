const mongoose = require("mongoose");
const Joi = require("Joi");

const genreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    }
});

const Genre = mongoose.model("Genre", genreSchema);

function validateGenre(name) {
    const schema = {
        name: Joi.string().min(5).max(50).required()
    }
    return Joi.validate(name, schema);
}

exports.Genre = Genre;
exports.validate = validateGenre;
exports.genreSchema = genreSchema;
