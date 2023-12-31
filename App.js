
const express = require("express");
const path = require("path");
const router = express.Router();
const bodyparser = require("body-parser");
const twilio = require("twilio");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const session = require("express-session");
// const Routes = require('./routes/routes.js');
// const {v4: uuidV4} = require("uuid");
const crypto = require("crypto");

dotenv.config();
const mongoose = require("mongoose");
const User = require("./models/userModels");
const Message = require("./models/messageModels");
const GroupSession = require("./models/groupSessionModel");
const { exit } = require("process");
const { error } = require("console");
// const Chat = require("twilio/lib/rest/Chat");

const PORT = process.env.PORT || 1101; 
const app = express();

const http = require("http");
const server = http.createServer(app);
// const server = http.createServer(app, (req, res)=>{
//     // const headers = {};
//     // headers["Access-Control-Allow-Origin"] = "*";
//     // headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
//     // headers["Access-Control-Allow-Credentials"] = true;

//     header("Access-Control-Allow-Origin" , "*");
//     header("Access-Control-Allow-Methods", POST, GET, PUT, DELETE, OPTIONS);
//     header("Access-Control-Allow-Credentials", true);

//     // res.writeHead(200, headers);
//     // res.end();
// });
const io = require('socket.io')(server, {
    cors: {
        // origin: "http://164.92.95.149",
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: [
            "Access-Control-Allow-Origin", 
            "Access-Control-Allow-Methods",
            'Access-Control-Allow-Credentials'
        ],        
        credentials: true,
        allowRequest: (req, callback) => {
            const noOriginHeader = req.headers.origin === undefined;
            callback(null, noOriginHeader);
        }
    }
});

//XMLHttpRequest
// const xhr = new XMLHttpRequest();
// const urlx = "https://bar.other/resources/public-data/";
// xhr.open("GET", urlx);
// xhr.onreadystatechange = someHandler;
// xhr.send();

//CORS SOLUTION
const cors = require('cors');
// const corsOptions ={
//     origin:'http://localhost:3000', 
//     credentials:true,            //access-control-allow-credentials:true
//     optionSuccessStatus:200
// };

// const { createServer } = require("http");
// const server = createServer(app);
// const io = new Server(server, {
//     cors:{
//         origin: 'http://164.92.95.149',
//         // origin: 'vince.ph05.us',
//         credentials:true,
//     }
// });

// const io = require('socket.io')(server, {
//     cors:{
//         origin: ["http://164.92.95.149"],
//         // allowedHeaders: [
//         //     "Access-Control-Allow-Origin",
//         //     "Access-Control-Allow-Methods",
//         //     'Access-Control-Allow-Credentials'
//         // ],        
//         // credentials:true,
//         // methods: ["GET", "POST"],

//         // allowRequest: (req, callback) => {
//         //     const noOriginHeader = req.headers.origin === undefined;
//         //     callback(null, noOriginHeader);
//         // }
//     },
//     // allowEIO3: true,
// });

// const ios = require('socket.io');
// const io = new ios.Server({
//     allowEIO3: true,
//     cors:{
//         origin: true,
//         credentials: true
//     }
// });

// const { createServer } = require("http");
// const httpServer = createServer();
// const io = new Server(server);
// const io = require("socket.io")(server, {
//     cors: {
//         origin: '*'
//     //   origin: "http://localhost:3000/",
//     //   methods: ["GET", "POST"]
//     }
// });

// const io = require('socket.io')(server, {origins:'164.92.95.149:* http://164.92.95.149:* http://www.164.92.95.149:*'});

// io('http://localhost', {transports: ['websocket', 'polling', 'flashsocket']});


//Express-session, 
const sessionMiddleware = session({
    secret: 'changeit',
	resave: false,
	saveUninitialized: false,
    // cookie: {
    //     expires: 100000
    // }
});
const wrap = middleware => (socket, next) =>
    middleware(socket.request, {}, next);
app.use(sessionMiddleware);

io.engine.use(sessionMiddleware);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));   
app.use(express.static(__dirname+"/public"));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));

const url = "mongodb+srv://chanduncachero:test123@"+"soulleycluster0.8baydo3.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(url)
    .then(result => console.log(result))
    .catch("error");
let userEmail = [];
let connectedUser = [];
io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

    // socket.request.session.socketio = socket.id;
    // socket.request.session.save();
    // connectedUser.push(socket.id);
io.use(wrap(sessionMiddleware));
//IO HERE
io.on("connection", (socket) => {
    
    socket.emit("message",socket.id);

    socket.on("close_callee_videoBelow", async (calleeInfo4Socket, callerId) => {
        let userTo = await User.find({});
        let userTo2 = userTo.find(user => user.username === calleeInfo4Socket);

        io.to(userTo2.socketid).emit("close_callee_videoBelow2", callerId);
    });

    socket.on("close_caller_videoBelow", callerId =>{
        io.to(callerId).emit("close_caller_videoBelow");
    });

//Receive Video Call join room

    socket.on("video_call_invite", async (toUserData, username, roomId, callerId) => {
        let userTo = await User.find({});
        let userTo2 = userTo.find(user => user.username === toUserData);
        let socket = userTo2.socketid

        io.to(socket).emit("vcall_invite_interface", username, roomId, callerId);
    });
//Receive video call join room
    socket.on("join-room", (roomId, id, callerId) => {
        // console.log("join room connecting...");

        io.to(callerId).emit("user-connected", id);
    });
    socket.on("disconnect", () => {
        io.emit("notice", "a user has left");
    });
//Receiver video call cancel call to caller
    socket.on("answer_cancel_videocall", callerId => {
        io.to(callerId).emit("callee_video_cancel", "call cancel");
    });
//Video Call Receiver is busy
    socket.on("callee_is_busy", callerId =>{
        io.to(callerId).emit("callee_is_busy", "call denied");
    });
//Group ChatBox
    socket.on("chatbox-sender", async(room, senderName, message, peer) =>{
        let x = await User.find({});

        let y = await x.find(user => user.peerid === peer);
        console.log(y, "y console");
        // y.list_of_user.forEach(async element => {
        io.to(y.socketid).emit("chatbox-to-group", message, senderName);
        // });
    });

//Receive chat
    socket.on("chatMessage", async body => {
        io.to(body.user_ID).emit("chatMessageResponseUser", body);

        let userTo = await User.find({});
        let userFrom = await userTo.find(user => user.socketid === body.user_ID);
        let userTo2 = await userTo.find(user => user.username === body.send_to);

        console.log(userTo2, "to user with session");
        io.to(userTo2.socketid).emit("chatMessageResponseOther", body, userFrom.username);
    });

//Receive Cancel Group Call from Caller
    socket.on("groupCallerDialog", async (callee) => {
        let a = await User.find({});
        let b = await a.find(user => user.username === callee);
        socket.to(b.socketid).emit("cancel-group-call");
    });

//Group Room Video Call Join room UUID and PEER ID
    socket.on("group-call-join-room-caller", (roomId, peerId)=>{
            socket.join(roomId);
            socket.broadcast.to(roomId).emit("user-connected-group-call", peerId);
    
            socket.on("disconnect", ()=>{
                socket.broadcast.to(roomId).emit("user-disconnected", peerId);
                // io.broadcast.emit("user-disconnected", peerId);
            });
    });
    socket.on("group-call-join-room", async(roomId,peerId,socketId)=>{
        let x = await GroupSession.find({});
        let y = await x.find(session => session.session_room === roomId);

        // if(y.list_of_user[0]===peerId){
        //     socket.join(roomId);
        //     socket.broadcast.to(roomId).emit("user-connected-group-call", peerId);
    
        //     socket.on("disconnect", ()=>{
        //         socket.broadcast.to(roomId).emit("user-disconnected", peerId);
        //         // io.broadcast.emit("user-disconnected", peerId);
        //     });
        // }else{
            let room = y._id;
            let groupsession = await GroupSession.findByIdAndUpdate(room,{$inc:{number_of_user:1}},{new: true});
            let groupsession2 = await GroupSession.findByIdAndUpdate(room,{$push:{list_of_user:peerId}},{safe: true, upsert: true},{new: true});

            // console.log(groupsession,groupsession2, "group number of user groupsession");

            if(y.number_of_user === 1){
                io.to(socketId).emit("group-call-first-callee", peerId);

                socket.join(roomId);

                socket.broadcast.to(roomId).emit("user-connected-group-call", peerId);
        
                socket.on("disconnect", ()=>{
                    socket.broadcast.to(roomId).emit("user-disconnected", peerId);
                });
            }else{
                socket.join(roomId);
                io.to(socketId).emit("current-connected-group-peer-twoandmore", y);

                socket.broadcast.to(roomId).emit("current-connected-group-peer", peerId);
        
                socket.on("disconnect", ()=>{
                    socket.broadcast.to(roomId).emit("user-disconnected", peerId);
                });
            }
        // }
        
    });

// Group Disconnect User
    socket.on("group-user-disconnect" , (roomId, peer) =>{
        socket.broadcast.emit("user-disconnected", peer);
    });

//Receive Group Video Call Invite
    socket.on("group_video_call", async (x_array, roomid, callername, callerId, callerPeer) => {
        let a = await User.find({});
        let b = await a.find(user => user.username === x_array);
        io.to(b.socketid).emit("group_video_call_accept", roomid,callername,callerId ,callerPeer );
    });

//Group Video Call Broadcast and delete 
    socket.on("group-video-call-quit", (peerId , room )=>{
        // io.broadcast("user-disconnected", peerId);
        socket.broadcast.to(room).emit("caller-disconnected", peerId);
    });

//Group Video Call to 2nd user
    socket.on("groupcall_three_and_more", async(peerCaller, peerReceiver)=>{
        let x = await User.find({});
        let y = await x.find(user=> user.peerid === peerCaller);

        socket.to(y.socketid).emit("to_groupcall_three_and_more", peerReceiver);
    })

//Group Video Call 3 and more user
    socket.on("groupcall_more_than_three", async(peerCaller, peerReceiver)=>{
        let x = await User.find({});
        let y = await x.find(user=> user.peerid === peerCaller);

        socket.to(y.socketid).emit("to_third_user_in_group", peerReceiver);
    })
});

//PrependListener
// server.prependListener("request", (req, res) => {
//     res.setHeader("Access-Control-Allow-Origin", "http://164.92.95.149");
// });


function requireLogin(req, res, next) {
    if (req.session.loggedIn) {
        next(); // allow the next route to run
        // console.log("require login passed");
    } else {
      // require the user to log in
      console.log("Auth not found");
      res.redirect("/login"); // or render a form, etc.
    }
  }

router.get("/dashboard", requireLogin, async (req, res) => {
    res.sendFile(path.join(__dirname+'/public/dashboard.html'));
});
// router.get("/", (req, res) =>{
//     res.redirect("/login");
// });
router.get("/login", (req, res) =>{
    res.sendFile(path.join(__dirname+'/public/login.html'));
});
router.get("/register", (req, res) =>{
    res.sendFile(path.join(__dirname+'/public/register.html'));
});
router.get("/error404", (req, res) =>{
    res.sendFile(path.join(__dirname+'/public/error.html'));
});
router.get("/*", (req, res)=> {
    // res.send("Page unavailable in soulley")
    res.sendFile(path.join(__dirname + '/public/login.html'));
    // res.redirect("/login");
});

// Routes API below

// Video Call API Route
app.get("/video", (req, res)=>{
    try{
        let roomId = crypto.randomUUID();

        return res.status(200).json({roomId});
        
    }catch(error){
        res.status(500).json({message: error.message});
    }
   
});

//Update Socketio API
app.put("/update/socket/:id", async(req,res)=>{
    // console.log(req.body, "/update/socket/:id data")
    try{
        const {id} = req.params;
        const user = await User.findByIdAndUpdate(id, req.body);
        if(!user){
            return res.status(404).json({message: `cannot find any product with ID ${id}`})
        }
        const updatedUser = await User.findById(id);
        res.status(200).json(updatedUser);

    }catch(error){
        res.status(500).json({message: error.message});
    }
});

//Update Peer ID
app.put("/updatePeer/:id", async(req,res)=>{
    try{
        const {id} = req.params;
        const user = await User.findByIdAndUpdate(id, req.body);
        if(!user){
            return res.status(404).json({message: `cannot find any product with ID ${id}`})
        }
        const updatedUser = await User.findById(id);
        res.status(200).json(updatedUser);
    }catch(error){
        res.status(500).json({message: error.message});
    }
});

//Create Group Session
app.post("/create/group-session", async(req, res) => {
    try{
        let newGroupCall = new GroupSession({
            session_room: req.body.room,
            number_of_user: 1,
            list_of_user: req.body.peerId
        });
        await GroupSession.create(newGroupCall);
        res.status(200).json(newGroupCall);
    }catch(error){
        console.log(error, "group session error");
        res.status(500).json({message: error.message});
    };
});

//Login API
app.post('/user/login', async (req, res)=>{
    const user_all = await User.find({});
    const user = await user_all.find(user => user.email === req.body.email);
    if(user === null ){
        res.status(400).send('cannot find user');
    }
    try{
        if(req.body.password === user.password){
            req.session.authenticated = true;
            req.session.loggedIn = true;
            req.session.email = user.email;
            req.session._id = user._id;
            userEmail.push(user.email);
            console.log( userEmail,"success login");
            // res.sendFile(path.join(__dirname+'/public/dashboard.html'));
            res.redirect("/dashboard"); 
        }
        else{
            res.send("Incorrect Password");
        }
        res.end();
    } catch(error){
        res.status(500).send("Incorrect Email, Incorrect Password");
        // console.log("No Credentials has matched");
        res.end();
    }
});

//Logout API
app.post("/logout", (req,res) => {
    if(req.session.loggedIn){
        req.session.destroy();
        console.log("logout success")
    }else{
        res.status(400).send("Unable to log out!")
    }
});

//Get all user, except main user
app.get("/user", async(req, res)=>{
    try{
        const user = await User.find({});
        let user_1 = await user.filter(user => user.id != req.session._id)
        res.status(200).json(user_1);
    } catch (error){
        console.log (error, "/user error")
    }
});

//Register User
app.post('/save/user', async (req, res) => {
    try{
        // let user = [];
        // req.body.socketid = connectedUser[0];
        // user.push(req.body);
        // await User.create(user);

        // console.log( req.body.email,
        //     req.body.password,
        //     req.body.username, "user register data");

        const newUser = new User({
            email: req.body.email,
            password: req.body.password,
            username: req.body.username,
            socketid: "new_user",
            contact_number: req.body.contact_number
        });
        await User.create(newUser);

        res.sendFile(path.join(__dirname+'/public/login.html'));
    }catch (error){
        console.log(error, "register error");   
        res.redirect("/register");
        // res.status(500).json({message: error.message});
    };
    exit;
});

//Update
// app.put('/user/:id', async(req, res)=>{
//     try{
//         const {id} = req.params;
//         const user = await User.findByIdAndUpdate(id, req.body);
//         if(!user){
//             return res.status(404).json({message: `cannot find any product with ID ${id}`})
//         }
//         const updatedUser = await User.findById(id);
//         res.status(200).json(updatedUser);
//     } catch (error){
//         res.status(500).json({message: error.message})
//     }
// });

//delete
app.delete('/userDelete/:id', async (req, res)=>{
    try{
        const {id} = req.params;
        const user = await User.findByIdAndDelete(id);
        if(!user){
            return res.status(404).json({message: `cannot find any product with ID ${id}`})
        }
        res.status(200).json(user);

    } catch(error){
        res.status(500).json({message: error.message})
    }
});

//Call and Text SMS
app.post('/call', requireLogin, (req, res)=>{
        // const client  = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        const client  = new twilio(TWILIO_SID = req.body.auth_sid, TWILIO_AUTH_TOKEN = req.body.auth_token);
    // try{
        client.calls
        .create({url:"http://demo.twilio.com/docs/voice.xml", from:+13609001106, to: "+" + req.body.number})
        .then(message=> {
            console.log(message, "sent success")
            res.status(200).json({message})
        }).catch(err=> {
            console.log(err, "text not sent" );
            res.status(500).json({message: err.message});
        });
});
app.post("/sms",requireLogin, (req, res)=>{

        // const client  = new twilio(process.env.TWILIO_SID, TWILIO_AUTH_TOKEN = req.body.auth_token);
        const client  = new twilio(TWILIO_SID = req.body.auth_sid, TWILIO_AUTH_TOKEN = req.body.auth_token);

        // const client  = new twilio(TWILIO_SID = ACb5745873e9c982ef6eefe86dd3c21665, TWILIO_AUTH_TOKEN = req.body.auth_token);

        // TWILIO_SID = ACb5745873e9c982ef6eefe86dd3c21665
        // const client  = new twilio(TWILIO_SID = ACb5745873e9c982ef6eefe86dd3c21665, TWILIO_AUTH_TOKEN = e31c0e6c55718240c11d73ee6c5768dc);
    
            client.messages
            .create({body: req.body.text, from:+13609001106, to: "+" + req.body.number})
            .then(mess=> {
                res.status(200).json({mess});
                console.log(mess, "sent success");
            }).catch(err=> {
                res.status(500).json({message: err.message});
                console.log(err, "sent not success");
            });
});

//Get User Only
app.get("/user/data", async (req, res)=>{
    if(req.session.loggedIn){
        let firstA = await User.find({});
        let secondA = await firstA.filter(user => user.id === req.session._id);
        res.status(200).json(secondA);
    }else{
        console.log("no user yet");
    }
});

//Message Routes
app.post("/save/message", async(req, res)=>{
            let user_email = await User.find({});
            let toUserId = await user_email.find(user => user.username === req.body.send_to);
    try{
            const params = {message: req.body.message, user_id: [req.body.user_ID, toUserId.id] };
            const message = await Message.create(params);
            res.status(200).json(message);
    }catch (error){
        res.status(500).json({message: error.message})
    };
});
app.get("/message", async(req, res)=>{
    console.log(req.session._id,"id")
    try{
        if(req.session.loggedIn){
            const userID = req.session._id;
            const message = await Message.find({});
            res.status(200).json({message,userID});
        }
    }catch(err){
        res.status(500).json({message: err.message})
    }
});
app.post("/search/chat", async (req,res) => {
        let user_all = await User.find({});
        let user = await user_all.find(user => user.username === req.body.username);
    try{
        if(user!=[]){
            let message_2 = await Message.find({
                "user_id" : {
                    // $elemMatch: {$regex: user.id, $options:"i"}
                    $all: [user.id , req.body.senderId]
                }
            });

                res.status(200).json({message_2});
           
        }else{
            document.location.reload();
        }
    }catch(err){
        res.status(500).json({message: err.message});
    }
    // console.log(hey)
    // res.status(200).json({req})
});

//Group Chat Box
app.post("/chatbox", async(req, res) =>{
    try{
        const params = {message: req.body.message, user_id: req.body.user_ID, group_id: req.body.room };
        await Message.create(params);
        const group = await GroupSession.find({});
        const group_list = await group.find(session=> session.session_room ===req.body.room);
        res.status(200).json(group_list);
    }catch (error){
        res.status(500).json({message: error.message});
    };
});
app.post("/getChatbox", async(req, res) => {
    try{
        let g = await Message.find({});
        let r = await g.filter(message=> message.group_id ===req.body.room);
        // console.log(r, "r datas");
        if(r.length===undefined){
            return false;
        }else{
            res.status(200).json(r);
        }
    }catch(er){
        res.status(500).json({message: er.message});
    }
});

//Save Number
app.post("/save/number", async (req, res) =>{
    try{
        let x = await User.find({});
        let y = await x.find(user=> user.id===req.body.id);
        console.log(y,"y");
        let z = await User.findByIdAndUpdate(y._id, {contact_number:req.body.number});
        res.status(200).json(z);
    }catch(er){
        res.status(500).json({message: er.message});
    }
})

app.use('/', router);
// app.use(cors({
//     origin: "http://164.92.95.149"
// }));
server.on('listening',function(){
    console.log('ok, server is running');
});
server.listen(PORT);






