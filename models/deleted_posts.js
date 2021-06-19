const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var moment = require('moment-timezone');

const DeletedPostsSchema = new Schema(
    {
        postData:{
            type: Object
        },
        deletedDate: {
            type: String,
            default: () => moment().tz("Europe/Athens").format("YYYY-MM-DD HH:mm:ss")
        }
    }
);

let DeletedPosts = mongoose.model("Deleted_Post", DeletedPostsSchema);

module.exports = DeletedPosts;