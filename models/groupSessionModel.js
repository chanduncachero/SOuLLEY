const mongoose = require("mongoose");

const groupSessionSchema = mongoose.Schema(
    {
        session_room:{
            type:String,
            required:[
                true, "Enter the session room"
            ]
        },
        number_of_user:{
            type:Number,
            required: [
                true
            ]
        },
        list_of_user:{
            type: [{}],
            required:[
                true, "List of User Data is required"
            ]
        }
        
    },
    {
        timestamps: true
    }
)

const GroupSession = mongoose.model('GroupSession', groupSessionSchema);
module.exports = GroupSession;