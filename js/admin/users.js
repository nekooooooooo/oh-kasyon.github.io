db.collection("users").orderBy("first_name").onSnapshot((querySnapshot) => {
    setupUsers(querySnapshot);
});

const userList = document.querySelector('.table-users-body');

var arrIds = [];

const setupUsers = (data) => {
    let html = '';
    var index = 0;
    data.forEach((doc) => {
        const data = doc.data();
        //console.log(data);
        var id = doc.id;
        arrIds.push(id);

        var first_name = data.first_name ?? "No Data Found";
        var middle_name = data.middle_name ?? "";
        var last_name = data.last_name ?? "No Data Found";
        var full_name = middle_name != "" ? first_name + " " + middle_name + " " + last_name : first_name + " " + last_name;
        var gender = data.gender ?? "No Data Found";
        var address = data.address ?? "No Data Found";
        var contact = data.contact_no ?? "No Data Found";
        var email = data.email ?? "No Data Found";
        var status = data.status ?? "No Data Found";
        var photoUrl = data.photoUrl ?? "";
        var tbody;

        if(status == "Normal") status = "Active"

        if(status == "Banned") {
            tbody = `
            <tr id="${id}">
                <td><img src="${photoUrl}"></td>
                <td>${full_name}</td>
                <td>${gender}</td>
                <td>${address}</td>
                <td>${contact}</td>
                <td>${email}</td>
                <td><span class="status ${status.toLowerCase()}">${status}</span></td>
                <td>
                    <div onclick="openUnbanModal('${id}')">
                        <i class="fas fa-check tooltip"><span class="tooltiptext">Unban</span></i>
                    </div>
                </td>
            </tr>
        `;
        } else {
            tbody = `
            <tr id="${id}">
                <td><img src="${photoUrl}"></td>
                <td>${full_name}</td>
                <td>${gender}</td>
                <td>${address}</td>
                <td>${contact}</td>
                <td>${email}</td>
                <td><span class="status ${status.toLowerCase()}">${status}</span></td>
                <td>
                    <div onclick="openBanModal('${id}')">
                        <i class="fas fa-ban tooltip"><span class="tooltiptext">Ban</span></i>
                    </div>
                </td>
            </tr>
        `;
        }
        html += tbody;
        index++;
    });
    userList.innerHTML = html;

    //console.log(arrIds);
}

// Get the modal
var modal2 = document.getElementById("confirmDeleteModal");

// Get the button that opens the modal
var deleteBtn = document.getElementById("delete-button");
var confirmbtn = document.getElementById("deletebtn");

// Get the <span> element that closes the modal
var span2 = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
function openBanModal(id) {
    // modal2.style.display = "block";
    // confirmbtn.classList.add(id);
    Swal.fire({
        icon: 'warning',
        title: 'Hold up...',
        text: 'Are you sure you want to ban this User?',
        showCancelButton: true,
        confirmButtonText: 'Ban',
    }).then((result) => {
        if(result.isConfirmed) {
            banUser(id)
        }
    })
}

function openUnbanModal(id) {
    // modal2.style.display = "block";
    // confirmbtn.classList.add(id);
    Swal.fire({
        icon: 'warning',
        title: 'Hold up...',
        text: 'Are you sure you want to unban this User?',
        showCancelButton: true,
        confirmButtonText: 'Unban',
    }).then((result) => {
        if(result.isConfirmed) {
            unbanUser(id)
        }
    })
}

span2.onclick = function () {
    closeModal2();
}

function closeModal2() {
    modal2.style.display = "none";
    confirmbtn.classList.remove(confirmbtn.className.split(' ').pop());
}

function searchUsers(textInput) {
    db.collection("users").where("email", "==", textInput)
        .get()
        .then((querySnapshot) => {
        setupUsers(querySnapshot);
    });
}

function showAll(){
    db.collection("users").orderBy("first_name").onSnapshot((querySnapshot) => {
        setupUsers(querySnapshot);
    });
}

function banUser(id){
    //console.log("Banning " + id);
    db.collection("users").doc(id).update({
        "status": "Banned"
    })
    .then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'User Banned Succesfully!'
        })
        //alert("User banned! Press OK to reload...");
        console.log("User Banned Succesfully!");
        //location.reload();
    })
    .catch((error) => {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
    });
}

function unbanUser(id){
    //console.log("Banning " + id);
    db.collection("users").doc(id).update({
        "status": "Normal"
    })
    .then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'User Unbanned Succesfully!'
        })
        // alert("User unbanned!");
        // modal2.style.display = "none";
        // console.log("User Banned Succesfully!");
    })
    .catch((error) => {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
    });
}