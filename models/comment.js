const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var moment = require('moment-timezone');

const CommentsSchema = new Schema(
    {
        author:{
            type: Object
        },
        postid: {
            type: Schema.Types.ObjectId,
            ref: "Posts",
            trim: true,
        },
        comment: {
            type: String,
        },
        createdDate: {
            type: String,
            default: () => moment().tz("Europe/Athens").locale("el").format("DD MMM YYYY HH:mm")
        }
    }
);

let Comments = mongoose.model("Comment", CommentsSchema);

module.exports = Comments;
