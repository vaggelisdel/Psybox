const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LikesSchema = new Schema(
    {
        userid: {
            type: String
        },
        type: {
            type: String
        },
        postid: {
            type: Schema.Types.ObjectId,
            ref: "Posts"
        },

    }
);

let Likes = mongoose.model("Like", LikesSchema);

module.exports = Likes;