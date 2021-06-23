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

const openAccountSettings = async () => {
    Swal.fire({
        icon: 'info',
        title: 'Account Settings',
        html: `
            <div class="btn" id="edit_account" onclick="editAccount()">Edit Account Info</div>
            <div class="btn" id="change_email" onclick="changeEmail()">Change Email</div>
            <div class="btn" id="change_password" onclick="changePassword()">Change Password</div>
        `,
    })
}

const editAccount = () => {
    window.location = "../business/editaccountinfo.html"
}

const changeEmail = async () => {
    const bid = localStorage.getItem("bid")
    const credential = await promptForCredentials()

    console.log(credential)

    const loading = Loading.fire({title: "Reauthenticating..."})

    if(!credential) {
        loading.close()
        Swal.fire({
            icon: 'error',
            title: "An Error has occured",
            text: "Wrong credentials!",
            didOpen: () => {
                Swal.hideLoading()
            }
        })
        return
    }

    loading.close()

    openNewEmailAddress()

    /* user.reauthenticateWithCredential(credential).then(() => {
        // User re-authenticated.
        loading.close()
        openNewEmailAddress()
    }).catch((error) => {
        loading.close()
        Swal.fire({
            icon: 'error',
            title: "An Error has occured",
            text: error
        })
    }); */

}

const changePassword = async () => {
    const user = auth.currentUser
    const credential = await promptForCredentials()

    console.log(credential)

    const loading = Loading.fire({title: "Reauthenticating..."})

    if(!credential) {
        loading.close()
        Swal.fire({
            icon: 'error',
            title: "An Error has occured",
            text: "Wrong credentials!",
            didOpen: () => {
                Swal.hideLoading()
            }
        })
        return
    }

    loading.close()
    openChangePassword()

}

const promptForCredentials = async () => {
    return new Promise((resolve, reject) => {
        Swal.fire({
            icon: "warning",
            html: `
                <div class="description"><p>For security reasons, please login again</p></div>
                <div class="current-email">
                        <label for="current_address" class="custom-swal-label">Email</label>
                        <input type="text" id="current_address" class="custom-swal-input">
                </div>
                <div class="current-password">
                        <label for="current_password" class="custom-swal-label">Password</label>
                        <input type="password" id="current_password" class="custom-swal-input">
                </div>
            `,
            preConfirm: () => {
                const currentEmail = Swal.getPopup().querySelector("#current_address").value.trim()
                const currentPassword = Swal.getPopup().querySelector("#current_password").value.trim()
                
                return { 
                    email: currentEmail, 
                    password: currentPassword
                }
            }
        }).then((result) => {

            let values = result.value

            db.collection("business_accounts")
                .doc(uid)
                .get()
                .then((userDoc) => {
                    if (!userDoc.exists) {
                        console.log("User does not exist")
                        resolve(false)
                    }

                    const userData = userDoc.data();
                    const credentials = {email: userData.email, password: userData.password}

                    console.table(credentials)
                    console.table(values)

                    if(credentials.email == values.email && credentials.password == values.password) {
                        console.log("Correct!")
                        resolve(true)
                    } else {
                        console.log("Wrong!")
                        resolve(false)
                    }

                }).catch((error) => {
                    console.log("Error getting document: ", error);
                    resolve(false)
                });

        })
    })
}

const openNewEmailAddress = async () => {
    const { value: email } = await Swal.fire({
        title: 'Enter New Email Address',
        input: 'email',
        inputPlaceholder: 'Enter new email address',
        showCancelButton: true,
        didOpen: () => {
            Swal.hideLoading()
        }
    })

    const loading = Loading.fire({title: "Updating Email..."})

    if(email) {

        let checkEmail = await checkIfEmailUsed(email)

        if(checkEmail) {
            loading.close()
            Swal.fire({
                icon: 'error',
                title: 'Oops.. Something went wrong',
                text: 'Email already in use!',
                didOpen: () => {
                    Swal.hideLoading()
                }
            });
            return;
        }

        db.collection("business_accounts").doc(uid)
            .update({
                email: email
            })
            .then(() => {
                loading.close()
                Toast.fire({
                    icon: 'success',
                    title: `Email has been changed!`
                })
            }).catch((error) => {
                loading.close()
                Toast.fire({
                    icon: 'error',
                    title: `Error changing email: ${error}`
                })
            });
    } else {
        loading.close()
    }

}

const openChangePassword = async () => {
    const { value: password } = await Swal.fire({
        title: 'Enter New Password',
        input: 'password',
        inputPlaceholder: 'Enter new password',
        showCancelButton: true,
        didOpen: () => {
            Swal.hideLoading()
        }
    })

    const { value: confirmPassword } = await Swal.fire({
        title: 'Confirm Password',
        input: 'password',
        inputPlaceholder: 'Confirm password',
        showCancelButton: true
    })

    const loading = Loading.fire({title: "Updating Password..."})

    if(password == confirmPassword) {
        db.collection("business_accounts").doc(uid)
            .update({
                password: password
            })
            .then(() => {
                loading.close()
                Toast.fire({
                    icon: 'success',
                    title: `Password has been changed!`
                })
            }).catch((error) => {
                loading.close()
                Toast.fire({
                    icon: 'error',
                    title: `Error changing Password: ${error}`
                })
            });
    } else {
        loading.close()
        Swal.fire({
            icon: 'error',
            title: "An Error has occured",
            text: "Password do not match!",
            didOpen: () => {
                Swal.hideLoading()
            }
        })
    }

    if(email) {

        let checkEmail = await checkIfEmailUsed(email)

        if(checkEmail) {
            loading.close()
            Swal.fire({
                icon: 'error',
                title: 'Oops.. Something went wrong',
                text: 'Email already in use!',
                didOpen: () => {
                    Swal.hideLoading()
                }
            });
            return;
        }

        db.collection("business_accounts").doc(uid)
            .update({
                email: email
            })
            .then(() => {
                loading.close()
                Toast.fire({
                    icon: 'success',
                    title: `Email has been changed!`
                })
            }).catch((error) => {
                loading.close()
                Toast.fire({
                    icon: 'error',
                    title: `Error changing email: ${error}`
                })
            });
    } else {
        loading.close()
    }

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

const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-right',
    iconColor: 'white',
    customClass: {
        popup: 'colored-toast'
    },
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true
})

const Loading = Swal.mixin({
    showConfirmButton: false,
    didOpen: () => {
        Swal.showLoading()
    }
})