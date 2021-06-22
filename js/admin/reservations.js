db.collection("reservations").orderBy("date_of_reservation", "desc").onSnapshot((querySnapshot) => {
    setupReservations(querySnapshot);
});

const reservationsList = document.querySelector('.table-reservations-body');

var arrIds = [];

let toPrint = ""

const setupReservations = (data) => {
    let html = '';
    var index = 0;
    toPrint = ""
    data.forEach((doc) => {
        const data = doc.data();
        var id = doc.id;
        console.log(data);
        var bid = data.bid;
        arrIds.push(bid);
        var fullname = data.fullname ?? "No Data Found";
        var businessName = data.business_name ?? "No Data Found";
        var noOfGuests = data.no_of_guests ?? "No Data Found";
        var menu = data.type ?? "No Data Found";
        var timestamp = data.timestamp ?? "No Data Found";
        var date_of_reservation = data.date_of_reservation ?? "No Data Found";
        var options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        var dateOfEvent = (timestamp == "No Data Found") ? timestamp : timestamp.toDate().toLocaleDateString('en-US', options);
        var eventTime = (timestamp == "No Data Found") ? timestamp : timestamp.toDate().toLocaleTimeString();
        var dateCreated = (date_of_reservation == "No Data Found") ? date_of_reservation : date_of_reservation.toDate().toLocaleDateString('en-US', options);
        let start_time = data.start_time ?? "No Data Found";
        let eventStartTime = (start_time == "No Data Found") ? start_time : formatAMPM(start_time.toDate());
        let end_time = data.end_time ?? "No Data Found"
        let eventEndTime = (end_time == "No Data Found") ? end_time : formatAMPM(end_time.toDate())
        let time_preset = data.time_preset ?? "No Data Found"
        var status = (data.status != undefined) ? data.status : "No Data Found";

        let tbody = `
            <tr id="${id}">
                <td>${fullname}</td>
                <td>${businessName} </td>
                <td>${noOfGuests}</td>
                <td>${menu}</td>
                <td>${dateOfEvent}</td>
        `

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
                <td>${dateCreated}</td>
                <td><span class="status ${status.toLowerCase()}">${status}</span></td>
            </tr>
        `

        toPrint += tbody;

        html += tbody;
        index++;
    });
    reservationsList.innerHTML = html;

    console.log(arrIds);
}

function editReservations(index) {
    console.log("editing " + arrIds[index]);
}

function deleteReservations(index) {
    console.log("deleting " + index);
    db.collection("reservations").doc(index).delete().then(() => {
        console.log("Document successfully deleted!");
    }).catch((error) => {
        console.error("Error removing document: ", error);
    });
}

function searchReservations(textInput) {
    db.collection("reservations").where("business_name", "==", textInput)
        .get()
        .then((querySnapshot) => {
            setupReservations(querySnapshot);
        });
}

function showAll() {
    db.collection("reservations").orderBy("date_of_reservation").onSnapshot((querySnapshot) => {
        setupReservations(querySnapshot);
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
        db.collection("reservations")
            .where('timestamp', '>=', newDate.start)
            .where('timestamp', '<=', newDate.end)
            .orderBy("timestamp", "desc")
            .onSnapshot((querySnapshot) => {
                setupReservations(querySnapshot);
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
        db.collection("reservations")
            .where('timestamp', '>=', newDate.start)
            .where('timestamp', '<=', newDate.end)
            .orderBy("timestamp", "desc")
            .onSnapshot((querySnapshot) => {
                setupReservations(querySnapshot);
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

const changeFunc = () => {
    const statusDropDown = document.getElementById("status_drop_down")
    const filteredStatus = statusDropDown.value
    console.log(filteredStatus)
    switch (filteredStatus) {
        case "All":
            db.collection("reservations")
                .orderBy("date_of_reservation", "desc")
                .onSnapshot((querySnapshot) => {
                    setupReservations(querySnapshot);
                });
            break;
        case "Pending":
            db.collection("reservations")
                .where("status", "==", "Pending")
                .orderBy("date_of_reservation", "desc")
                .onSnapshot((querySnapshot) => {
                    setupReservations(querySnapshot);
                });
            break;
        case "Confirmed":
            db.collection("reservations")
                .where("status", "==", "Confirmed")
                .orderBy("date_of_reservation", "desc")
                .onSnapshot((querySnapshot) => {
                    setupReservations(querySnapshot);
                });
            break;
        case "Declined":
            db.collection("reservations")
                .where("status", "==", "Declined")
                .orderBy("date_of_reservation", "desc")
                .onSnapshot((querySnapshot) => {
                    setupReservations(querySnapshot);
                });
            break;
        case "Done":
            db.collection("reservations")
                .where("status", "==", "Done")
                .orderBy("date_of_reservation", "desc")
                .onSnapshot((querySnapshot) => {
                    setupReservations(querySnapshot);
                });
            break;
        case "Done & Reviewed":
            db.collection("reservations")
                .where("status", "==", "Done & Reviewed")
                .orderBy("date_of_reservation", "desc")
                .onSnapshot((querySnapshot) => {
                    setupReservations(querySnapshot);
                });
            break;
        case "Cancelled":
            db.collection("reservations")
                .where("status", "==", "Cancelled")
                .orderBy("date_of_reservation", "desc")
                .onSnapshot((querySnapshot) => {
                    setupReservations(querySnapshot);
                });
            break;
    }
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
            <title>Oh-Kasyon Reservations</title>
            ${style}
        </head>
        <body>
            <table class="table-transactions">
            <thead>
                <tr>
                    <td>Reserved By</td>
                    <td>Business Name</td>
                    <td>No. Of Guests</td>
                    <td>Menu</td>
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
