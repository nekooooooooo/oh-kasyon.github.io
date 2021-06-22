document.body.style.backgroundImage = `url("${localStorage.getItem("background_url")}")`;

const messages = document.querySelector('.messages');
const client = document.querySelector('.client');

let bid = localStorage.getItem('bid');
let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let id = urlParams.get("id");
const loader = document.querySelector('.loader');
const send_btn = document.getElementById('send_btn');

let testImage = "https://firebasestorage.googleapis.com/v0/b/oh-kasyon.appspot.com/o/pics%2F5sGMPf3sFZRmlD8uLL1DKIxaQBJ3-null?alt=media&token=f9d7e745-f1dd-4029-aa96-6cd5d2eb649a"

let business_account_id;
let user_id;

db.collection("chats").doc(id)
    .update({
        status: "seen"
    })
    .then(() => {
        console.log("Seen!");
    })
    .catch((error) => {
        console.error("Error updating document: ", error);
    });
    console.log(id);

console.log(id);
db.collection("chats").doc(id).collection("messages")
    .orderBy("date_sent", "desc")
    .limit(20)
    .onSnapshot((querySnapshot) => {
        loader.style.display = "none";
        getMessages(querySnapshot);
    });

db.collection("chats").doc(id)
    .get()
    .then((doc) => {
        if (doc.exists) {
            let data = doc.data();
            console.log("Document data:", data);
            business_account_id = data.business_account_id;
            user_id = data.user_id;
            let html = "";
            db.collection("users").doc(user_id)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        let data = doc.data();
                        console.log("Document data:", data);
                        let first_name = data.first_name ?? "No Data Found";
                        let middle_name = data.middle_name ?? "";
                        let last_name = data.last_name ?? "No Data Found";
                        let full_name = middle_name != "" ? first_name + " " + middle_name + " " + last_name : first_name + " " + last_name;
                        let photoUrl = data.photoUrl ?? "";
                        const clientDetail = `
                            <img src="${photoUrl}"/>
                                <div class="client-info">
                                    <h2>${full_name}</h2>
                                </div>
                        `;
                        html = clientDetail;
                    } else {
                        console.log("No such document!");
                    }
                    client.innerHTML = html;
                }).catch((error) => {
                    console.log("Error getting document:", error);
                });
        } else {
            console.log("No such document!");
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });

const getMessages = (querySnapshot) => {
    messages.classList.add("reversed");
    var objDiv = document.getElementById("messages");
    console.log(objDiv);
    //objDiv.scrollTop = objDiv.scrollHeight;
    let html = ``;
    lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
    console.log("last", lastVisible);
    querySnapshot.forEach((doc) => {
        let data = doc.data();
        let date_sent = data.date_sent ?? "No Data Found";
        let convertedDateSent = (date_sent == "No Data Found") ? date_sent : date_sent.toDate().toLocaleTimeString('en-US');
        let message = data.message ?? "No Data Found";
        let receiver = data.receiver ?? "No Data Found";
        let sender = data.sender ?? "No Data Found";
        let messages = ``;
        if(sender == uid) {
            messages = `
                <div class="message sent">
                    ${message}
                    <div class="date_sent">${convertedDateSent}</div>
                </div>
                `;
            
        } else {
            messages = `
                <div class="message received">
                    ${message}
                    <div class="date_sent">${convertedDateSent}</div>
                </div>
                `;
        }
        html += messages;
    });
    html += `
    <div class="message">
    </div>`
    messages.innerHTML = html;
}

const messageInput = document.getElementById('message');

send_btn.onclick = function() {
    let message = messageInput.value;

    if(message == ""){
        return console.log("message not sent, input is empty")
    }

    messageInput.value = "";
    sendMessage(id, message);
}

messageInput.addEventListener("keyup", function(event) {
    if (event.defaultPrevented) {
        return; // Do nothing if event already handled
    }

    //console.log(`KEY: ${event.key} CODE: ${event.code}`);

    switch(event.code) {
        case "Enter":
            console.log("Pressed Enter");
            send_btn.click();
            break;
    }
    
    event.preventDefault();
  }, true);

const sendMessage = (id, message) => {
    let today = firebase.firestore.Timestamp.fromDate(new Date());

    message.trim();

    if(isEmpty(message))
        return console.log("Message is empty");

    db.collection("chats").doc(id).collection("messages").add({
        receiver: user_id,
        sender: business_account_id,
        message: message,
        date_sent: today,
    })
    .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
        db.collection("chats").doc(id).update({
            last_message: today,
            last_message_sent: message
        })
        .then(() => {
            console.log("Message Sent!");
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        });
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
    });
}

const isEmpty = str => !str.trim().length;