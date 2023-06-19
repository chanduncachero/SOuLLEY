
const express = require("express");
const path = require("path");
const router = express.Router();
const bodyparser = require("body-parser");
const twilio = require("twilio");
const dotenv = require("dotenv");

dotenv.config();
const http = require("http");
const mongoose = require("mongoose");
const User = require("./models/userModels");
const { exit } = require("process");
const { error } = require("console");

const PORT = process.env.PORT || 3000; 
const app = express();
const server = http.createServer(app);

app.use(express.static(__dirname+"/public"));
app.use(express.json());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));


const url = "mongodb://127.0.0.1:27017/soulley"
mongoose.connect(url, {})
    .then(result => console.log(result))
    .catch("error");
// db.users.get(users => console.log(users, "users db"));

router.get("/",(req, res) => {
    res.sendFile(path.join(__dirname+'/public/index.html'));
});
router.get("/login", (req, res) =>{
    res.sendFile(path.join(__dirname+'/public/login.html'));
});
router.get("/register", (req, res) =>{
    res.sendFile(path.join(__dirname+'/public/register.html'));
});


// Routes API below
app.get("/user", async(req, res)=>{
    try{
        const user = await User.find({});
        res.status(200).json(user);
    } catch (error){
        console.log (error, "/user error")
    }
    // res.sendFile(__dirname + "/public/index.html");
});
app.post('/saveUser', async (req, res) => {
    try{
        const user = await User.create(req.body)
        res.status(200).json(user);
    }catch (error){
        res.status(500).json({message: error.message})
    };
    exit;
});
app.put('/user/:id', async(req, res)=>{
    try{
        const {id} = req.params;
        const user = await User.findByIdAndUpdate(id, req.body);
        if(!user){
            return res.status(404).json({message: `cannot find any product with ID ${id}`})
        }
        const updatedUser = await User.findById(id);
        res.status(200).json(updatedUser);

    } catch (error){
        res.status(500).json({message: error.message})
    }
});
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
app.post('/userLogin_test', async(req, res)=>{
    try{
        router.get("/",(req, res) => {
            res.sendFile(path.join(__dirname+'/public/index.html'));
        });
    }catch (error){
        res.status(500).json({message: error.message})
    }
});
app.post('/user/login', async (req, res)=>{
    const user_all = await User.find({});
    const user = await user_all.find(user => user.email === req.body.email);
    if(user === null ){
        return res.status(400).send('cannot find user')
    }
    try{
        if(req.body.password === user.password){
            res.send('success')
        }
        else{
            res.send( "wrong password")
        }
    } catch(error){
        res.status(500).json({message: error.message});
        console.log("No Credentials has matched")
    }
});
app.post('/call', (req, res)=>{
    try{
        const client  = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        return client.calls
        .create({url:"http://demo.twilio.com/docs/voice.xml" , from:+13609001106, to: "+" + req.body.number})
        .then(message=> console.log(message, "sent success"))
        .catch(err=> console.log(err, "text not sent" ))
    }catch (error){
        
        res.status(500).json({message: error.message});
    }
});
app.post("/send/sms", (req, res)=>{
    const client  = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    
    return client.messages
        .create({body: req.body.text, from:+13609001106, to: "+" + req.body.number})
        .then(message=> console.log(message, "sent success"))
        .catch(err=> console.log(err, "text not sent" ))
});


app.use('/', router);
server.listen(PORT);






