const   numberInput = document.getElementById("number"),
        textInput = document.getElementById("msg"),
        button = document.getElementById("button"),
        response = document.querySelector(".response"),
        callNumber = document.getElementById("call_number"),
        callButton = document.getElementById("call_id"),
        TWILIO_SID = "ACb5745873e9c982ef6eefe86dd3c21665",

//Send Chat
        touserData = [],

//socket id
        connectedUser = [],

//vcall interface
        callInput = document.getElementById("callInput"),
        videoBody = document.getElementById("video_body"),
        videoBelow = document.getElementById("video_below"),
        myPeer = new Peer(),
      
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

        searchChat = document.getElementById("search_chat"),
        inputTest = document.getElementById("input_test"),
        socket = io(),
        userID = [],
        userData = [],
        myInput = document.getElementById('myInput'),
        userName = document.getElementById("username");

        myVideo.muted = true;

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

myPeer.on("open", id => {
    peerId.unshift(id)
});

//Video Call Accepted
document.getElementById("accept_vcall").addEventListener("click", function(){
        document.body.classList.remove("active-receiver-dialog");
        socket.emit("join-room", room_id2[0] , peerId[0], callerId[0]);
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

            document.getElementById("end_call").addEventListener("click", function(){
                videoCallStatus.unshift(false);;
                stream.getTracks().forEach(function(track) {
                    track.stop();
                    myVideo.remove();
                    document.getElementById("middle_pos_One").innerHTML = null;
                    findRoomId();
                });
            })   
        });     
});

//Video Interface Control
myPeer.on("call", call => {
    call.answer(calleeStream[0]);
    const video = document.createElement("video");
    call.on("stream", userVideoStream => {
        belowVideoStream(video, userVideoStream);
    })
    call.on("close", () => {
        video.remove();
        console.log("callee close");
    });
    if(videoCallStatus[0]===true){
        document.getElementById("end_call").addEventListener("click", function(){
            window.history.pushState('/video/'+room_id1[0], ",", "/dashboard");
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
    })
});
socket.on("user-connected", userId => {
    console.log(callerStream[0],"connect to new user working , user connected");
    connectToNewUser(userId, callerStream[0]);
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
    if (peers[userId]) peers[userId].close();
    window.history.pushState('/video/'+room_id2[0], ",", " /dashboard");
});

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
            <span>${body.message}</span><br>
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
            console.log(userData,"user Data");
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
}

//Auto-save to user's database
socket.on("message", userID1 => {
    connectedUser.unshift(userID1);

    console.log(userID1, "Welcome to SOuLLEY");

    if(userData[0]!=undefined){
        console.log(userData[0], "ready to connect");
        autoUpdateSocket(userID1)
    }else{
        return console.log("empty userData");
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
        fetch('/send/sms', {
            method: 'post',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({number: number, text: text, auth_token: auth_to, auth_sid: TWILIO_SID})
        }
        ).then(function(res){
            console.log(res, "sent result")
            if(res.status === 500){
                console.log(err, "error twilio");
                alert("Check Receiver's Number");
            }else{
                console.log(res.status, "sent successfully")
                alert("Text Message Sent Successfully: " + number );
                document.getElementById("number").value = "";
                document.getElementById("msg").value = "";
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
            console.log(userID,"hey hey 2");
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
        console.log(data,"sending to another user id");
        // console.log(userData[0]._id,"sender id to another user id")
        getPersonalChat(data);
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
            document.getElementById("send_chat").addEventListener("click",() =>{
            chatContent = document.getElementById("chat_content");
                sendChatAPI(chatContent);
                // false
            });
            return res.json();
    }).then(function(data){
        console.log(data, "query result 1");
        console.log(data.message_2, "query result");

            for(message of data.message_2){
                // console.log(message.user_id[0],"chandun here", userID[0])
                if(message.user_id[0]===userID[0]){
                let x = `
                        <p id="user_style" class="user_message">
                        <span class="user_mess">${message.message}</span><br>
                            </p>

                    `
                    // document.getElementsById(user_style).classList.add("user_message");
                inputTest.innerHTML = inputTest.innerHTML + x;
                }else{
                    let x = `
                        <p id="user_style" class="card_body">
                            <span>${message.message}</span><br>
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
        console.log(res.body, "video call get");                 
        return res.json();
    })
    .then(function(data){
        console.log(data.roomId, "video call new room id");
        room_id1.unshift(data.roomId);
    })
    .catch(err => {
        console.log(err);
    })
};
findRoomId();

//Video Call Input function
callInput.addEventListener("input", (req, res)=>{
        if(req.target.value!=""){
            if(videoCallStatus[0]===true){
                console.log("close previous session to start new call");
                alert("close previous sessioin to start new video call");
            }else{
                document.body.classList.add("active-dialog");
                callSomeone.innerHTML = "Calling "+ req.target.value + "...";
                calleeInfo4Socket.unshift(req.target.value)
                console.log(videoBody, "video body data information")
    
                socket.emit("video_call_invite", req.target.value, userData[0].username, room_id1[0], connectedUser);
                console.log(room_id1[0], "chandun roomid 1 here");  
                window.history.pushState("/dashboard","",'/video/'+room_id1[0]);
    
    //Video Call Start
                let videoTrack = 
                navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
                videoTrack.then(stream => {
                    addVideoStream(myVideo,stream);
                    videoCallStatus.unshift(true);
                    console.log()
                    callerStream.unshift(stream);
                    console.log(callerStream[0], "callerstream created");
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
                    document.getElementById("end_call").addEventListener("click", function(){
                        videoCallStatus.unshift(false);
                        stream.getTracks().forEach(function(track) {
                            track.stop();
                            myVideo.remove();
                            document.getElementById("middle_pos_One").innerHTML = null;
                            findRoomId();

                        });
                    })   
                });
            }
           
        }else{
            return false
        }
});  

//Search Dropdown 
async function getAllUser(){
    await fetch("/user")
    .then(function(res){
        return res.json();
    }).then(function(data){
        for(let user of data){
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
function connectToNewUser(userId, callerStreamOne){
    const call = myPeer.call(userId, callerStreamOne)
    const video = document.createElement('video')
    call.on("stream", userVideoStream => {
        belowVideoStream(video, userVideoStream)
    });
    document.getElementById("end_call").addEventListener("click", function(){
        window.history.pushState('/video/'+room_id1[0], ",", "/dashboard");
        console.log("caller side end call");
        call.close();
        socket.emit("close_callee_videoBelow", calleeInfo4Socket[0], connectedUser);
    });
    socket.on("close_caller_videoBelow", () =>{
        console.log("close_caller_videoBelow");
        call.close();
    });   
    call.on("close", () => {
        video.remove();
        console.log("caller close");

    })
    call.on("error",() =>{
        console.log("data connection detected, code in caller side");
    })
};