const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
    {
        message:{
            type: String,
            required: [
                true, "Please enter a chat"
            ]
        },
        user_id:{
            type: [{}],
            required: [
                true, "User ID not found"
            ]
        }
    },
    {
        timestamps: true
    }
)

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;