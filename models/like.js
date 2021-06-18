const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LikesSchema = new Schema(
    {
        userID: {
            type: String,
            trim: true,
        },
        type: {
            type: String,
            trim: true,
        },
        postid: {
            type: Schema.Types.ObjectId,
            ref: "Posts",
            trim: true,
        },

    }
);

let Likes = mongoose.model("Like", LikesSchema);

module.exports = Likes;