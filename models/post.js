const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostsSchema = new Schema(
    {
        text: {
            type: String
        },

    }
);

let Posts = mongoose.model("Post", PostsSchema);

module.exports = Posts;