setView();

function toggleMenu() {
    if(sessionStorage.getItem("toggle") == null || sessionStorage.getItem("toggle") == "active") {
        sessionStorage.setItem("toggle", "inactive");
    } else {
        sessionStorage.setItem("toggle", "active");
    }
    setView();
}

function setView() {
    let toggle = document.querySelector('.toggle');
    let navigation = document.querySelector('.navigation');
    let main = document.querySelector('.main');

    if(sessionStorage.getItem("toggle") == "active") {
        toggle.classList.remove('active');
        navigation.classList.remove('active');
        main.classList.remove('active');
    } else {
        toggle.classList.add('active');
        navigation.classList.add('active');
        main.classList.add('active');
    }
}

const showSettings = async () => {
    Swal.fire({
        icon: 'info',
        title: 'Account Settings',
        html: `
            <div class="btn" id="change_email" onclick="changeEmail()">Change Email</div>
            <div class="btn" id="change_password" onclick="changePassword()">Change Password</div>
        `,
    })
}

const changeEmail = async () => {
    const user = auth.currentUser
    const credential = await promptForCredentials()

    const loading = Loading.fire({title: "Reauthenticating..."})

    user.reauthenticateWithCredential(credential).then(() => {
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
    });
}

const changePassword = async () => {
    const user = auth.currentUser
    const credential = await promptForCredentials()

    const loading = Loading.fire({title: "Reauthenticating..."})

    user.reauthenticateWithCredential(credential).then(() => {
        // User re-authenticated.
        loading.close()
        openChangePassword()
    }).catch((error) => {
        loading.close()
        Swal.fire({
            icon: 'error',
            title: "An Error has occured",
            text: error
        })
    });
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
            const user = firebase.auth().currentUser;
    
            if (user == null) {
                return
            }

            let values = result.value

            const credential = firebase.auth.EmailAuthProvider.credential(
                values.email, 
                values.password
            );

            resolve(credential)

        })
    })
}

const openNewEmailAddress = async () => {
    const { value: email } = await Swal.fire({
        title: 'Enter New Email Address',
        input: 'email',
        inputPlaceholder: 'Enter new email address',
        showCancelButton: true
    })

    const loading = Loading.fire({title: "Updating Email..."})

    if(email) {
        const user = auth.currentUser

        user.updateEmail(email).then(() => {
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
        showCancelButton: true
    })

    const { value: confirmPassword } = await Swal.fire({
        title: 'Confirm Password',
        input: 'password',
        inputPlaceholder: 'Confirm password',
        showCancelButton: true
    })

    const loading = Loading.fire({title: "Updating Password..."})

    if(password == confirmPassword) {
        const user = auth.currentUser

        user.updatePassword(confirmPassword).then(() => {
            loading.close()
            Toast.fire({
                icon: 'success',
                title: `Password has been changed!`
            })
        }).catch((error) => {
            loading.close()
            Toast.fire({
                icon: 'error',
                title: "An Error has occured",
                text: error
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
