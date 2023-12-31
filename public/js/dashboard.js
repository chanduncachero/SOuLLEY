
const   numberInput = document.getElementById("number"),
        textInput = document.getElementById("msg"),
        button = document.getElementById("button"),
        response = document.querySelector(".response"),
        callNumber = document.getElementById("call_number"),
        callButton = document.getElementById("call_id"),
        TWILIO_SID = "ACb5745873e9c982ef6eefe86dd3c21665",
        // TWILIO_SID = "AC94a75cf40dc539cbd9b599b3ae9048ec",
//Send Chat
        touserData = [],

//socket id
        connectedUser = [],

//vcall interface
        callInput = document.getElementById("callInput"),
        videoBody = document.getElementById("video_body"),
        videoBelow = document.getElementById("video_below"),
        iceConfiguration = {
            iceServers: [
                {
                    urls: "stun:stun.relay.metered.ca:80",
                },
                {
                    urls: "turn:a.relay.metered.ca:80",
                    username: "4cc69cba81278a9bd51da56b",
                    credential: "41t3146m1OrqCb9X",
                },
                {
                    urls: "turn:a.relay.metered.ca:80?transport=tcp",
                    username: "4cc69cba81278a9bd51da56b",
                    credential: "41t3146m1OrqCb9X",
                },
                {
                    urls: "turn:a.relay.metered.ca:443",
                    username: "4cc69cba81278a9bd51da56b",
                    credential: "41t3146m1OrqCb9X",
                },
                {
                    urls: "turn:a.relay.metered.ca:443?transport=tcp",
                    username: "4cc69cba81278a9bd51da56b",
                    credential: "41t3146m1OrqCb9X",
                },
            ]
        },
        peerConfiguration = {},
        responseRTC = await fetch("https://soulley.metered.live/api/v1/turn/credentials?apiKey=952f829b9568c7f2a9dc8e7ab73c7aed21bc"),
        iceServers = await responseRTC.json(),
        // myPeer = new Peer(),
        myPeer = new Peer(iceConfiguration),
        // myPeer = new Peer(),


        receiverVideoStream = [],
        acceptVcall = document.getElementById("accept_vcall"),
        peersGroup = [],
        peers = {},
        myVideo = document.createElement("video"),
        callSomeone = document.getElementById("call_someone"),
        room_id1 = [],
        room_id2 = [],
        peerId = [],
        callerStream = [],
        calleeStream = [],
        callerStreamOne = callerStream[0],
        calleeStreamOne = calleeStream[0],
        callerId = [],
        videoTrackCallee = [],
        calleeUserId = [],
        calleeInfo4Socket = [],
        videoCallStatus = [],
        listPeerID=[],

        searchChat = document.getElementById("search_chat"),
        inputTest = document.getElementById("input_test"),
        // socket = io('http://164.92.95.149', { transports : ['websocket'] }),
        socket = io(),
        userID = [],
        userData = [],
        myInput = document.getElementById('myInput'),
        userName = document.getElementById("username"),
        
//group video call
        groupCallInvited = document.getElementById("groupCallInvited"),
        usersArray = [],
        groupCallerSocketId = [],
        groupRoomId = [],
        x_array = [],
        groupVideoCallStatus = [false],
        callerPeers = [],
        myVideoGrid = document.getElementById("group-video-grid"),
        channelList = document.getElementById('channel_list');

        myVideo.muted = true;
        // (async() => {
        //     const response = await fetch("https://soulley.metered.live/api/v1/turn/credentials?apiKey=952f829b9568c7f2a9dc8e7ab73c7aed21bc");
        //     const iceServers = await response.json();
        //     peerConfiguration.iceServers = iceServers
        //   })();

//Video call interface callee dialog confirmation 
socket.on("vcall_invite_interface", (username, roomid, callerId1)=>{
    if(videoCallStatus[0]===true){
        socket.emit("callee_is_busy", callerId1);
    }else{
        window.history.pushState("/dashboard","",'/video/'+roomid);
        room_id2.unshift(roomid);
        callerId.unshift(callerId1);
        document.body.classList.add("active-receiver-dialog");
        document.getElementById("caller_name").innerHTML = username + " is calling" + "...";
    }
});

//Group Video Call Invite
socket.on("group_video_call_accept", (roomid, callername, callerId1, callerPeer)=>{
    callerPeers.unshift(callerPeer);
    groupCallerSocketId.unshift(callerId1);
    groupRoomId.unshift(roomid);
    room_id1.unshift(roomid);
    if(videoCallStatus[0]===true){
        socket.emit("callee_is_busy", callerId1);
    }else{
        window.history.pushState("/dashboard","",'/video/'+groupRoomId[0]);
        document.getElementById("myNav").style.width = "100%";
        document.body.classList.add("active-group-receiver-dialog");
        document.getElementById("group_caller_name").innerHTML = callername + " is inviting you to a Group Call" + "...";
    }
});

socket.on("user-connected-group-call", userId =>{
    document.getElementById("group-chat-box-id").classList.remove("group-none");
    console.log(userId, "has joined the group call user-connected-group-call")
    setTimeout(connectToGroupCallee, 3000, userId);
    document.body.classList.remove("active-groupCallerDialog");
    window.history.pushState("/dashboard","",'/video/'+room_id1[0]);
});
socket.on("current-connected-group-peer", peerID=>{
    console.log(peerID, "has joined the group call current-connected");
    console.log(peerID, "current-connected-group-peer");
    // callerPeers.unshift(peerID)
});

//Group Call, 2 and more Callee
socket.on("current-connected-group-peer-twoandmore", grouplist=>{
    groupListFunctionToCall(grouplist);
    groupVideoCallStatus.unshift(true);
    videoCallStatus.unshift(true);
    console.log(grouplist, "current-connected-group-peer-twoandmore");
    // let x = grouplist.list_of_user.shift();
    connectGroupVideoCall(grouplist.list_of_user.shift());
});
socket.on("cancel-group-call", ()=>{
    document.body.classList.remove("active-group-receiver-dialog");
    window.history.pushState('/video/'+groupRoomId[0],"","/dashboard");
    document.getElementById("myNav").style.width = "0%";
});

//Accept Group Video Call 
document.getElementById("group-accept_vcall").addEventListener("click", function(){
    document.getElementById("group-chat-box-id").classList.remove("group-none");
    groupVideoCallStatus.unshift(true);
    socket.emit("group-call-join-room", groupRoomId[0], peerId[0], connectedUser[0]);
    // socket.emit("join-group-call",groupCallerSocketId[0], peerId[0]);
    document.body.classList.remove("active-group-receiver-dialog");
    getGroupChat();
    
    // acceptGroupCall();
});

//Cancel Group Video Call
document.getElementById("group-cancel_vcall").addEventListener("click", function(){
    document.body.classList.remove("active-group-receiver-dialog");
    window.history.pushState('/video/'+groupRoomId[0],"","/dashboard");
    document.getElementById("myNav").style.width = "0%";
});

myPeer.on('open', id => {
    peerId.unshift(id);
    autoUpdatePeerid(id);
});

socket.on("group-call-first-callee", userID =>{
    console.log(userID, "back to first callee")
    acceptGroupCall();
});

//Video Call Accepted
acceptVcall.addEventListener("click", function(){
    document.body.classList.remove("active-receiver-dialog");
    // setTimeout(
        socket.emit("join-room", room_id2[0] , peerId[0], callerId[0]), 3000
    // );
    console.log(room_id2[0] , peerId[0], callerId[0], "room_id2[0] , peerId[0], callerId[0]");
    
    // let videoTrack = 
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
    })
    // ;
    // videoTrack
    .then(stream => {
        addVideoStream(myVideo,stream);
        videoCallStatus.unshift(true);
        calleeStream.unshift(stream);
        let x = `
            <div id="middle_pos_One">
                <button>
                    <i class="fa-solid fa-video-slash fa-lg" id="off_cam"></i>
                </button>
                <button>
                    <i class="fa-solid fa-phone-slash fa-lg" style="color: red;" id="end_call"></i>
                </button>
            </diV>
        `
        document.getElementById("middle_position").innerHTML = x;
        document.getElementById("off_cam").addEventListener("click", function(){
            let videoStream = stream.getTracks().find(track => track.kind === 'video');
            if(videoStream.enabled){
                videoStream.enabled = false;
            }else{
                videoStream.enabled = true
            }
        });
        document.getElementById("end_call").addEventListener("click", function(){
            window.history.pushState('/video/'+room_id1[0], ",", "/dashboard");
            videoCallStatus.unshift(false);;
            myVideo.remove();
            stream.getTracks().forEach(function(track) {
                track.stop();
                document.getElementById("middle_pos_One").innerHTML = null;
                findRoomId();
            });
        })   
    });     
});

//Video Interface Control
myPeer.on("call", function(call) {
    if(groupVideoCallStatus[0]===true){
        try{
            if(calleeStream[0]===undefined){
                console.log(callerStream[0],"callerStream true");
                call.answer(callerStream[0]);
                const video = document.createElement("video");
                call.on("stream", userVideoStream => {
                    video.srcObject = userVideoStream;
                    video.addEventListener("loadedmetadata", ()=>{
                        video.play();
                    });
                    document.getElementById("group-video-grid").append(video);
                });
                if(videoCallStatus[0]===true){
                    document.getElementById("end_call").addEventListener("click", function(){
                        video.remove();
                        document.getElementById("group-chat-box-id").classList.add("group-none");
                    });
                };
                // socket.on("caller-disconnected", peer=>{
                //     video.remove();
                // });
                call.on("close", () => {
                    video.remove();
                    console.log("callee close");
                });
                peers[call.peer] = call;
                peersGroup.unshift(peers[call.peer]);
            }else{
                console.log(calleeStream[0],"calleeStream true");
                call.answer(calleeStream[0]);
                const video = document.createElement("video");
                call.on("stream", userVideoStream => {
                    video.srcObject = userVideoStream;
                    video.addEventListener("loadedmetadata", ()=>{
                        video.play();
                    });
                    document.getElementById("group-video-grid").append(video);
                });
                if(videoCallStatus[0]===true){
                    document.getElementById("end_call").addEventListener("click", function(){
                        document.getElementById("group-chat-box-id").classList.add("group-none");
                        video.remove();
                    });
                };
                // socket.on("caller-disconnected", peer=>{
                //     video.remove();
                // });
                call.on("close", () => {
                    video.remove();
                    console.log("callee close");
                });
                peers[call.peer] = call;
                peersGroup.unshift(peers[call.peer]);
            }
        }catch (err){
            consol.log(err, ("group peer call answer error"));
        };
    }else{
        try{
            console.log(groupVideoCallStatus[0],"groupVideoCallStatus false");
            call.answer(calleeStream[0]);
            const video = document.createElement("video");
            call.on("stream", userVideoStream => {
                console.log(userVideoStream, "caller stream to callee")
                belowVideoStream(video, userVideoStream);
            })
            call.on("close", () => {
                video.remove();
                console.log("callee close");
            });
            if(videoCallStatus[0]===true){
                document.getElementById("end_call").addEventListener("click", function(){
                    console.log("callee side end call");
                    call.close();
                    socket.emit("close_caller_videoBelow", callerId[0]);
                    videoCallStatus.unshift(false);;
                })
            }else{
                return false;
            };
            //Video Call callee side close video receiver
            socket.on("close_callee_videoBelow2", caller_Id =>{
                console.log(caller_Id, "close_callee_videoBelow2");
                call.close();
            });   
            call.on("error",() =>{
                console.log("data connection detected code in callee side");
            });
            peers[callerPeers[0]] = call;
            peersGroup.unshift(peers[callerPeers[0]]);

        }catch(err){
            consol.log(err, ("peer call answer error"));
        }
    };
});
socket.on("user-connected", userId => {
    console.log(callerStream[0],"connect to new user working , user connected");
    setTimeout(connectToNewUser, 3000, userId); 
    document.body.classList.remove("active-dialog");
});

//Video Call canceled by callee
socket.on("callee_video_cancel", call_canceled =>{
    console.log("callee denied call");
    let x = `<i class="fa-solid fa-circle-xmark" style="color: #e90c0c;"></i>`;
    callSomeone.innerHTML = calleeInfo4Socket[0]+" has denied the call " + x;
});

//Video Call Canceled due to Callee on cal
socket.on("callee_is_busy", callee_busy =>{
    console.log("callee is on another call");
    let x = `<i class="fa-solid fa-circle-xmark" style="color: #e90c0c;"></i>`;
    callSomeone.innerHTML = calleeInfo4Socket[0]+" is currently on other call " + x;
})

// Video call Callee dialog close button
document.querySelector(".receiver-dialog .cancel_vcall").addEventListener("click", function(){
    document.body.classList.remove("active-receiver-dialog");
    window.history.pushState('/video/'+room_id2[0], ",", " /dashboard");
    socket.emit("answer_cancel_videocall", callerId[0]);
});

//Video Call Disconnected
socket.on("user-disconnected", userId => {
    console.log(userId, "user disconnected");
    let x = peersGroup.filter(e=>e===peers[userId]);
    if(x.length===0){
        return false;
    }else{
        x[0].close();
        // console.log("x[0].close()")
    };
    // console.log(peers[userId], "user-disconnected 1st statement");
    // console.log(peers, "user-disconnected 2nd statement");
    // console.log(peersGroup, "user-disconnected 3nd statement");
    // console.log(x, "user-disconnected 4th statement");
});
//Video Call Group Disconnect
socket.on("caller-disconnected",peerId =>{
    console.log("caller disconnected");
    document.getElementById("end-call-button").innerHTML = null;
    document.getElementById("group-video-grid").innerHTML = null;
    groupVideoCallStatus.unshift(false);
    videoCallStatus.unshift(false);
    if(calleeStream[0]===undefined){
        callerStream[0].getTracks().forEach(function(track) {
            track.stop();
        });
    }else{
        calleeStream[0].getTracks().forEach(function(track) {
            track.stop();
        });
    }
    myVideo.remove();
    window.history.pushState('/video/'+groupRoomId[0],"","/dashboard");
    document.getElementById("myNav").style.width = "0%";
    alert("CALLER DISCONNECTED");
    
});
//Group Chat Box Receiver from Sender
socket.on("chatbox-to-group", (message, sender)=>{
    console.log(sender, ", has said", message);
    let x = `
        <p id="user_style" class="card_body_group">
            <span class="sender-name"><b>${sender}</b></span><br>
            <span class="card_body_span">${message}</span>
        </p>
    `
    channelList.innerHTML = channelList.innerHTML + x;
})
 
//Final socket.io, Sender Chat Interface response 
socket.on("chatMessageResponseUser", body =>{
    console.log(body, "chatMessageResponse here");
        let x = `
        <p id="user_style" class="user_message">
            <span class="user_mess">${body.message}</span><br>
         </p>
        `
        inputTest.innerHTML = inputTest.innerHTML + x;
});
//Socket io, Chat Receiver, Receiver Side
socket.on("chatMessageResponseOther", (body, senderName) =>{
    if(senderName === touserData[0]){
        // console.log(senderName,touserData[0], "chatMessageResponseOther opened receiver convo");
        let x = `
        <p id="user_style" class="card_body">
            <span class="card_body_span">${body.message}</span><br>
         </p>
        `
        inputTest.innerHTML = inputTest.innerHTML + x;
    }else{
        // console.log(senderName,touserData[0], "chatMessageResponseOther");
        // let x = `
        //     <span class="senderName">${senderName}'s message</span>
        //     <p id="user_style" class="card_body">
        //         <span>${body.message}</span><br>
        //     </p>
        // `
        // inputTest.innerHTML = inputTest.innerHTML + x;
        return false;
    }
});

//Get User Data Only
function userLogin(){
        fetch("/user/data")
        .then(function(res){
            return res.json();
        }).then(function(data){
            userData.unshift(data[0]);
            autoUpdateSocket(connectedUser[0]);
//Dropdown
            let x = `
                <div>
                    <span> Welcome ${userData[0].username} </span>
                    <span class="logout_dropdown"> 
                        <button> <i class="fa-solid fa-angle-down" id="drop"></i> </button>
                    <div>
                    <div class="logout_drop" id="logout">
                    </div>
            `;
            userName.innerHTML = x;
            let y = `
                <div id="log_butn">
                    <span class="span1">Logout</span>
                </div>
            `;
            console.log(userData[0].contact_number,"userData[0].contact_number");
            console.log(userData,"userData");

            if(userData[0].contact_number!=undefined){
                let z = `
                    <span class="number-or-add"> + ${userData[0].contact_number}</span>
                `;
                document.getElementById("contact").innerHTML = z;
            }else{
// Add Phone Number DropOut
                let w = `
                    <span class="number-or-add"><a id="add-number" href="javascript: void(0)"> Add a phone Number </a></span>
                    <div id="add-number-div"></div>
                `;
                // <form id="add-number-pop">
                // </form>
                // <label for="email_id">Email :</label><br>
                // <input class="input_box" placeholder="Email" type="email" name="email" id="email_id" disabled value="${userData[0].email}"><br>
                // <label for="username_id">Username :</label><br>
                // <input class="input_box" placeholder="Username" type="text" name="username" id="username_id" disabled value="${userData[0].username}"><br>
                document.getElementById("contact").innerHTML = w;
                document.getElementById("add-number").addEventListener("click", function(){
                    if(!document.getElementById("save-number-div")){
                        let v = `
                            <div id="save-number-div">
                                <label for="email_id">Email :</label><br>
                                <input class="input_box" placeholder="Email" type="email" name="email" id="email_id" disabled value="${userData[0].email}"><br>
                                <label for="contact_id">Contact Number :</label><br>
                                <input class="input_box" placeholder="Contact Number" type="number" required name="contact_number" id="contact_id"><br>
                                <input class="submit_button" type="submit" value="save" id="save-number">
                            </div>
                        `;
                        document.getElementById("add-number-div").innerHTML = v;
                        document.getElementById("save-number").addEventListener("click", ()=>{
                            let number = document.getElementById("contact_id").value
                            saveNewNumber(number);
                });
                    }else{
                        document.getElementById("save-number-div").remove();
                    };
                   
                });
               


            }
            document.getElementById("drop").addEventListener("click", function(){
                if(document.getElementById("logout").innerHTML != y){
                    document.getElementById("logout").innerHTML = y
                }else {
                    document.getElementById("log_butn").remove();
                };
            //User Logout
                document.getElementById("log_butn").addEventListener("click", function(){
                    fetch("/logout" , {
                        method: "post",
                        // headers: {
                        //     'Content-type': 'application/json'
                        // }
                    })
                    .then(res=>{
                        window.history.pushState('/index', ",", " /login");
                        location.reload();
                        console.log(res, "logout success");
                    }).catch(err =>{
                        console.log(err, "logout error");
                    });
                    // console.log("logout button");
                });
            });
        }).catch(err => {
            console.log(err, "error fetching data")
        })
}
userLogin()

//Auto Update PeerID
async function autoUpdatePeerid(id){
    console.log(id, "autoupdate peer id");
    await fetch("/updatePeer/"+userData[0]._id, {
        method: "put",
        headers:{
            'Content-type': 'application/json'
        },
        body: JSON.stringify({peerid:id})
    }).then(res=>{
        console.log(res, "PEER iD UPDATED");
    }).catch(err => {
    console.log(err, "PEER iD DENIED");
    })
};

//Save Group Session
async function createGroupSession(){
    await fetch('/create/group-session', {
        method: 'post',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({room: room_id1[0], peerId: peerId[0]})
    }).then(res => {
        console.log(res, "Group Session Saved");
    }).catch(res=>{
        console.log(res, "Group Sess")
    });
};

//Save New Number
async function saveNewNumber(data){
    console.log(data,"data save number");
    await fetch('/save/number', {
        method: 'post',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({number: data, id: userData[0]._id})
    }).then(function(res) {
        return res.json();
    }).then(function(newdata) {
        console.log(newdata, "Group Session Saved");
        document.getElementById("save-number-div").remove();
        let z = `
            <span class="number-or-add">+${data}</span>
        `;
        document.getElementById("contact").innerHTML = z;
    }).catch(res=>{
        console.log(res, "Group Sess")
    });
};

//Auto update api
async function autoUpdateSocket(userID1){
    // let oneA = userID1[0];
    // let twoA = {socketid:userID1}
    // console.log(twoA,"1 new data here autoupdatesocket");
    // console.log(userData[0],"2 new data here autoupdatesocket");
    if(userData[0]!=[]){
        await fetch("/update/socket/"+userData[0]._id, {
            method: "put",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({socketid:userID1})
        }).then(res=>{
            console.log(res, "SOCKET iD UPDATED");
        }).catch(err => {
        console.log(err, "SOCKET iD DENIED");
        })
    }else{
        return false;
    }
};

//Auto-save to user's database
socket.on("message", userID1 => {
    connectedUser.unshift(userID1);

    console.log(userID1, "Welcome to SOuLLEY");

    if(userData[0]!=undefined){
        console.log(userData[0], "ready to connect");
        autoUpdateSocket(userID1);
    }else{
        // return console.log("empty userData");
    }
});

button.addEventListener("click", send, false);

//Send SMS
function send(){
    const number = numberInput.value.replace(/\D/g, '');
    const text = textInput.value;
    const auth_to = document.getElementById("auth_token").value;
    // const text_num = JSON.stringify({number: number, text: text});
    console.log(auth_to, "auth_to");
    if(auth_to!=""){
        fetch('/sms', {
            method: 'post',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({number: number, text: text, auth_token: auth_to, auth_sid: TWILIO_SID})
        }
        ).then(function(res){
            console.log(res, "sent result")
            if(res.status === 200){
                console.log(res.status, "sent successfully")
                alert("Text Message Sent Successfully: " + number );
                document.getElementById("number").value = "";
                document.getElementById("msg").value = "";
            }else{
                console.log(res, "error twilio");
                alert("Check Receiver's Number");
            }
        }).catch(err =>{
            console.log(err, "error twilio");
            alert("Check Receiver's Number");
        });
    }else{
        alert("Auth Token is required")
    }
};

//Send Call
callButton.addEventListener("click", call, false);
function call(){
    const call = callNumber.value.replace(/\D/g, '');
    const auth_to = document.getElementById("auth_token").value;
    // console.log(call, "call number");

    if(auth_to!=""){
        document.body.classList.add("active-numCallDialog");
        document.getElementById("numCallText").innerHTML = "Calling Number " + call + ". . .";
        let x = `
            <button id="callCancel">
                <i class="fa-solid fa-phone-slash" style="color: #eb1000"></i>
            </button
        `
        document.getElementById("okButton").innerHTML = x;
        document.getElementById("callCancel").addEventListener("click", () =>{
            document.body.classList.remove("active-numCallDialog");
        });

        fetch('/call', {
            method: 'post',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({number: call, auth_token: auth_to, auth_sid: TWILIO_SID})
        }).then(res => {
            if(res.status === 500){
                let x = `
                    <i class="fa-regular fa-circle-xmark" style="color: #e7230d;"></i>
                `;
                document.getElementById("numCallText").innerHTML = " Number can't be reached " + x;
            }else {
                let x = `
                    <i class="fa-solid fa-phone-flip" style="color: #1c8228;"></i>
                `;
                document.getElementById("numCallText").innerHTML = call + " is on the  line " + x;
            }
        }).catch(function(error){
            console.log(error);
        });
    }else{
        alert("Auth Token required");
    }
};

//Users array for dropdown of Video Call and Chat
    async function getMessages(){
        await fetch("/message") 
        .then(function(res){
            return res.json();
        }).then(function(data){
            userID.unshift(data.userID);
        }).catch(err => {
            console.log(err, "error fetching data")
        })
    };
    getMessages();

//Fetch personal chat
myInput.addEventListener("input",(req, res)=>{
        req.preventDefault();
        let data = req.target.value;
        touserData.unshift(data);
        let y = usersArray.find(function(elements){
            return elements === data;
        });
        if(y===data){
            inputTest.innerHTML = null
            getPersonalChat(data);
        }else{
            return false;
        }
});
async function getPersonalChat(data){
    let sender_Id = userData[0]._id;
        console.log(sender_Id,"sender id, to another user id")
    if(data===""){
        location.reload()
    }else{
    await fetch('/search/chat', {
        method: 'post',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({username: data, senderId: sender_Id})
        // body: JSON.stringify({email: `${myInput.value}`, data})
    }).then(function(res){
        let x = `
            <div>
                <input placeholder="chat here" id="chat_content">
                <input type="button" id="send_chat" value="send chat">
            </div>
        `;
            document.getElementById("chat_input_here").innerHTML = x;

//Send Personal MEssage
            const chatContent = document.getElementById("chat_content");
            document.getElementById("send_chat").addEventListener("click",() =>{
                sendChatAPI(chatContent);
            });
            return res.json();
    }).then(function(data){
        console.log(data, "query result 1");
        console.log(data.message_2, "query result");

            for(let message of data.message_2){
                // console.log(message.user_id[0],"chandun here", userID[0])
                if(message.user_id[0]===userID[0]){
                let x = `
                        <p id="user_style" class=" user_message">
                        <span class="user_mess">${message.message}</span><br>
                            </p>
                    `
                    // document.getElementsById(user_style).classList.add("user_message");
                inputTest.innerHTML = inputTest.innerHTML + x;
                }else{
                    let x = `
                        <p id="user_style" class=" card_body">
                            <span class="card_body_span">${message.message}</span><br>
                        </p>
                    `
                    inputTest.innerHTML = inputTest.innerHTML + x;
                }
            };
        }).catch(err => {
        console.log(err, "error fetching data")
    })
    }
};

// video call Caller dialog close button
document.querySelector(".dialog .cancel_vcall").addEventListener("click", function(){
    window.history.pushState('/video/'+room_id1[0], ",", " /dashboard");
    document.body.classList.remove("active-dialog");
});

//Fetch RoomID
async function findRoomId(){
    await fetch("/video"
    )
    .then(function(res){
        return res.json();
    })
    .then(function(data){
        // console.log(data.roomId, "video call new room id");
        room_id1.unshift(data.roomId);
    })
    .catch(err => {
        console.log(err);
    })
};
findRoomId();

//Video Call Input function
callInput.addEventListener("input", (req, res)=>{
        let callee = req.target.value;
        let y = usersArray.find(function(elements){
            return elements === callee;
        });
        if(callee!=""){
            if(videoCallStatus[0]===true){
                console.log("close previous session to start new call");
                alert("close previous sessioin to start new video call");
            }else{
                if(y===callee){
                    document.body.classList.add("active-dialog");
                    callSomeone.innerHTML = "Calling "+ req.target.value + "...";
                    calleeInfo4Socket.unshift(req.target.value);
                    setTimeout(
                        socket.emit("video_call_invite", req.target.value, userData[0].username, room_id1[0], connectedUser), 4000
                    );
                    console.log(room_id1[0], "chandun roomid 1 here");  
                    window.history.pushState("/dashboard","",'/video/'+room_id1[0]);
                }else{
                    return false;
                }
            };
        }else{
            return false
        };
});  

//Search Dropdown 
async function getAllUser(){
    await fetch("/user")
    .then(function(res){
        return res.json();
    }).then(function(data){
        for(let user of data){
            usersArray.unshift(user.username);
            const y =  `
                <option value="${user.username}">
            `
            document.getElementById("user_data").innerHTML = document.getElementById("user_data").innerHTML + y;
        }
    }).catch(err => {
        console.log(err, "error fetching data")
    })
};
getAllUser();
function sendChatAPI(chatContent){
    let chat = chatContent.value;
    let userId = userID[0];
    let toUser = touserData[0];
    let body1 = {message: chat, user_ID: connectedUser[0], send_to: toUser};
    console.log(body1, "body");

    socket.emit("chatMessage", body1)

    fetch("/save/message", {
        method: 'post',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({message: chat, user_ID: userId, send_to: toUser})
        // body: {number: number, text: text}
    })
    .then(res => {
        document.getElementById("chat_content").value = "";
        document.getElementById("chat_content").focus();
        // res.target.elements.chatContent.focus();
    })
    .catch(function(error){
        console.log(error, "/save/message error");
    });
};

//Video Stream Function
function addVideoStream(video, stream){
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", ()=>{
        video.play();
    });
        videoBody.append(video);
};
function belowVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener("loadedmetadata", ()=>{
        video.play()
    });
    videoBelow.append(video);
};
// function connectToNewUser(userId, stream){
function connectToNewUser(userId){
    try{
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            addVideoStream(myVideo,stream);
            videoCallStatus.unshift(true);
            callerStream.unshift(stream);

            const call = myPeer.call(userId, stream);
            const video = document.createElement('video');
            call.on("stream", function(stream){
                console.log(stream, "callee stream return")
                belowVideoStream(video, stream)
            });
            if(videoCallStatus[0]===true){
                document.getElementById("end_call").addEventListener("click", function(){
                    console.log("caller side end call");
                    call.close();
                });
            }else{
                return false;
            };
            call.on("close", () => {
                video.remove();
                console.log("caller close");
            });
            socket.on("close_caller_videoBelow", () =>{
                console.log("close_caller_videoBelow");
                call.close();
            });   
            call.on("error",error =>{
                console.log(error, "data connection detected, code in caller side");
            });
            peers[userId] = call;
            peersGroup.unshift(peers[userId]);

        });
             let x = `
                        <div id="middle_pos_One">
                            <button>
                                <i class="fa-solid fa-video-slash fa-lg" id="off_cam"></i>
                            </button>
                            <button>
                                <i class="fa-solid fa-phone-slash fa-lg" style="color: red;" id="end_call"></i>
                            </button>
                        </diV>
                `
            document.getElementById("middle_position").innerHTML = x;
            document.getElementById("off_cam").addEventListener("click", function(){
                let videoStream = callerStream[0].getTracks().find(track => track.kind === 'video');
                if(videoStream.enabled){
                    videoStream.enabled = false;
                }else{
                    videoStream.enabled = true
                }
            });
            document.getElementById("end_call").addEventListener("click", function(){
                window.history.pushState('/video/'+room_id1[0], ",", "/dashboard");
                socket.emit("close_callee_videoBelow", calleeInfo4Socket[0], connectedUser[0]);
                videoCallStatus.unshift(false);
                callerStream[0].getTracks().forEach(function(track) {
                    track.stop();
                    myVideo.remove();
                    document.getElementById("middle_pos_One").innerHTML = null;
                    findRoomId();
                });
            })   
    }catch(err){
        console.log(err);
    }
    
};

//Group Video Call
document.getElementById("create_channel").addEventListener("click" , function(){
    document.body.classList.add("active-create-channel-dialog");
});
document.querySelector(".create-channel-dialog .close-button").addEventListener("click", function(){
    document.body.classList.remove("active-create-channel-dialog");
});
document.getElementById("groupCall").addEventListener("input", (req,res)=>{
    let x =  req.target.value;
    let d = x_array.find(function(elements){
        return elements === x;
    });
    let y = usersArray.find(function(elements){
        return elements === x;
    });
    if(x!=""){
        if(d != x){
            if(x===y){
                document.getElementById("edit-group-list").classList.remove("edit-group-class");
                // let x = `
                //     <button id="edit-group-list">edit</button>
                // `;
                // document.getElementById("groupCallSubmit").innerHTML = document.getElementById("groupCallSubmit").innerHTML + " " + x ;
                x_array.unshift(x);
                return document.getElementById("groupCallInvited").innerHTML= document.getElementById("groupCallInvited").innerHTML + x + " ";
            }else{
                return false;
            }
        }else{
            console.log("false else");
            return false;
        }
    }else{
        return false;
    };
});
document.getElementById("edit-group-list").addEventListener("click", function(){
    if(document.getElementById("edit-group-list").value === "save change"){
        document.getElementById("groupCall").removeAttribute('disabled');
        document.getElementById("groupCallSubmit").removeAttribute('disabled');

        groupCallInvited.innerHTML = null;
        document.getElementById("edit-group-list").value = "Edit";
        x_array.forEach(function (element){
            document.getElementById("groupCallInvited").innerHTML= document.getElementById("groupCallInvited").innerHTML + element + " ";
        })
        if(x_array.length===0){
            document.getElementById("edit-group-list").classList.add("edit-group-class");
            document.getElementById("edit-group-list").value = "Edit";
            while(x_array.length > 0) {
                x_array.pop();
            }
        }
    }else{
        document.getElementById("groupCall").setAttribute('disabled', '');
        document.getElementById("groupCallSubmit").setAttribute('disabled', '');
       
        
        console.log("remove item in an array");
        groupCallInvited.innerHTML = null
           
        document.getElementById("edit-group-list").value = "save change"
            
        x_array.forEach(function (element, i){
            let x =`
                <button id="${i}" element-id="${element}" class="group-remove-class">${element}</button>
            `;
            groupCallInvited.innerHTML = groupCallInvited.innerHTML + x;
        });
        hey()
    }
});
function hey(){
    if(x_array.length===0){
        document.getElementById("edit-group-list").value = "Edit";
        document.getElementById("groupCall").removeAttribute('disabled');
        document.getElementById("groupCallSubmit").removeAttribute('disabled');
        document.getElementById("edit-group-list").classList.add("edit-group-class");
        while(x_array.length > 0) {
            x_array.pop();
        }
    }
    const groupRemoveClass = document.querySelectorAll('.group-remove-class');
    groupRemoveClass.forEach(function(groupRemove){
        groupRemove.addEventListener("click", function(){
            var y = this.getAttribute('element-id');
            console.log(y);
    
            groupRemovefunc(y);
           
            hey()
        });
    })
};

function groupRemovefunc(data){
    groupCallInvited.innerHTML = null

    console.log("groupRemovefunction here");

    var z = x_array.filter(e=>e!==data);
            console.log(z, "z");

    while(x_array.length > 0) {
        x_array.pop();
    }
    // x_array = z;
    console.log(x_array, "after z filter");

    z.forEach(function(e){
        x_array.unshift(e);
    });

    x_array.forEach(function (element, i){
        let x =`
            <button id="${i}" element-id="${element}" class="group-remove-class">${element}</button>
        `;
        groupCallInvited.innerHTML = groupCallInvited.innerHTML + x;
    });
};

document.getElementById("groupCallSubmit").addEventListener("click", function(){
    document.getElementById("edit-group-list").classList.add("edit-group-class");
    if(document.getElementById("groupCall").value===""){
        alert("No user was choosen to a Group Call");
    }else{
        if(videoCallStatus[0]===true){
            console.log("close previous session to start new call");
            alert("close previous sessioin to start new video call");
        }else{
            createGroupSession();
            let x = x_array.length;
            console.log(x,x_array, "x data and x_array");
            if(x===1){
                console.log( "if x ===1");
                socket.emit("group_video_call", x_array[0], room_id1[0], userData[0].username, connectedUser[0], peerId[0]);
            }else{
                console.log( "if x > 1");
                x_array.forEach( element=>{
                    socket.emit("group_video_call", element, room_id1[0], userData[0].username, connectedUser[0], peerId[0]);
                });
            };
            // callerGroupCall();
            document.body.classList.remove("active-create-channel-dialog");
            x_array.splice(0, x_array.length);
            document.getElementById("groupCallInvited").innerHTML = null;
            document.getElementById("groupCall").value = "";
            document.body.classList.add("active-groupCallerDialog");
            // let body = {roomId:room_id1[0], peerId1:peerId[0]}
            socket.emit("group-call-join-room-caller", room_id1[0],connectedUser[0]);
            while(x_array.length > 0) {
                x_array.pop();
            }
        }
    }
});

//Group Call, Caller Dialog
document.getElementById("group-caller-cancel-vcall").addEventListener("click", function(){
    document.body.classList.remove("active-groupCallerDialog");
    findRoomId();
    x_array.forEach( element=>{
        socket.emit("groupCallerDialog", element);
    });
});

// function callerGroupCall(){
//     const video = document.createElement('video')
//     if(videoCallStatus[0]===true){
//         console.log("close previous session to start new call");
//         alert("close previous sessioin to start new video call");
//     }else{
//         navigator.mediaDevices.getUserMedia({
//             video:true,
//             audio:true
//         }).then(stream=> {
//             video.srcObject = stream;
//             video.addEventListener("loadedmetadata", ()=> {
//                 video.play();
//             });
//             document.getElementById("group-video-grid").append(video);
//             videoCallStatus.unshift(true);
//             callerStream.unshift(stream);
//         });
//         let x = `
//             <div class="end-call-button" id="end-call-button">
//                 <button>
//                     <i class="fa-solid fa-phone-slash fa-lg" style="color: red;" id="end_call"></i>
//                 </button>
//             </div>
//         `;
//         document.getElementById("group-video-grid").innerHTML = x;
//         document.getElementById("end_call").addEventListener("click", function(){
//             socket.emit("group-video-call-quit", peerId[0], room_id1[0]);
//             groupVideoCallStatus.unshift(false);
//             document.getElementById("end-call-button").innerHTML = null;
//             document.getElementById("myNav").style.width = "0%";
//             window.history.pushState('/video/'+room_id1[0],"","/dashboard");
//             videoCallStatus.unshift(false);
//             callerStream[0].getTracks().forEach(function(track) {
//                 track.stop();
//                 video.remove();
//                 findRoomId();
//             });
//         })
//     };
// };

function acceptGroupCall(){
    try{
        navigator.mediaDevices.getUserMedia({
            video:true,
            audio:true
        }).then(stream=>{
            calleeStream.unshift(stream);
            myVideo.srcObject = stream;
            myVideo.addEventListener("loadedmetadata", ()=> {
                myVideo.play();
            });
            document.getElementById("group-video-grid").append(myVideo);
            videoCallStatus.unshift(true);
//Group Call 3 and more
            socket.on("to_groupcall_three_and_more", peerReceiver=>{
                console.log("peerReceiver came, 3 and more group caller");
                // try{
                    // navigator.mediaDevices.getUserMedia({
                    //     video:true,
                    //     audio:true
                    // }).then(stream=> {
                    //     groupVideoStream(myVideo, stream);
                        // groupVideoCallStatus.unshift(true);
                        // videoCallStatus.unshift(true);
                        // callerStream.unshift(stream);

                        const call = myPeer.call(peerReceiver, calleeStream[0]);
                        const video = document.createElement('video');

                        call.on("stream", function(stream){
                            groupVideoStream(video, stream);
                        });
                        // if(videoCallStatus[0]===true){
                        //     document.getElementById("end_call").addEventListener("click", function(){
                        //         video.remove();
                        //     });
                        // };
                        call.on("close", ()=>{
                            video.remove();
                        });
                        call.on("error",err =>{
                            console.log(err, "data connection detected, code in caller side");
                        })
                        peers[peerReceiver] = call;
                        peersGroup.unshift(peers[peerReceiver]);
                    // });
                // }catch(err){
                //     console.log(err, "peerReceiver came error 3 and more group user");
                // }
                // connectToGroupCallee(peerReceiver)
            });
        });
        let x = `
            <div class="end-call-button" id="end-call-button">
                <button>
                    <i class="fa-solid fa-video-slash fa-lg" id="off_cam"></i>
                </button>
                <button>
                    <i class="fa-solid fa-phone-slash fa-lg" style="color: red;" id="end_call"></i>
                </button>
            </div>
        `;
        document.getElementById("group-video-grid").innerHTML = x;
        document.getElementById("off_cam").addEventListener("click", function(){
            let videoStream = calleeStream[0].getTracks().find(track => track.kind === 'video');
            if(videoStream.enabled){
                videoStream.enabled = false;
            }else{
                videoStream.enabled = true
            }
        });
        document.getElementById("end_call").addEventListener("click", ()=>{
            document.getElementById("group-chat-box-id").classList.add("group-none");
            socket.emit("group-user-disconnect", room_id1[0], peerId[0]);
            console.log("group-user-disconnect");
            groupVideoCallStatus.unshift(false);
            window.history.pushState('/video/'+groupRoomId[0],"","/dashboard");
            document.getElementById("myNav").style.width = "0%";
            document.getElementById("end-call-button").innerHTML = null;
            videoCallStatus.unshift(false);
            calleeStream[0].getTracks().forEach(function(track) {
                track.stop();
                myVideo.remove();
                findRoomId();
            });
        });
    }catch(err){
        console.log(err, "acceptGroupCall error callee side");
    }
}

function groupVideoStream(video, stream){
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", ()=> {
        video.play();
    });
    myVideoGrid.append(video);
}

function connectToGroupCallee(userId){
    try{
        // const video = document.createElement('video');
        navigator.mediaDevices.getUserMedia({
            video:true,
            audio:true
        }).then(stream=> {
            groupVideoStream(myVideo, stream);
            groupVideoCallStatus.unshift(true);
            videoCallStatus.unshift(true);
            callerStream.unshift(stream);

            const call = myPeer.call(userId, stream);
            const video = document.createElement('video');
            call.on("stream", function(calleeStream){
                groupVideoStream(video, calleeStream);
            });
            if(videoCallStatus[0]===true){
                document.getElementById("end_call").addEventListener("click", function(){
                call.close();
                document.getElementById("group-chat-box-id").classList.add("group-none");
                });
            };
            call.on("close", ()=>{
                video.remove();
            });
            call.on("error",err =>{
                console.log(err, "data connection detected, code in caller side");
            })
            peers[userId] = call;
            peersGroup.unshift(peers[userId]);
        });
        let x = `
            <div class="end-call-button" id="end-call-button">
                <button>
                    <i class="fa-solid fa-video-slash fa-lg" id="off_cam"></i>
                </button>
                <button>
                    <i class="fa-solid fa-phone-slash fa-lg" style="color: red;" id="end_call"></i>
                </button>
            </div>
        `;
        document.getElementById("group-video-grid").innerHTML = x;
        document.getElementById("off_cam").addEventListener("click", function(){
            let videoStream = callerStream[0].getTracks().find(track => track.kind === 'video');
            if(videoStream.enabled){
                videoStream.enabled = false;
            }else{
                videoStream.enabled = true
            }
        });
        document.getElementById("end_call").addEventListener("click", function(){
            document.getElementById("group-chat-box-id").classList.add("group-none");
            // socket.emit("group-video-call-quit", peerId[0], room_id1[0]);
            socket.emit("group-user-disconnect", room_id1[0], peerId[0]);
            groupVideoCallStatus.unshift(false);
            document.getElementById("end-call-button").innerHTML = null;
            document.getElementById("myNav").style.width = "0%";
            window.history.pushState('/video/'+room_id1[0],"","/dashboard");
            videoCallStatus.unshift(false);
            callerStream[0].getTracks().forEach(function(track) {
                track.stop();
                myVideo.remove();
                findRoomId();
            });
        })
    } catch (err){
        console.log(err, "video call error caller side");
    }

};

function connectGroupVideoCall(callerPeersId){
    try{
        //const video = document.createElement('video');
        navigator.mediaDevices.getUserMedia({
            video:true,
            audio:true
        }).then(stream=> {
            groupVideoStream(myVideo, stream);
            callerStream.unshift(stream);
            // console.log(callerPeersId, "grouplist element here chandun");
            const call = myPeer.call(callerPeersId, stream);
            const video = document.createElement('video');

            call.on("stream", function(calleestream){
                groupVideoStream(video, calleestream);
            });
            // if(videoCallStatus[0]===true){
            //     document.getElementById("end_call").addEventListener("click", function(){
            //         video.remove();
            //     });
            // };
            call.on("close", ()=>{
                video.remove();
            });
            call.on("error",err =>{
                console.log(err, "data connection detected, code in caller side");
            })
            peers[callerPeersId] = call;
            peersGroup.unshift(peers[callerPeersId]);

            socket.on("to_third_user_in_group", peerReceiver=>{
                const call = myPeer.call(peerReceiver, stream);
                const video = document.createElement('video');

                call.on("stream", function(receiverStream){
                    groupVideoStream(video, receiverStream);
                });
                // if(videoCallStatus[0]===true){
                //     document.getElementById("end_call").addEventListener("click", function(){
                //         video.remove();
                //     });
                // };
                call.on("close", ()=>{
                    video.remove();
                });
                call.on("error",err =>{
                    console.log(err, "data connection detected, code in caller side");
                })
                peers[peerReceiver] = call;
                peersGroup.unshift(peers[peerReceiver]);
            });
        });

        let x = `
            <div class="end-call-button" id="end-call-button">
                <button>
                    <i class="fa-solid fa-video-slash fa-lg" id="off_cam"></i>
                </button>
                <button>
                    <i class="fa-solid fa-phone-slash fa-lg" style="color: red;" id="end_call"></i>
                </button>
            </div>
        `;
        document.getElementById("group-video-grid").innerHTML = x;
        document.getElementById("off_cam").addEventListener("click", function(){
            let videoStream = callerStream[0].getTracks().find(track => track.kind === 'video');
            if(videoStream.enabled){
                videoStream.enabled = false;
            }else{
                videoStream.enabled = true
            }
        });
        document.getElementById("end_call").addEventListener("click", function(){
//Group Call close
            document.getElementById("group-chat-box-id").classList.add("group-none");
            socket.emit("group-user-disconnect", room_id1[0], peerId[0]);
            groupVideoCallStatus.unshift(false);
            document.getElementById("end-call-button").innerHTML = null;
            document.getElementById("myNav").style.width = "0%";
            window.history.pushState('/video/'+room_id1[0],"","/dashboard");
            videoCallStatus.unshift(false);
            callerStream[0].getTracks().forEach(function(track) {
                track.stop();
                myVideo.remove();
                findRoomId();
            });
        })
    } catch (err){
        console.log(err, "video call error caller side");
    };
};

//Group List Function To Be called by Multiple Caller
function groupListFunctionToCall(grouplist){
    let y = grouplist.list_of_user.length
    console.log(y,"y length data");

    console.log(grouplist.list_of_user,"before x data");
    let x = grouplist.list_of_user.filter(e=>e!==callerPeers[0]);
    console.log(x,"x data");
    
    if(y===2){
        // grouplist.list_of_user.shift();
        console.log(x, "y===2")
        setTimeout(secondGroupCaller, 3000, x[0]);
        // socket.emit("groupcall_three_and_more", x[0], peerId[0]);
    }else{
        // if(y===3){
            let w = x.shift();
            let z = x.filter(e=>e!==w[0]);
            console.log(z, "z foreach element");
            setTimeout(secondGroupCaller, 3000, w);
            // socket.emit("groupcall_three_and_more", w, peerId[0]);
            z.forEach(element=>{
                setTimeout(foreEachGroup, 3000, element);
                // socket.emit("groupcall_more_than_three", element, peerId[0]);
            });
        // }else{
        //     socket.emit("groupcall_three_and_more", w, peerId[0]);
        //     z.forEach(element=>{
        //         console.log(element,"x data element");
        //         socket.emit("groupcall_more_than_three", element, peerId[0]);
        //     });
        // }
    };
};

function foreEachGroup(element){
    socket.emit("groupcall_more_than_three", element, peerId[0]);
};

function secondGroupCaller(x){
    socket.emit("groupcall_three_and_more", x, peerId[0]);
}

//Group Chat Box
document.getElementById("group-chatbox-send").addEventListener("click", async function(){
    let groupMessage = document.getElementById("group-chatbox-text").value;
    console.log(groupMessage, "to group chat");
    await fetch('/chatbox', {
        method: 'post',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({message: groupMessage, user_ID: userID[0], room:room_id1[0]})
    }).then(function(res){
        return res.json();
    }).then(function(data){
        let x = `
            <p id="user_style" class="user_message">
                <span class="user_mess">${groupMessage}</span><br>
            </p>
        `
        channelList.innerHTML = channelList.innerHTML + x;
        console.log(data, "chatbox save success");
        document.getElementById("group-chatbox-text").value = "";
        console.log(room_id1[0], userData[0].username, groupMessage, "room_id1[0], userData[0].username, groupMessage");
        // setTimeout(chatBoxSend, 3000, groupMessage);
        data.list_of_user.forEach(element=>{
            if(element===peerId[0]){
                return false;
            }else{
                socket.emit("chatbox-sender", room_id1[0], userData[0].username, groupMessage, element);
            }
        })
    }).catch(function(err){
        console.log(err, "/chatbox error");
    });
})
// function chatBoxSend(groupMessage){
//     console.log("chatboxsend groupmessage", groupMessage);
// }

//Get All chat with the same roomid
async function getGroupChat(){
    await fetch('/getChatbox', {
        method: 'post',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({room:room_id1[0]})
    }).then(function(res){
        return res.json();
    }).then(function(data){
        console.log(data, "data here chandun");

    }).catch(function(err){
        console.log(err, "/chatbox error");
    });
}