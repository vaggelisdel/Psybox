const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var moment = require('moment-timezone');

const DeletedUserSchema = new Schema(
    {
        userData:{
            type: Object
        },
        deletedDate: {
            type: String,
            default: () => moment().tz("Europe/Athens").format("YYYY-MM-DD HH:mm:ss")
        }
    }
);

let DeletedUsers = mongoose.model("Deleted_User", DeletedUserSchema);

module.exports = DeletedUsers;