const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var moment = require('moment-timezone');

const LikesSchema = new Schema(
    {
        userID: {
            type: Schema.Types.ObjectId
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
        createdDate:{
            type: String,
            default: () => moment().tz("Europe/Athens").format("YYYY-MM-DD HH:mm:ss")
        }
    }
);

let Likes = mongoose.model("Like", LikesSchema);

module.exports = Likes;