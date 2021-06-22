const cards = document.querySelector('.cards');
const tbody = document.querySelector('.table-requests-body')

document.body.style.backgroundImage = `url("${localStorage.getItem("background_url")}")`;

let bid = localStorage.getItem('bid');

let toPrint

console.log(bid);

const reservationsRef = db.collection("reservations")

reservationsRef
    .where("bid", "==", bid)
    .where("status", "in", ["Pending"])
    .orderBy("date_of_reservation", "desc")
    .onSnapshot((querySnapshot) => {
        setupRequests(querySnapshot);
    });

let values

const setupRequests = (querySnapshot) => {
    toPrint = ""
    if (!querySnapshot.empty) {
        let html = '';
        querySnapshot.forEach((doc) => {
            let data = doc.data();
            let options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };

            let fullname = data.fullname ?? "No Data Found";
            let noOfGuests = data.no_of_guests ?? "No Data Found";
            let menu = data.menu ?? "No Data Found";
            let type = data.type ?? "No Data Found";
            let theme = data.theme ?? "No Data Found";
            let status = data.status ?? "No Data Found";
            let timestamp = data.timestamp ?? "No Data Found";
            let dateOfEvent = timestamp.toDate().toLocaleDateString('en-US', options);
            let convertedTimestamp = (timestamp == "No Data Found") ? timestamp : timestamp.toDate().toLocaleTimeString('en-US', options);
            let date_of_reservation = data.date_of_reservation ?? "No Data Found";
            let convertedDate = date_of_reservation.toDate().toLocaleDateString('en-US', options);
            let eventDate = timestamp.toDate().toLocaleDateString('en-US', options);
            let start_time = data.start_time ?? "No Data Found";
            let eventStartTime = (start_time == "No Data Found") ? start_time : formatAMPM(start_time.toDate());
            let end_time = data.end_time ?? "No Data Found"
            let eventEndTime = (end_time == "No Data Found") ? end_time : formatAMPM(end_time.toDate())
            let user_id = data.uid ?? "No Data Found";
            let time_preset = data.time_preset ?? "No Data Found"

            values = {
                type: type,
                dateOfEvent: dateOfEvent
            }
            let td = `
                <tr id="${doc.id}">
                <td class="user" id="${user_id}">${fullname}</td>
                <td>${noOfGuests}</td>
                <td>${menu}</td>
                <td>${type}</td>
                <td>${theme}</td>
                <td>${convertedDate}</td>
                <td>${eventDate}</td>
            `

            switch(time_preset) {
                case "Whole Day": case "Half Day: AM": case "Half Day: PM": case "No Data Found":
                    td += `
                        <td colspan="2">${time_preset}</td>
                    `
                    break;
                default:
                    td += `
                        <td>${eventStartTime}</td>
                        <td>${eventEndTime}</td>
                    `
            }

            toPrint += td

            td += `
                <td><span class="status ${status.toLowerCase()}">${status}</span></td>
                <td>
                    <a href="#" class="accept" onclick="acceptRequest('${doc.id}', '${user_id}');">Accept</a>
                    <a href="#" class="decline" onclick="declineRequest('${doc.id}', '${user_id}');">Decline</a>
                </td>
            `
            html += td;
            console.log(data);
        });
        tbody.innerHTML = html;
    } else {
        tbody.innerHTML = "<h1>No Reservations Requests Found!</h1>"
    }
}

const acceptRequestContent = document.querySelector("#accept-request-content");

function acceptRequest(reservationId, userId) {
    Swal.fire({
        icon: 'warning',
        title: 'One sec...',
        text: 'Are you sure you want to Accept this Reservation Request?',
        showCancelButton: true,
        confirmButtonText: 'Accept'
    }).then((result) => {
        if (result.isConfirmed) {
            console.log(reservationId, userId);
            const today = firebase.firestore.Timestamp.fromDate(new Date());
            // const message = `Your reservation: ${reservationId} has been accepted!`;
            const message = `Your reservation on ${values.dateOfEvent} with the Event Type of ${values.type} has been accepted`;
            db.collection("chats")
                .where("business_account_id", "==", uid)
                .where("user_id", "==", userId)
                .get()
                .then((querySnapshot) => {
                    if (!querySnapshot.empty) {
                        querySnapshot.forEach((chatsDoc) => {
                            db.collection("reservations").doc(reservationId).update({
                                    "status": "Confirmed",
                                    "date_accepted": today
                                })
                                .then(() => {
                                    //alert("Reservation Accepted! Press OK to reload...");
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Success',
                                        text: 'Reservation Accepted!'
                                    })
                                    sendMessage(chatsDoc.id, chatsDoc.data().business_account_id, chatsDoc.data().user_id, message);
                                    console.log("Reservation Accepted Succesfully!");
                                })
                                .catch((reservationsUpdateError) => {
                                    console.error("Error updating reservations: ", reservationsUpdateError);
                                });
                        })
                    } else {
                        db.collection("reservations").doc(reservationId).update({
                                "status": "Confirmed",
                                "date_accepted": today
                            })
                            .then(() => {
                                const chatsRef = db.collection("chats");
                                const chatsData = {
                                    bid: bid,
                                    business_account_id: uid,
                                    last_message: today,
                                    last_message_sent: message,
                                    stats: "unseen",
                                    user_id: userId
                                }
                                chatsRef.add(chatsData)
                                    .then((docRef) => {
                                        Swal.fire({
                                            icon: 'success',
                                            title: 'Success',
                                            text: 'Reservation Accepted!'
                                        })
                                        //alert("Reservation Declined! Press OK to reload...");
                                        sendMessage(docRef.id, uid, userId, message);
                                        //console.log("Reservation Accepted Succesfully!");
                                    })
                                    .catch((chatsAddError) => {
                                        console.error("Error creating chats: ", chatsAddError);
                                    });
                            })
                            .catch((reservationsUpdateError) => {
                                console.error("Error updating reservations: ", reservationsUpdateError);
                            });
                    }
                });
        }
    })
}
//     if(confirm("Are you sure you want to ACCEPT this REQUEST?")){
        
//     }
// }

const getReason = async () => {
    const { value: reason } = await Swal.fire({
        title: 'Enter Reason for Declination',
        input: 'textarea',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return "Reason can't be empty!"
            }
        }
    })

    return new Promise((resolve, reject) => {
        if(reason) {
            resolve(reason.trim())
        }
    })
}

async function declineRequest(reservationId, userId) {

    const reason = await getReason()

    Swal.fire({
        icon: 'warning',
        title: 'One sec...',
        text: 'Are you sure you want to Decline this Reservation Request?',
        showCancelButton: true,
        confirmButtonText: 'Decline Request'
    }).then((result) => {
        if (result.isConfirmed) {
            console.log(reservationId, userId);
            const today = firebase.firestore.Timestamp.fromDate(new Date());
            // const message = `Your reservation: ${reservationId} has been declined!\\n
            const message = `Your reservation on ${values.dateOfEvent} with the Event Type of ${values.type} has been declined. Reason: ${reason}`;
            db.collection("chats")
                .where("business_account_id", "==", uid)
                .where("user_id", "==", userId)
                .get()
                .then((querySnapshot) => {
                    if (!querySnapshot.empty) {
                        querySnapshot.forEach((chatsDoc) => {
                            db.collection("reservations").doc(reservationId).update({
                                    "status": "Declined",
                                    "declination_reason": reason,
                                    "date_accepted": today
                                })
                                .then(() => {
                                    //alert("Reservation Declined! Press OK to reload...");
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Success!',
                                        text: 'Reservation Declined!'
                                    })
                                    sendMessage(chatsDoc.id, chatsDoc.data().business_account_id, chatsDoc.data().user_id, message);
                                    console.log("Reservation Declined Succesfully!");
                                })
                                .catch((reservationsUpdateError) => {
                                    console.error("Error updating reservations: ", reservationsUpdateError);
                                });
                        })
                    } else {
                        db.collection("reservations").doc(reservationId).update({
                                "status": "Declined",
                                "date_accepted": today
                            })
                            .then(() => {
                                const chatsRef = db.collection("chats");
                                const chatsData = {
                                    bid: bid,
                                    business_account_id: uid,
                                    last_message: today,
                                    last_message_sent: message,
                                    stats: "unseen",
                                    user_id: userId
                                }
                                chatsRef.add(chatsData)
                                    .then((docRef) => {
                                        //alert("Reservation Declined! Press OK to reload...");
                                        Swal.fire({
                                            icon: 'success',
                                            title: 'Success!',
                                            text: 'Reservation Declined!'
                                        })
                                        sendMessage(docRef.id, uid, userId, message);
                                        console.log("Reservation Declined Succesfully!");
                                    })
                                    .catch((chatsAddError) => {
                                        console.error("Error creating chats: ", chatsAddError);
                                    });
                            })
                            .catch((reservationsUpdateError) => {
                                console.error("Error updating reservations: ", reservationsUpdateError);
                            });
                    }
                });
        }
    })
}

const sendMessage = (id, business_account_id, user_id, message) => {
    const today = firebase.firestore.Timestamp.fromDate(new Date());

    const messagesRef = db.collection("chats").doc(id).collection("messages");
    messagesRef.add({
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
        .catch((chatsUpdateError) => {
            console.error("Error updating chats: ", chatsUpdateError);
        });
    })
    .catch((messagesAddError) => {
        console.error("Error adding message: ", messagesAddError);
    });
}


$(function () {
    $('input[name="daterange"]').daterangepicker({
        opens: 'left'
    }, function (start, end, label) {
        console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
        let newDate = {
            start: new Date(start.format('YYYY-MM-DD')),
            end: new Date(end.format('YYYY-MM-DD'))
        }
        newDate.start.setHours(0, 0, 0, 0)
        newDate.end.setHours(24, 0, 0, 0)
        console.table(newDate)
        reservationsRef
            .where("bid", "==", bid)
            .where("status", "in", ["Pending"])
            .where('timestamp', '>=', newDate.start)
            .where('timestamp', '<=', newDate.end)
            .orderBy("timestamp", "desc")
            .onSnapshot((querySnapshot) => {
                setupRequests(querySnapshot);
        });
    });
});

$(function () {
    $('input[name="date"]').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        minYear: 2020,
        maxYear: parseInt(moment().format('YYYY'), 10)
    }, function (start, end, label) {
        console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
        let newDate = {
            start: new Date(start.format('YYYY-MM-DD')),
            end: new Date(end.format('YYYY-MM-DD'))
        }
        newDate.start.setHours(0, 0, 0, 0)
        newDate.end.setHours(24, 0, 0, 0)
        console.table(newDate)
        reservationsRef
            .where("bid", "==", bid)
            .where("status", "in", ["Pending"])
            .where('timestamp', '>=', newDate.start)
            .where('timestamp', '<=', newDate.end)
            .orderBy("timestamp", "desc")
            .onSnapshot((querySnapshot) => {
                setupRequests(querySnapshot);
        });
    });
});

const showAll = () => {
    reservationsRef
    .where("bid", "==", bid)
    .where("status", "in", ["Pending"])
    .orderBy("date_of_reservation", "desc")
    .onSnapshot((querySnapshot) => {
        setupRequests(querySnapshot);
    });
}

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function createPDF() {
    let business_name = localStorage.getItem('business_name')

    var style = `<style>
        body {
            margin: 0;
            padding: 0;
            font-family: Roboto;
            font-style: bold;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        
        table thead {
            font-weight: 600;
        }
        
        table tr{
            border-bottom: 1px solid rgb(0, 0, 0, 0.1);
        }
        
        table tbody tr:last-child {
            border-bottom: none;
        }
        
        table tr td {
            padding: 8px 4px;
        }
        
        thead tr td:last-child {
            text-align: center;
        }
        
        tbody tr td:last-child {
            display: grid;
            grid-template-columns: 1fr;
            text-align: center;
        }
        
        thead tr td:not(:last-child):hover {
            background: rgb(255, 136, 0);
            color: #FFFFFF;
            border-radius: 5px;
            cursor: pointer;
        }
        
        tr td:last-child {
            text-align: center;
        }
        
        tr td .status {
            color: #FFFFFF;
            font-weight: 600;
            padding: 2px 4px;
            border-radius: 5px;
        }
        
        tr td .status.pending {
            color: #ff9800;
        }
        
        tr td .status.confirmed {
            color: #2196f3;
        }
        
        tr td .status.done {
            color: #4caf50;
        }
        
        tr td .status.cancelled {
            color: #f44336;
        }
        
        tr td .status.declined {
            color: #f44336;
        }

        td[colspan="2"] {
            text-align: center;
            justify-items: center;
            align-items: center;
        }
    </style>`

    var win = window.open('', '');

    win.document.write(`
    <html>
        <head>
            <title>Oh-Kasyon ${business_name} Requests</title>
            ${style}
        </head>
        <body>
            <table class="table-transactions">
                <thead>
                    <tr>
                        <td>Reserved By</td>
                        <td>No. Of Guests</td>
                        <td>Menu</td>
                        <td>Event Type</td>
                        <td>Event Theme</td>
                        <td>Date of Reservation</td>
                        <td>Date of Event</td>
                        <td>Event Start Time</td>
                        <td>Event End Time</td>
                    </tr>
                </thead>
                <tbody class="table-transactions-body">
                    ${toPrint}
                </tbody>
            </table>
        </body>
    </html>`)

    win.document.close();

    win.print();
}


/* const setupRequests = (querySnapshot) => {
    if (!querySnapshot.empty) {
        let html = '';
        querySnapshot.forEach((doc) => {
            let data = doc.data();
            let options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            let fullname = data.fullname ?? "No Data Found";
            let noOfGuests = data.no_of_guests ?? "No Data Found";
            let menu = data.menu ?? "No Data Found";
            let type = data.type ?? "No Data Found";
            let theme = data.theme ?? "No Data Found";
            let status = data.status ?? "No Data Found";
            let timestamp = data.timestamp ?? "No Data Found";
            let dateOfEvent = timestamp.toDate().toLocaleDateString('en-US', options);
            let convertedTimestamp = (timestamp == "No Data Found") ? timestamp : timestamp.toDate().toLocaleTimeString('en-US', options);
            let date_of_reservation = data.date_of_reservation ?? "No Data Found";
            let convertedDate = date_of_reservation.toDate().toLocaleDateString('en-US', options);
            let user_id = data.uid ?? "No Data Found";
            values = {
                type: type,
                dateOfEvent: dateOfEvent
            }
            const card = `
                <div class="card" id="${doc.id}">
                    <div class="user" id="${user_id}">${fullname}</div>
                    <div class="divider"></div>
                    <div class="capacity">Capacity: ${noOfGuests}</div>
                    <div class="menu">Menu: ${menu}</div>
                    <div class="type">Type: ${type}</div>
                    <div class="theme">Theme: ${theme}</div>
                    <div class="status ${status.toLowerCase()}">Status: ${status}</div>
                    <div class="reservation_date">Date of Reservation: ${convertedDate}</div>
                    <div class="date">Date of Event: ${convertedTimestamp}</div>
                    <a href="#" class="accept" onclick="acceptRequest('${doc.id}', '${user_id}');">Accept</a>
                    <a href="#" class="decline" onclick="declineRequest('${doc.id}', '${user_id}');">Decline</a>
                </div>
            `;
            html += card;
            console.log(data);
        });
        cards.innerHTML = html;
    } else {
        cards.innerHTML = "<h1>No Reservations Requests Found!</h1>"
    }
} */
