function login(){

    document.getElementById("login").disabled = true;
    document.getElementById("loginAsAdmin").disabled = true;

    var email = document.getElementById("email");
    var password = document.getElementById("password");

    auth.signInWithEmailAndPassword(email.value, password.value)
        .then((userCredential) => {
            var user = userCredential.user;
            var uid = user.uid;
            var docRef = db.collection("users").doc(uid);

            console.log(uid);

            docRef.get().then((doc) => {
                if (doc.exists) {
                    var data = doc.data();
                    var userType = data.type;
            
                    console.log("Document data:", userType);

                    switch(userType) {
                        case "Admin":
                            alert("Welcome Admin!");
                            window.location.replace("admin/home.html");
                            break;
                        case "Business":
                            alert("Welcome Business!");
                            window.location.replace("business/home.html");
                            break;
                        default:
                            email.value = '';
                            password.value = '';
                            alert("This user is not a business/admin account!");
                            firebase.auth().signOut().then(() => {
                            // Sign-out successful.
                            }).catch((error) => {
                            // An error happened.
                            });
                            document.getElementById("login").disabled = false;
                            document.getElementById("loginAsAdmin").disabled = false;
                    }
                } else {
                    console.log("No such document!");
                }
            }).catch((error) => {
                console.log("Error getting document:", error);
            });

        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;

            document.getElementById("login").disabled = false;
            document.getElementById("loginAsAdmin").disabled = false;

            alert(errorMessage);
        })


    //alert("Logged In!");

}

function loginAsAdmin() {
    
    document.getElementById("login").disabled = true;
    document.getElementById("loginAsAdmin").disabled = true;

    var email = document.getElementById("email");
    var password = document.getElementById("password");

    if (email.value == "") {
        document.getElementById("login").disabled = false;
        document.getElementById("loginAsAdmin").disabled = false;
        return alert("Email can't be empty!");
    }

    db.collection("business_accounts").where("email", "==", email.value)
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                alert("Wrong email!");
                document.getElementById("login").disabled = false;
                document.getElementById("loginAsAdmin").disabled = false;
            } else {
                querySnapshot.forEach((doc) => {
                    if (doc.exists) {
                        var data = doc.data();
                        if (data.password == password.value) {
                            console.log("Correct password");
                            localStorage.setItem('status', 'loggedIn');
                            localStorage.setItem('uid', doc.id);
                            window.location.replace("business/home.html");
                        } else {
                            alert("Wrong password");
                            document.getElementById("login").disabled = false;
                            document.getElementById("loginAsAdmin").disabled = false;
                        }
                    } else {
                        console.log("No such document!");
                        document.getElementById("login").disabled = false;
                        document.getElementById("loginAsAdmin").disabled = false;
                    }
                });
            }
        }).catch((error) => {
            console.log("Error getting document: ", error);
            document.getElementById("login").disabled = false;
            document.getElementById("loginAsAdmin").disabled = false;
        });
}

auth.onAuthStateChanged(function(user){

    if(user) {
        var uid = user.uid;
            var docRef = db.collection("users").doc(uid);
            docRef.get().then((doc) => {
                if (doc.exists) {
                    var data = doc.data();
                    var userType = data.type;
            
                    console.log("Document data:", userType);

                    switch(userType) {
                        case "Admin":
                            window.location.replace("admin/home.html");
                            break;
                        case "Business":
                            window.location.replace("business/home.html");
                            break;
                        default:
                            email.value = '';
                            password.value = '';
                            firebase.auth().signOut().then(() => {
                                // Sign-out successful.
                            }).catch((error) => {
                            // An error happened.
                            });
                    }
                } else {
                    console.log("No such document!");
                }
            }).catch((error) => {
                console.log("Error getting document:", error);
            });
    } else {

    }

});