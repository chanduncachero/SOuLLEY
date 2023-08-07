const express = require("express");
const router = express.Router();

router.get("/",(req, res) => {
    res.sendFile(path.join(__dirname+'/public/login.html'));
});
router.get("/login", (req, res) =>{
    res.sendFile(path.join(__dirname+'/public/login.html'));
});
router.get("/register", (req, res) =>{
    res.sendFile(path.join(__dirname+'/public/register.html'));
});


module.exports = router