const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
    {
        email:{
            type: String,
            required: [
                true, "Please enter a valid email"
            ]
        },
        password:{
            type: String,
            required: [
                true, "Please enter a unique Password"
            ]
        },
        username:{
            type: String,
            required: [
                true, "Please enter a valid username"
            ]
        },
        socketid:{
            type: String,
            required: [
                true, "Please enter a valid socketid"
            ]
        },
        peerid:{
            type:String,
            required: [
                false,
            ]
        }
    },
    {
        timestamps: true
    }
)

const User = mongoose.model('User', userSchema);
module.exports = User;