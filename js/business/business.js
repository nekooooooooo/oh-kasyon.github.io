if (localStorage.getItem('status') != 'loggedIn') {
    window.location.replace("../index.html");
} else {
    console.log("User already logged in");
    //show validation message
}

function logout() {
    Swal.fire({
        title: 'Are you sure?',
        text: "You will be logged out!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirm'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.setItem('status', 'loggedOut');
            localStorage.setItem('uid', 'none');
            localStorage.setItem('bid', 'none');
            location.reload();
        }
    })
}

let uid = localStorage.getItem('uid');
const titlebar = document.querySelector('.titlebar');

db.collection("businesses").where("business_owner_id", "==", uid)
    .get()
    .then((querySnapshot) => {
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                let business_name = data.business_name;
                localStorage.setItem('bid', doc.id);
                localStorage.setItem('business_name', business_name)
                titlebar.innerHTML += `
                    <div class="business_name">
                        ${business_name}
                    </div>`
            });
        } else {
            console.log("No document found!");
        }
    }).catch((error) => {
        console.log("Error getting document: ", error);
    });