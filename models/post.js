const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var moment = require('moment');

const PostsSchema = new Schema(
    {
        author:{
            type: Object
        },
        text: {
            type: Array,
        },
        image:{
            type: String,
            trim: true,
        },
        blocked: {
            type: Boolean,
            default: false
        },
        createdDate: {
            type: String,
            // default: () => moment().tz("Europe/Athens").format("DD MMM YYYY h:mm a")
            default: () => moment().locale("el").format('DD MMM YYYY HH:mm')
        }
    }
);

let Posts = mongoose.model("Post", PostsSchema);

module.exports = Posts;