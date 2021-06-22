const cards = document.querySelector('.cards');
document.body.style.backgroundImage = `url("${localStorage.getItem("background_url")}")`;
console.log(localStorage.getItem("background_url"))

let bid = localStorage.getItem('bid');
console.log(bid);
const transactionsList = document.querySelector('.table-transactions-body');
const reservationRef = db.collection("reservations")
let toPrint = ""

$('input[name="daterange"]').val('06/01/2021 - 06/15/2021')

reservationRef
    .where("bid", "==", bid)
    .where("status", "in", ["Done", "Done & Reviewed", "Cancelled", "Declined", "Confirmed"])
    .orderBy("date_of_reservation", "desc")
    .onSnapshot((querySnapshot) => {
        setupTransactions(querySnapshot);
    });

const setupTransactions = (querySnapshot) => {

    if(querySnapshot.empty) {
        transactionsList.innerHTML = "<h1>No Transactions Found!</h1>"
        return
    }

    toPrint = ""

    let html = '';
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(data);
        let id = doc.id;
        let bid = data.bid;
        let uid = data.uid;
        let options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        let fullname = data.fullname ?? "No Data Found";
        let noOfGuests = data.no_of_guests ?? "No Data Found";
        let menu = data.menu ?? "No Data Found";
        let type = data.type ?? "No Data Found";
        let theme = data.theme ?? "No Data Found"
        let timestamp = data.timestamp ?? "No Data Found";
        let date_of_reservation = data.date_of_reservation ?? "No Data Found";
        let date_accepted = data.date_accepted ?? "Not Yet Accepted";
        let convertedDateAccepted = (date_accepted == "Not Yet Accepted") ? date_accepted : date_accepted.toDate().toLocaleTimeString('en-US', options);
        let dateOfEvent = timestamp.toDate().toLocaleDateString('en-US', options);
        let eventTime = timestamp.toDate().toLocaleTimeString();
        let dateCreated = date_of_reservation.toDate().toLocaleDateString('en-US', options);
        let start_time = data.start_time ?? "No Data Found";
        let eventStartTime = (start_time == "No Data Found") ? start_time : formatAMPM(start_time.toDate());
        let end_time = data.end_time ?? "No Data Found"
        let eventEndTime = (end_time == "No Data Found") ? end_time : formatAMPM(end_time.toDate())
        let cancellationReason = data.cancellation_reason ?? ""
        let declinationReason = data.declination_reason ?? ""
        let time_preset = data.time_preset ?? "No Data Found"

        let status = (data.status != undefined) ? data.status : "No Data Found";

        let tbody = `
            <tr id="${id}">
                <td class="user" id="${uid}">${fullname}</td>
                <td>${noOfGuests}</td>
                <td>${menu}</td>
                <td>${type}</td>
                <td>${theme}</td>
                <td>${dateOfEvent}</td>
            `;

        switch(time_preset) {
            case "Whole Day": case "Half Day: AM": case "Half Day: PM": case "No Data Found":
                tbody += `
                    <td colspan="2">${time_preset}</td>
                `
                break;
            default:
                tbody += `
                    <td>${eventStartTime}</td>
                    <td>${eventEndTime}</td>
                `
        }

        tbody += `
            <td>${convertedDateAccepted}</td>
            <td><span class="status ${status.toLowerCase()}">${status}</span></td>
        `

        toPrint += tbody

        if(cancellationReason != "") {
            tbody += `
                <td><a href="#" class="update" onclick="viewCancelReason('${id}')">View</a></td>
            `
        } else if(declinationReason != ""){
            tbody += `
                <td><a href="#" class="update" onclick="viewDeclineReason('${id}')">View</a></td>
            `
        } else {
            tbody += `
                <td>Not Cancelled</td>
            `
        }

        switch(status) {
            case "Done": case "Done & Reviewed": case "Cancelled": case "Declined":
                tbody += `
                    <td>
                        <a href="#" class="report ${uid}" onclick="console.log('Report: ' + $(this).attr('class').split(' ')[1])">Report</a>
                    </td>
                `
                break;
            default:
                tbody += `
                    <td>
                        <a href="#" class="update" onclick="markAsDone($(this).closest('tr').attr('id'))">Done</a>
                        <a href="#" class="report ${uid}" onclick="console.log('Report: ' + $(this).attr('class').split(' ')[1])">Report</a>
                    </td>
                `
        }
        tbody += `</tr>`
        html += tbody;
    });
    transactionsList.innerHTML = html;
    
}

const viewCancelReason = async(id) => {
    const reason = await getCancelReason(id)

    Swal.fire({
        title: 'Reason for Cancellation',
        text: reason
    })
}

const getCancelReason = async(id) => {
    return new Promise((resolve, reject) => {
        reservationRef.doc(id).get()
        .then((reservationDoc) => {
            const reservationData = reservationDoc.data()
            resolve(reservationData.cancellation_reason)
        })
    })
}

const viewDeclineReason = async(id) => {
    const reason = await getDeclineReason(id)

    Swal.fire({
        title: 'Reason for Declination',
        text: reason
    })
}

const getDeclineReason = async(id) => {
    return new Promise((resolve, reject) => {
        reservationRef.doc(id).get()
        .then((reservationDoc) => {
            const reservationData = reservationDoc.data()
            resolve(reservationData.declination_reason)
        })
    })
}

function markAsDone(id) {
    Swal.fire({
        icon: 'warning',
        title: 'One sec...',
        text: 'Are you sure you want to mark this Transaction as Done?',
        showCancelButton: true,
        confirmButtonText: 'Mark as Done'
    }).then((result) => {
        if (result.isConfirmed) {
            reservationRef.doc(id).update({
                "status": "Done"
            })
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Transaction Updated!'
                })
                console.log("Reservation Updated Succesfully!");
            })
            .catch((error) => {
                // The document probably doesn't exist.
                Swal.fire({
                    icon: 'error',
                    title: 'An Error has occured!',
                    text: `Error updating document: ${error}`
                })
                console.error("Error updating document: ", error);
            });
        }
    })
}

function searchTransactions(textInput) {

    if(textInput == "") {
        return
    }

    reservationRef
        .where("bid", "==", bid)
        .where("fullname", "==", textInput)
        .where("status", "in", ["Done", "Done & Reviewed", "Cancelled", "Declined", "Confirmed"])
        .get()
        .then((querySnapshot) => {
            setupTransactions(querySnapshot);
        });
}

function showAll() {
    reservationRef.where("bid", "==", bid)
        .where("status", "in", ["Done", "Done & Reviewed", "Cancelled", "Declined", "Confirmed"])
        .orderBy("date_of_reservation", "desc")
        .onSnapshot((querySnapshot) => {
            setupTransactions(querySnapshot);
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
        reservationRef
            .where("bid", "==", bid)
            .where("status", "in", ["Done", "Done & Reviewed", "Cancelled", "Declined", "Confirmed"])
            .where('timestamp', '>=', newDate.start)
            .where('timestamp', '<=', newDate.end)
            .orderBy("timestamp", "desc")
            .onSnapshot((querySnapshot) => {
                setupTransactions(querySnapshot);
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
        reservationRef
            .where("bid", "==", bid)
            .where("status", "in", ["Done", "Done & Reviewed", "Cancelled", "Declined", "Confirmed"])
            .where('timestamp', '>=', newDate.start)
            .where('timestamp', '<=', newDate.end)
            .orderBy("timestamp", "desc")
            .onSnapshot((querySnapshot) => {
                setupTransactions(querySnapshot);
            });
    });
});

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
        }
    </style>`

    var win = window.open('', '');

    win.document.write(`
    <html>
        <head>
            <title>Oh-Kasyon ${business_name} Transactions</title>
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
                    <td>Date of Event</td>
                    <td>Event Start Time</td>
                    <td>Event End Time</td>
                    <td>Date Accepted</td>
                    <td>Status</td>
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

const changeFunc = () => {
    const statusDropDown = document.getElementById("status_drop_down")
    const filteredStatus = statusDropDown.value
    console.log(filteredStatus)
    switch (filteredStatus) {
        case "All":
            reservationRef
                .where("bid", "==", bid)
                .where("status", "in", ["Done", "Done & Reviewed", "Cancelled", "Declined", "Confirmed"])
                .orderBy("date_of_reservation", "desc")
                .onSnapshot((querySnapshot) => {
                    setupTransactions(querySnapshot);
                });
            break;
        case "Confirmed":
            reservationRef
                .where("bid", "==", bid)
                .where("status", "==", "Confirmed")
                .orderBy("date_of_reservation", "desc")
                .onSnapshot((querySnapshot) => {
                    setupTransactions(querySnapshot);
                });
            break;
        case "Declined":
            reservationRef
                .where("bid", "==", bid)
                .where("status", "==", "Declined")
                .orderBy("date_of_reservation", "desc")
                .onSnapshot((querySnapshot) => {
                    setupTransactions(querySnapshot);
                });
            break;
        case "Done":
            reservationRef
                .where("bid", "==", bid)
                .where("status", "==", "Done")
                .orderBy("date_of_reservation", "desc")
                .onSnapshot((querySnapshot) => {
                    setupTransactions(querySnapshot);
                });
            break;
        case "Done & Reviewed":
            reservationRef
                .where("bid", "==", bid)
                .where("status", "==", "Done & Reviewed")
                .orderBy("date_of_reservation", "desc")
                .onSnapshot((querySnapshot) => {
                    setupTransactions(querySnapshot);
                });
            break;
        case "Cancelled":
            reservationRef
                .where("bid", "==", bid)
                .where("status", "==", "Cancelled")
                .orderBy("date_of_reservation", "desc")
                .onSnapshot((querySnapshot) => {
                    setupTransactions(querySnapshot);
                });
            break;
    }
}
