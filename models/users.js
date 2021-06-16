const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var moment = require('moment-timezone');

const userSchema = new Schema(
    {
        socialID:{
            type: String,
            trim: true,
        },
        hash:{
            type: String,
            trim: true,
        },
        fullName: {
            type: String,
            trim: true,
            required: true,
        },
        firstName: {
            type: String,
            trim: true,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            required: true,
            lowercase: true
        },
        username: {
            type: String,
            trim: true,
            required: true,
        },
        password: {
            type: String,
            trim: true,
        },
        aboutYou: {
            type: String,
            trim: true,
        },
        avatar: {
            type: String,
            trim: true,
            default: "https://cdn.pixabay.com/photo/2017/11/10/05/48/user-2935527_1280.png"
        },
        website: {
            type: String,
            trim: true,
            lowercase: true
        },
        facebook: {
            type: String,
            trim: true,
            lowercase: true
        },
        twitter: {
            type: String,
            trim: true,
            lowercase: true
        },
        instagram: {
            type: String,
            trim: true,
            lowercase: true
        },
        youtube: {
            type: String,
            trim: true,
            lowercase: true
        },
        hasMembership: {
            type: Boolean,
            default: false
        },
        gender:{
            type: String,
            trim: true
        },
        method:{
            type: String,
            trim: true
        },
        locale:{
            type: String,
            trim: true
        },
        active: {
            type: Boolean,
            default: false
        },
        registerDate: {
            type: String,
            default: () => moment().tz("Europe/Athens").format("YYYY-MM-DD HH:mm:ss")
        }
    }
);

let Users = mongoose.model("User", userSchema);

module.exports = Users;