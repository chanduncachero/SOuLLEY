const   numberInput = document.getElementById("number"),
        textInput = document.getElementById("msg"),
        button = document.getElementById("button"),
        response = document.querySelector(".response"),
        callNumber = document.getElementById("call_number"),
        callButton = document.getElementById("call_id");

button.addEventListener("click", send, false);

 async function send(){
    const number = numberInput.value.replace(/\D/g, '');
    const text = textInput.value;
    // const text_num = JSON.stringify({number: number, text: text});
    // console.log(text_num, "as2s" );

    await fetch('/send/sms', {
        method: 'post',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({number: number, text: text})
        // body: {number: number, text: text}
    }
    ).then(res => {
        if(res.ok){
            return body
        }
    }).catch(function(error){
        console.log(error);
    });
};

callButton.addEventListener("click", call, false);
 function call(){
    const call = callNumber.value.replace(/\D/g, '');
    console.log(call, "call number")

    fetch('/call', {
        method: 'post',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({number: call})
        // body: {number: number, text: text}
    }).then(res => {
        if(res.ok){
            return body
        }
    }).catch(function(error){
        console.log(error);
    });
 }