function logout(){
    var user = firebase.auth().currentUser;
    var uid = user.uid;

    console.log(uid);

    Swal.fire({
        title: 'Are you sure?',
        text: "You will be logged out!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirm'
    }).then((result) => {
        if (result.isConfirmed) {
            auth.signOut().then(() => {
                // Sign-out successful. 
                window.location.replace("../index.html");
                //lert("Sign-out successful.");
            }).catch((error) => {
                // An error happened.
                //alert("An error happend: " + error);
                Swal.fire({
                    title: 'An error happened!',
                    text: error,
                    icon: 'error'
                })
            });
        }
    })

}

auth.onAuthStateChanged(function(user){

    if(user) {
        
    } else {
        window.location.replace("../index.html");
    }

});