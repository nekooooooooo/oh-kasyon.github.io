const cards = document.querySelector('.cards');
const testImage = "https://firebasestorage.googleapis.com/v0/b/oh-kasyon.appspot.com/o/pics%2Fdefault-profile-picture1.jpg?alt=media&token=c923dbf2-e004-4ae4-a5f9-5e73ae90348b"
document.body.style.backgroundImage = `url("${localStorage.getItem("background_url")}")`;
console.log(localStorage.getItem("background_url"))

let bid = localStorage.getItem('bid');
console.log(bid);

const businessesRef = db.collection("businesses");
const menusRef = businessesRef.doc(bid).collection("menus");

menusRef.onSnapshot((menuSnapshot) => {
        setupMenus(menuSnapshot);
    });

const createMenu = async function () {
    const { value: formValues } = await Swal.fire({
        title: 'Create Menu',
        html: `
            <label for="menu_name" class="custom-swal-label">Name</label>
            <input type="text" id="menu_name" placeholder="Enter Menu Name..." class="custom-swal-input">
            <label for="price" class="custom-swal-label">Price</label>
            <input type="number" id="price" placeholder="Enter Price..." class="custom-swal-input">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Create',
        preConfirm: () => {
            if(document.getElementById('menu_name').value.trim() == ""){
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "Name can't be empty!"
                })
                return
            }

            if(document.getElementById('price').value.trim() == ""){
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "Price can't be empty!"
                })
                return
            }

            if(document.getElementById('price').value.trim() < 0){
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "Price can't be less than 0!"
                })
                return
            }

            return {
                name: document.getElementById('menu_name').value,
                price: document.getElementById('price').value
            }
        }
    })

    if (formValues) {

        let loading = Swal.fire({
            title: 'Loading...',
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading()
            }
        })

        // Swal.fire(`${formValues.name}, ${formValues.price}`)
        console.log(typeof parseInt(formValues.price), 10)
        menusRef.add({
            name: formValues.name,
            price: parseInt(formValues.price, 10),
            business_owner_id: uid
        })
        .then((newMenuRef) => {
            loading.close()
            let newMenuRefId = newMenuRef.id
            Swal.fire({
                icon: 'success',
                title: 'Menu has been created!',
                text: 'Press OK to add Food into your menu!',
                timer: 3000,
                timerProgressBar: true
            }).then((result) => {
                if(result.isDismissed || result.isConfirmed || result.isDenied) {
                    console.log("Entering the matrix")
                    window.location = '../business/foods.html?id=' + newMenuRefId;
                }
            })
        })
        .catch((error) => {
            loading.close()
            console.error("Error adding document: ", error);
        });
    }
}

function openMenu(id){
    window.location = '../business/foods.html?id=' + id;
}

let test = "asdasd";

function testSwal() {
    Swal.fire({
        title: "testSwal",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        allowOutsideClick: false
    }).then((result) => {
        console.log(result)
        if(result.isDismissed || result.isConfirmed || result.isDenied) {
            console.log("swal closed")
        }
    })
    
}

const setupMenus = (menuSnapshot) => {
    if (!menuSnapshot.empty) {
        let html = '';
        menuSnapshot.forEach((menuDoc) => {
            const menuData = menuDoc.data();
            const menuDocId = menuDoc.id;
            const foodRef = menusRef.doc(menuDocId).collection("foods");
            let name = menuData.name ?? "No Data";
            console.log(`${menuDocId}\n${name}`);

            let card = `
                <div class="menu-card" onclick="openMenu('${menuDocId}')">
                    <!-- <span class="menu-action" onclick=""><i class="fas fa-trash"></i></span> -->
                    <div class="name"><h2>${name}</h2></div>
                    <div class="foods" id="${menuDocId}">
                        <!-- menu.js -->
                    </div>
                </div>
            `
            foodRef.limit(2).onSnapshot((foodSnapshot) => {

                let nameArray = []
                const foods = document.getElementById(menuDocId);
                foods.innerHTML = ''

                if(foodSnapshot.empty) {
                    foods.innerHTML += `
                        <p class="food-name"><b>No food set! Click to edit Menu</b></p>
                    `
                    return
                }

                foodSnapshot.forEach((foodDoc) => {

                    const foodData = foodDoc.data();
                    let foodImageUrl = foodData.image_url ?? testImage
                    let foodName = foodData.food_name ?? ""
                    nameArray.push({food_name: foodName, food_type: foodData.food_type, image_url: foodImageUrl})
                    foods.innerHTML += `
                        <div class="food-card">
                            <img class="food-image" src="${foodImageUrl}">
                            <p class="food-name"><b>${foodName}</b></p>
                        </div>
                    `
                })
                foods.innerHTML += `
                        <div class="food-card">
                            <p class="food-name"><b>. . .</b></p>
                        </div>
                    `
                console.table(nameArray);
            })
            html += card;
        });
        cards.innerHTML = html;
    } else {
        cards.innerHTML = "<h1>No Menus Found!</h1>"
    }
}

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
