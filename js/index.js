// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("forgotPassword");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

var alertClose = document.getElementsByClassName("closebtn")[0];

alertClose.onclick = function(){
    // Get the parent of <span class="closebtn"> (<div class="alert">)
    var div = this.parentElement;
    // Set the opacity of div to 0 (transparent)
    div.style.opacity = "0";
    // Hide the div after 600ms (the same amount of milliseconds it takes to fade out)
    setTimeout(function(){ div.style.display = "none"; }, 200);
}

const openContact = () => {
    Swal.fire({
        icon: 'info',
        title: 'Contact this email address',
        text: 'ohkasyon.thesis2021@gmail.com',
        confirmButtonText: 'Copy'
    }).then((result) => {
        if (result.isConfirmed) {
            
            let email = Swal.getHtmlContainer()
            Clipboard_CopyTo(email.innerHTML)
            // console.log(email.innerHTML)
            // email.select()
            // email.setSelectionRange(0, 99999)
            // document.execCommand("copy")
            Swal.fire('Copied!', '', 'success')
        }
    })
}

function Clipboard_CopyTo(value) {
    var tempInput = document.createElement("input");
    tempInput.value = value;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
  }
  
