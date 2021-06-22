
db.collection("businesses").orderBy("business_name").onSnapshot((querySnapshot) => {
    setupBusinesses(querySnapshot);
});

const businessList = document.querySelector('.table-business-body');

let dtTable;

let arrObj = [];

let createButton = document.getElementById("create_button");
let elem = document.getElementById("myBar");
let label = document.getElementById("progress_label");
let progressText = document.getElementById("progress");

createButton.style.display = "flex"
elem.style.display = "none"
label.style.display = "none"
progressText.style.display = "none"

const setupBusinesses = (data) => {
    let html = '';
    let index = 0;
    data.forEach((doc) => {
        const data = doc.data();
        let bid = doc.id;
        arrObj.push(bid);
        let businessName = data.business_name ?? "No Data Found";
        let businessOwner = data.business_owner ?? "No Data Found";
        let address = data.business_address ?? "No Data Found";
        let mobile = data.business_mobile_no ?? "No Data Found";
        let telephone = data.business_tel_no ?? "No Data Found";
        let email = data.business_email ?? "No Data Found";
        let status = data.business_status ?? "No Data Found"
        const tbody = `
            <tr id="${bid}" onclick="editBusiness('${bid}')">
                <td>${businessName} </td>
                <td>${businessOwner}</td>
                <td>${address}</td>
                <td>${mobile}</td>
                <td>${telephone}</td>
                <td>${status}</td>
                <td>${email}</td>
                <td>
                    <div onclick="editBusiness('${bid}')">
                        <i class="fas fa-pen tooltip"><span class="tooltiptext">Edit</span></i>
                    </div>
                    <div onclick="openDeleteModal('${bid}')">
                        <i class="fas fa-trash tooltip"><span class="tooltiptext">Delete</span></i>
                    </div>
                </td>
            </tr>
        `;
        html += tbody;
        index++;
    });
    businessList.innerHTML = html;
}

function editBusiness(id) {
    //console.log("editing " + arrObj[index]);
    console.log("editing: " + id);
    window.location = '../admin/business.html?id=' + id;
}

async function deleteBusiness(index) {

    let businessRef = db.collection("businesses")
    let getBusiness = await businessRef.doc(index).get()
    let data = await getBusiness.data()
    let account_id = await data.business_owner_id
    console.log(account_id)

    let loading = Swal.fire({
        title: 'Loading...',
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading()
        }
    })
    
    db.collection("businesses").doc(index).delete().then(() => {
        db.collection("business_accounts").doc(account_id).delete().then(() => {
            // console.log("Document successfully deleted!");
            // location.reload();
            loading.close()
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Document successfully deleted!'
            })
        }).catch((error) => {
            loading.close()
            console.error("Error removing document: ", error);
        });
    }).catch((error) => {
        loading.close()
        console.error("Error removing document: ", error);
    });
}

function searchBusiness(textInput) {
    db.collection("businesses").where("business_name", "==", textInput)
        .get()
        .then((querySnapshot) => {
        setupBusinesses(querySnapshot);
    });
}

function showAll(){
    db.collection("businesses").orderBy("business_name").get().then((querySnapshot) => {
        setupBusinesses(querySnapshot);
    });
}

// Get the modal
var modal = document.getElementById("newBusinessModal");
var modal2 = document.getElementById("confirmDeleteModal");

// Get the button that opens the modal
var btn = document.getElementById("create-form");
var deleteBtn = document.getElementById("delete-button");
var confirmbtn = document.getElementById("deletebtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
var span2 = document.getElementsByClassName("close")[1];

// When the user clicks on the button, open the modal
btn.onclick = function() {
    modal.style.display = "block";
}

function openDeleteModal(id) {
    // modal2.style.display = "block";
    // confirmbtn.classList.add(id);
    Swal.fire({
        icon: 'warning',
        title: 'Hol up...',
        text: 'Are you sure you want to delete this business?',
        showCancelButton: true,
        confirmButtonText: 'Delete',
    }).then((result) => {
        if(result.isConfirmed) {
            deleteBusiness(id)
        } else if (result.isDenied) {

        }
    })
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

span2.onclick = function () {
    closeModal2();
}

function closeModal2() {
    modal2.style.display = "none";
    confirmbtn.classList.remove(confirmbtn.className.split(' ').pop());
}

setInputFilter(document.getElementById("latitude"), function(value) {
    return /^\d*\.?\d*$/.test(value); // Allow digits and '.' only, using a RegExp
});

setInputFilter(document.getElementById("longitude"), function(value) {
    return /^\d*\.?\d*$/.test(value); // Allow digits and '.' only, using a RegExp
});

setInputFilter(document.getElementById("maxCapacity"), function(value) {
    return /^\d*\.?\d*$/.test(value); // Allow digits and '.' only, using a RegExp
});

function setInputFilter(textbox, inputFilter) {
    ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
        textbox.addEventListener(event, function() {
        if (inputFilter(this.value)) {
            this.oldValue = this.value;
            this.oldSelectionStart = this.selectionStart;
            this.oldSelectionEnd = this.selectionEnd;
        } else if (this.hasOwnProperty("oldValue")) {
            this.value = this.oldValue;
            this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
        } else {
            this.value = "";
        }
        });
    });
}

let inputImage = document.getElementById("business_img");
let normalImage = document.getElementById("normalImage");

inputImage.onchange = evt => {
    const [file] = inputImage.files;

    if (file) {
        normalImage.style.display = "flex"
        normalImage.src = URL.createObjectURL(file)
        return
    }

    normalImage.style.display = "none"
}

let image360 = document.getElementById("business_360_img");
let img360 = document.getElementById("img360");

image360.onchange = evt => {
    const [file] = image360.files;

    if (file) {
        img360.style.display = "flex"
        img360.src = URL.createObjectURL(file)
        return
    } 

    img360.style.display = "none"
}

const isEmpty = str => !str.trim().length;

async function createNewBusiness() {

    let businessName = document.getElementById('business_name');
    let businessOwner = document.getElementById('owner_name');
    let address = document.getElementById('address');
    let capacity = document.getElementById('maxCapacity');
    let mobile = document.getElementById('mobile_no');
    let telephone = document.getElementById('tel_no');
    let email = document.getElementById('email');
    let password = document.getElementById('password');
    let repeatPassword = document.getElementById('repeatPassword');
    let latitude = document.getElementById('latitude')
    let longitude = document.getElementById('longitude')
    let imageUrl = ""
    let image360Url = ""

    if(isEmpty(businessName.value)){
        businessName.focus();
        //alert("Business Name is Empty!");
        Swal.fire({
            icon: 'error',
            title: 'Error...',
            text: 'Business Name is Empty!'
        })
        return;
    }

    if(isEmpty(businessOwner.value)){
        businessOwner.focus();
        //alert("Business Owner is Empty!");
        Swal.fire({
            icon: 'error',
            title: 'Error...',
            text: 'Business Owner is Empty!'
        })
        return;
    }

    if(isEmpty(address.value)){
        address.focus();
        //alert("Address is Empty!");
        Swal.fire({
            icon: 'error',
            title: 'Error...',
            text: 'Address is Empty!'
        })
        return;
    }

    if(isEmpty(capacity.value)){
        capacity.focus();
        //alert("Capacity is Empty!");
        Swal.fire({
            icon: 'error',
            title: 'Error...',
            text: 'Capacity is Empty!'
        })
        return;
    }

    if(isEmpty(mobile.value) && isEmpty(telephone.value)){
        mobile.focus();
        //alert("You need at least one contact info!");
        Swal.fire({
            icon: 'error',
            title: 'Error...',
            text: 'You need at least one contact info'
        })
        return;
    }

    if(isEmpty(email.value)){
        email.focus();
        //alert("Email is Empty!");
        Swal.fire({
            icon: 'error',
            title: 'Error...',
            text: 'Email is Empty!'
        })
        return;
    }

    if(isEmpty(password.value)){
        password.focus();
        //alert("Password is Empty!");
        Swal.fire({
            icon: 'error',
            title: 'Error...',
            text: 'Password is Empty!'
        })
        return;
    }

    if(repeatPassword.value != password.value){
        repeatPassword.focus();
        //alert("Passwords do not match!");
        Swal.fire({
            icon: 'error',
            title: 'Error...',
            text: 'Passwords do not match'
        })
        return;
    }

    let checkEmail = await checkIfEmailUsed(email.value)

    if(checkEmail) {
        Swal.fire({
            icon: 'error',
            title: 'Oops.. Something went wrong',
            text: 'Email already in use!'
        });
        return;
    }

    createButton.style.display = "none"
    elem.style.display = "flex"
    label.style.display = "flex"
    progressText.style.display = "flex"

    let result1 = await uploadNormal(businessName.value)

    if(result1 == "Error") {
        return console.log("An error has occured while uploading image")
    } else {
        imageUrl = result1
    }

    let result2 = await upload360(businessName.value)

    if(result2 == "Error") {
        return console.log("An error has occured while uploading 360 image")
    } else {
        image360Url = result2
    }

    let loading = Swal.fire({
        title: 'Loading...',
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading()
        }
    })

    // async register auth and return uid
    
    // .doc(uid).set({})
    db.collection("business_accounts").add({
            email: email.value,
            password: password.value
        })
        .then((bAccountsDocRef) => {
            var account_id = bAccountsDocRef.id;
            db.collection("businesses").add({
                    business_name: businessName.value,
                    business_owner: businessOwner.value,
                    business_address: address.value,
                    business_capacity: parseInt(capacity.value, 10),
                    business_mobile_no: mobile.value,
                    business_tel_no: telephone.value,
                    business_email: email.value,
                    business_rating: 0,
                    business_owner_id: account_id,
                    business_img_url: imageUrl,
                    business_360_image_url: image360Url,
                    business_geopoint: new firebase.firestore.GeoPoint(
                        Number(latitude.value),
                        Number(longitude.value))
                })
                .then((docRef) => {
                    console.log("Document written with ID: ", bAccountsDocRef.id);
                    //alert("Task Complete")
                    // Swal.fire({
                    //     icon: 'success',
                    //     title: 'Success!',
                    //     text: 'Business has been created! The page will reload soon.'
                    // });
                    loading.close()
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        html: 'Business has been created! The page will reload in <b></b> seconds.',
                        timer: 3000,
                        timerProgressBar: true,
                        allowOutsideClick: false,
                        showConfirmButton: false,
                        didOpen: () => {
                            timerInterval = setInterval(() => {
                              const content = Swal.getHtmlContainer()
                              if (content) {
                                const b = content.querySelector('b')
                                if (b) {
                                  b.textContent = Math.round(Swal.getTimerLeft() / 1000)
                                }
                              }
                            }, 100)
                          },
                          willClose: () => {
                            clearInterval(timerInterval)
                          }
                    }).then((result) => {
                        if (result.dismiss === Swal.DismissReason.timer) {
                            location.reload();
                            console.log('I was closed by the timer')
                        }
                    })
                    // document.getElementById("new_business_modal").reset();
                    // setTimeout(function () {
                    //     location.reload();
                    // }, 2000);
                    // modal.style.display = "none";
                })
                .catch((error) => {
                    loading.close()
                    console.error("Error adding document: ", error);
                });
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.errorMessage;
            console.log(`${errorCode}: ${errorMessage}`)
            loading.close()
        });

}

async function testFunction() {
    let imageUrl = ""
    let image360Url = ""

    let result1 = await uploadNormal("Test")

    if(result1 == "Error") {
        console.log("An error has occured while uploading image")
    } else {
        imageUrl = result1
        console.log(imageUrl)
    }

    let result2 = await upload360("Test")

    if(result2 == "Error") {
        console.log("An error has occured while uploading 360 image")
    } else {
        image360Url = result2
        console.log(image360Url)
    }
}

async function uploadNormal(id) {
    return new Promise((resolve, reject) => {
        var test = document.getElementById('business_img');

        if(test.value == "") return resolve("Error");

        var filenameSplit = test.value.split('\\')[2];
        //var filename = filenameSplit.split('.')[0];
        var filename = id;
        var extension = test.value.split('.')[1];
        var fileLocation = "pics/businesses/" + filename + "." + extension;
        var imagesRef = storageRef.child(fileLocation)

        elem.style.width = 1;
        label.innerHTML = 'Uploading Image'

        //console.log(test.files[0]);

        var uploadTask = imagesRef.put(test.files[0]);

        uploadTask.on('state_changed',
            (snapshot) => {
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                elem.style.width = progress + "%";
                //progressText.innerHTML = `${Math.round(progress)}%`
                let megabytesTransfered = snapshot.bytesTransferred * 0.001 * 0.001
                let totalMegabytes = snapshot.totalBytes * 0.001 * 0.001
                progressText.innerHTML = `${Math.round(megabytesTransfered * 100) / 100} MB / ${Math.round(totalMegabytes * 100) / 100} MB`
            },
            (error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'An error has occured',
                    text: error
                })
                resolve("Error");
            },
            () => {
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    })
}

async function upload360(id) {
    return new Promise((resolve, reject) => {
        var test = document.getElementById('business_360_img');

        if(test.value == "") return resolve("Error");

        var filenameSplit = test.value.split('\\')[2];
        //var filename = filenameSplit.split('.')[0];
        var filename = id;
        var extension = test.value.split('.')[1];
        var fileLocation = "pics/businesses/360/" + filename + "." + extension;
        var imagesRef = storageRef.child(fileLocation)
        elem.style.width = 1;
        label.innerHTML = 'Uploading 360 Image'

        //console.log(test.files[0]);

        var uploadTask = imagesRef.put(test.files[0]);

        uploadTask.on('state_changed',
            (snapshot) => {
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                elem.style.width = progress + "%";
                let megabytesTransfered = snapshot.bytesTransferred * 0.001 * 0.001
                let totalMegabytes = snapshot.totalBytes * 0.001 * 0.001
                progressText.innerHTML = `${Math.round(megabytesTransfered * 100) / 100} MB / ${Math.round(totalMegabytes * 100) / 100} MB`
            },
            (error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'An error has occured',
                    text: error
                })
                resolve("Error");
            },
            () => {
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    })
}

async function checkIfEmailUsed(email) {
    return new Promise((resolve, reject) => {
        db.collection("business_accounts").where("email", "==", email)
            .get()
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    querySnapshot.forEach((doc) => {
                        //return alert("Email already in use!")
                        return resolve(true);
                    });
                } else {
                    return resolve(false);
                }
            }).catch((error) => {
                console.log("Error getting document: ", error);
                return resolve(true);
            });
    })
}

// const setupBusinesses = (data) => {
//     let html = '';
//     var arrObj = [];
//     data.forEach((doc) => {
//         var obj = doc.data();
//         obj.id = doc.id; // assign id to data;
//         arrObj.push(obj);
//     });
//     console.log("data", arrObj);
// }

// window.addEventListener('load', function() {
//     document.querySelector('input[type="file"]').addEventListener('change', function() {
//         if (this.files && this.files[0]) {
//             var img = document.querySelector('.normalImage');

//             img.style.display = "flex";

//             img.onload = () => {
//                 URL.revokeObjectURL(img.src);  // no longer needed, free memory
//             }

//             img.src = URL.createObjectURL(this.files[0]); // set src to blob url
//         }
//     });
// });

    // var businessName = (document.getElementById('business_name').value != "") ? document.getElementById('owner_name').value : "No Data Found";
    // var businessOwner = (document.getElementById('owner_name').value != "") ? document.getElementById('owner_name').value : "No Data Found";
    // var address = (document.getElementById('address').value != "") ? document.getElementById('address').value : "No Data Found";
    // var capacity = (document.getElementById('maxCapacity').value.isNaN) ? document.getElementById('maxCapacity').value : 0;
    // var mobile = (document.getElementById('mobile_no').value != "") ? document.getElementById('mobile_no').value : "No Data Found";
    // var telephone = (document.getElementById('tel_no').value != "") ? document.getElementById('tel_no').value : "No Data Found";
    // var email = (document.getElementById('email').value != "") ? document.getElementById('email').value : "No Data Found";
    // var password = (document.getElementById('password').value != "") ? document.getElementById('password').value : "No Data Found";
    // var repeatPassword = (document.getElementById('repeatPassword').value != "") ? document.getElementById('repeatPassword').value : "No Data Found";
