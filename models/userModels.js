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
        }
    },
    {
        timestamps: true
    }
)

const User = mongoose.model('User', userSchema);
module.exports = User;