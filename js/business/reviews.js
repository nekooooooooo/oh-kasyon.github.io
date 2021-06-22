const cards = document.querySelector('.reviews-cards');

document.body.style.backgroundImage = `url("${localStorage.getItem("background_url")}")`;
console.log(localStorage.getItem("background_url"))

let bid = localStorage.getItem('bid');

console.log(bid);

db.collection("businesses").doc(bid).collection("reviews")
    .orderBy("date_of_review", "desc")
    .onSnapshot((querySnapshot) => {
        setupReviews(querySnapshot);
    });

const setupReviews = (querySnapshot) => {
    if (!querySnapshot.empty) {
        let html = '';
        querySnapshot.forEach((doc) => {
            let data = doc.data();
            console.log(data);
            let options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            let uid = data.uid;
            let review = data.review;
            let rating = data.rating;
            let date_of_review = data.date_of_review;
            let convertedTimestamp = (date_of_review == "No Data Found") ? date_of_review : date_of_review.toDate().toLocaleTimeString('en-US', options);
            db.collection("users").doc(uid)
                .get()
                .then((userDoc) => {
                    if(userDoc.exists) {
                        console.log(userDoc.id);
                        let userData = userDoc.data();
                        let first_name = userData.first_name ?? "No Data Found";
                        let middle_name = userData.middle_name ?? "";
                        let last_name = userData.last_name ?? "No Data Found";
                        let fullname = middle_name != "" ? first_name + " " + middle_name + " " + last_name : first_name + " " + last_name;
                        let photoUrl = userData.photoUrl;
                        let card = `
                            <div class="card" id="${doc.id}">
                                <div class="user">
                                    <ul>
                                        <li><img src="${photoUrl}"></li>
                                        <li>${fullname}</li>
                                    </ul>
                                </div>
                                <div class="divider"></div>
                                <div class="review">${review}</div>
                                <div class="rating-bar">
                        `
                        for(var i = 1; i <= rating; i++) {
                            card += `<span class="fa fa-star checked"></span>`;
                        }
                        for(var j = 1; j <= 5 - rating; j++) {
                            card += `<span class="fa fa-star"></span>`;
                        }
                        card += `
                            </div>
                                <div class="date">${convertedTimestamp}</div>
                            </div>
                        `;
                        html += card;
                    } else {
                        console.log("No such document!");
                    }
                    cards.innerHTML = html;
                }).catch((error) => {
                    console.log("Error getting document:", error);
                });
        });
    } else {
        cards.innerHTML = "<h1>No Reviews Found!</h1>";
    }
}

let today = firebase.firestore.Timestamp.fromDate(new Date());

function acceptRequest(id) {
    db.collection("reservations").doc(id).update({
        "status": "Confirmed",
        "date_accepted": today
    })
    .then(() => {
        alert("Reservation Accepted! Press OK to reload...");
        console.log("Reservation Accepted Succesfully!");
        location.reload();
    });
}

function declineRequest(id) {
    db.collection("reservations").doc(id).update({
        "status": "Declined",
        "date_accepted": today
    })
    .then(() => {
        alert("Reservation Declined! Press OK to reload...");
        console.log("Reservation Declined Succesfully!");
        location.reload();
    });
}