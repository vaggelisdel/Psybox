const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LikesSchema = new Schema(
    {
        user: {
            type: Object,
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