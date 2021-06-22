document.body.style.backgroundImage = `url("${localStorage.getItem("background_url")}")`;

const messages = document.querySelector('.messages_box');
const loader = document.querySelector('.loader');

let bid = localStorage.getItem('bid');
let html2 = '';
let testImage = "https://firebasestorage.googleapis.com/v0/b/oh-kasyon.appspot.com/o/pics%2F5sGMPf3sFZRmlD8uLL1DKIxaQBJ3-null?alt=media&token=f9d7e745-f1dd-4029-aa96-6cd5d2eb649a"

sessionStorage.setItem("conversationStatus", "none");

loader.style.display = "block";
db.collection("chats").where("business_account_id", "==", uid).orderBy("last_message", "desc")
    .onSnapshot((querySnapshot) => {
        loader.style.display = "none";
        getConversations(querySnapshot);
    });

const getConversations = (querySnapshot) => {
    let html = ``
    // html = `
    //     <div class="cardHeader">
    //         <ul>
    //             <li>
    //                 <div class="btn" onclick='addConvo();'>DEBUG: ADD CONVO</div>
    //                 <div class="btn" onclick='sendMessage();'>DEBUG: SEND MESSAGE</div>
    //             </li>
    //         </ul>
    //     </div>
    // `;
    querySnapshot.forEach((doc) => {
        let status = doc.data().status ?? "No Data Found";
        let user_id = doc.data().user_id;
        let conversationId = doc.id;
        db.collection("chats").doc(doc.id).collection("messages")
            .orderBy("date_sent", "desc")
            .limit(1)
            .get()
            .then((messageSnapshot) => {
                messageSnapshot.forEach((doc) => {
                    let data = doc.data();
                    console.log(data);
                    let message = data.message ?? "No Data Found";
                    let receiver = data.receiver ?? "No Data Found";
                    let date_sent = data.date_sent ?? "No Data Found";
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
                                const card = `
                                    <div class="conversations ${status}" id="${conversationId}" onclick="openConversation($(this).attr('id'));">
                                        <ul>
                                            <li>
                                                <img class="conversation-icon" src="${photoUrl}">
                                            </li>
                                            <li class="info">
                                                <div class="receiver">${full_name}</div>
                                                <div class="latest_message">${message}</div>
                                                <div class="date_sent">${date_sent.toDate().toLocaleTimeString('en-US')}</div>
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="divider"></div>
                                `;
                                html += card;
                            } else {
                                console.log("No such document!");
                            }
                            messages.innerHTML = html;
                        }).catch((error) => {
                            console.log("Error getting document:", error);
                        });

                });
                
            });

    });

}

// function openConversation(id) {
//     db.collection("chats").doc(id).update({
//         status: "seen"
//     })
//     .then(() => {
//         console.log("Seen!");
//         sessionStorage.setItem("conversationStatus", "clicked");
//         window.location = '/business/messages.html?id=' + id;
//     })
//     .catch((error) => {
//         console.error("Error updating document: ", error);
//     });
//     console.log(id);
// }

function openConversation(id) {
    window.location = '../business/messages.html?id=' + id;
}