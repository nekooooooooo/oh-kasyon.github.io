const container = document.querySelector('.container');
const testImage = "https://firebasestorage.googleapis.com/v0/b/oh-kasyon.appspot.com/o/pics%2Fdefault-profile-picture1.jpg?alt=media&token=c923dbf2-e004-4ae4-a5f9-5e73ae90348b"
document.body.style.backgroundImage = `url("${localStorage.getItem("background_url")}")`;
console.log(localStorage.getItem("background_url"))

let bid = localStorage.getItem('bid');
let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let menusId = urlParams.get("id");

console.log(menusId);

const businessesRef = db.collection("businesses");
const menusRef = businessesRef.doc(bid).collection("menus")
const foodsRef = menusRef.doc(menusId).collection("foods")
let menuName = ""

menusRef.doc(menusId)
    .onSnapshot((menuDoc) => {
        setupMenu(menuDoc)
    })

const openFood = async function(id) {
    const foodValues = await getFood(id)
    let nameChanged = false;
    let typeChanged = false;
    let imageChanged = false;
    let descChanged = false;

    console.table(foodValues);

    Swal.fire({
        html: `
            <div class="food-img">
                <img id="food_image" src="${foodValues.image_url}"/>
            </div>
            <input type="file" id="food_img" accept="image/*" class="custom-swal-input">
            <div class="food-name">
                <label for="food_name" class="custom-swal-label">Name</label>
                <input type="text" id="food_name" value="${foodValues.name}" class="custom-swal-input">
            </div>
            <div class="food-type">
                <label for="food_type" class="custom-swal-label">Type</label>
                <!-- <input type="text" id="food_type" value="${foodValues.type}" class="custom-swal-input" readonly> -->
                <select id="food_type_dropdown" class="custom-swal-input">
                    <option value="${foodValues.type}" selected disabled hidden>${foodValues.type}</option>
                    <option value="Dish">Dish</option>
                    <option value="Drink">Drink</option>
                    <option value="Dessert">Dessert</option>
                </select>
            </div>
            <div class="food-desc">
                <label for="food_desc" class="custom-swal-label">Description</label>
                <input type="text" id="food_desc" value="${foodValues.desc}" class="custom-swal-input">
            </div>
        `,
        showConfirmButton: false,
        confirmButtonText: 'Save',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        showDenyButton: true,
        denyButtonText: 'Delete',
        willOpen: () => {
            $("#food_name").on("input", function() {
                if(this.value != foodValues.name) {
                    nameChanged = true;
                    Swal.getConfirmButton().style.display = "inline-block"
                } else { 
                    nameChanged = false;
                    Swal.getConfirmButton().style.display = "none"
                }
            });

            $("#food_type_dropdown").on('change', function() {
                if(this.value != foodValues.type) {
                    typeChanged = true;
                    Swal.getConfirmButton().style.display = "inline-block"
                } else {
                    typeChanged = false;
                    Swal.getConfirmButton().style.display = "none"
                }
            })

            $("#food_desc").on('input', function() {
                if(this.value != foodValues.desc) {
                    descChanged = true;
                    Swal.getConfirmButton().style.display = "inline-block"
                } else {
                    descChanged = false;
                    Swal.getConfirmButton().style.display = "none"
                }
            })

            $("#food_img").change(function() {
                const [file] = this.files;
            
                if (file) {
                    imageChanged = true;
                    Swal.getConfirmButton().style.display = "inline-block"
                    $("#food_image").attr('src', URL.createObjectURL(file))
                    return
                } else {
                    imageChanged = false;
                    Swal.getConfirmButton().style.display = "none"
                    $("#food_image").attr('src', foodValues.image_url)
                }
            })

        },
        preConfirm: () => {
            const name = Swal.getPopup().querySelector("#food_name").value.trim()
            const type = Swal.getPopup().querySelector("#food_type_dropdown").value.trim()
            const desc = Swal.getPopup().querySelector("#food_desc").value.trim()
            const image = Swal.getPopup().querySelector("#food_img")
            
            return { 
                name: name, 
                type: type, 
                desc: desc, 
                img: image 
            }

        }
    }).then((result) => {
        let values = result.value

        if(result.isDenied) {
            Swal.fire({
                icon: 'question',
                title: 'Hmmmm...',
                text: `Are you sure you want to remove ${foodValues.name}?`,
                confirmButtonText: 'Yes',
                showCancelButton: true,
                cancelButtonText: 'No'
            }).then((result) => {
                if(result.isConfirmed) {
                    deleteFood(id, foodValues.name)
                }
            })  
        } else if(result.isConfirmed) {
            Swal.fire({
                icon: 'question',
                title: 'Hmmmm...',
                text: `Are you sure you want to change ${foodValues.name}?`,
                confirmButtonText: 'Yes',
                showCancelButton: true,
                cancelButtonText: 'No'
            }).then((result) => {
                if(result.isConfirmed) {
                    console.log(id)
                    console.table(values)

                    const changedList = { 
                        imageChanged: imageChanged,
                        nameChanged: nameChanged,
                        descChanged: descChanged,
                        typeChanged: typeChanged
                    }

                    updateFood(id, values, foodValues.image_url, changedList)

                }
            })  
        }
    })
}

const updateFood = async function(id, values, url, changed) {
    console.table(changed)

    if (changed.imageChanged) {
        await updateFoodImg(id, values, url)
    }

    if (changed.nameChanged) {
        await updateFoodName(id, values.name)
    }

    if (changed.typeChanged) {
        await updateFoodType(id, values.type)
    }

    if (changed.descChanged) {
        await updateFoodDesc(id, values.desc)
    }

    Toast.fire({
        icon: 'success',
        title: 'Food has been updated!',
    })
}

const deleteFood = function(id, name) {

    const loading = Loading.fire({title: "Deleting Food..."})

    foodsRef.doc(id).delete().then(() => {
        loading.close()
        Toast.fire({
            icon: 'success',
            title: `${name} has been deleted!`
        })
    }).catch((error) => {
        loading.close()
        Toast.fire({
            icon: 'success',
            title: `Error removing document: ${error}`
        })
        console.error("Error removing document: ", error);
    });

}

const updateFoodName = async (id, name) => {
    const checkFood = await checkIfFoodUsed(name)

    if(checkFood) {
        Swal.fire({
            icon: 'error',
            title: 'Oops.. Something went wrong',
            text: 'That food is already in the menu!'
        });
        return;
    }

    const loading = Loading.fire({title: "Updating Name..."})

    return new Promise((resolve, reject) => {
        foodsRef.doc(id).update({
            food_name: name,
        }).then(() => {
            // Toast.fire({
            //     icon: 'success',
            //     title: 'Food has been updated!',
            // })
            loading.close()
            console.log("Document successfully updated!");
            resolve()
        })
        .catch((error) => {
            loading.close()
            // The document probably doesn't exist.
            console.error("Error updating document: ", error);
            resolve()
        });
    })

}

const updateFoodType = async (id, type) => {

    const loading = Loading.fire({title: "Updating Type..."})

    return new Promise((resolve, reject) => {

        foodsRef.doc(id).update({
            food_type: type,
        }).then(() => {
            // Toast.fire({
            //     icon: 'success',
            //     title: 'Food has been updated!',
            // })
            loading.close()
            console.log("Document successfully updated!");
            resolve()
        })
        .catch((error) => {
            // The document probably doesn't exist.
            loading.close()
            console.error("Error updating document: ", error);
            resolve()
        });

    })

}

const updateFoodDesc = async (id, desc) => {

    const loading = Loading.fire({title: 'Updating Description...'})

    return new Promise((resolve, reject) => {

        foodsRef.doc(id).update({
            description: desc,
        }).then(() => {
            // Toast.fire({
            //     icon: 'success',
            //     title: 'Food has been updated!',
            // })
            loading.close()
            console.log("Document successfully updated!");
            resolve()
        })
        .catch((error) => {
            // The document probably doesn't exist.
            loading.close()
            console.error("Error updating document: ", error);
            resolve()
        });

    })

}

const updateFoodImg = async (id, values, url) => {

    // Create a reference to the file to delete
    const oldUrl = url
    const fileRef = firebase.storage().refFromURL(oldUrl)

    // Delete the file
    fileRef.delete().then(() => {
        console.log("Old Image Deleted!")
    }).catch((error) => {
        console.log("An Error has occured: ", error)
    });
    

    let imageUploadResult = await uploadImage(values.img, values.name)
    let imageUrl = ""

    if(imageUploadResult == "Error") {
        console.log("An error has occured while uploading image")
    } else {
        imageUrl = imageUploadResult
    }

    return new Promise((resolve, reject) => {
        foodsRef.doc(id).update({
            image_url: imageUrl,
        }).then(() => {
            // Toast.fire({
            //     icon: 'success',
            //     title: 'Food has been updated!',
            // })
            console.log("Document successfully updated!");
            resolve()
        })
        .catch((error) => {
            // The document probably doesn't exist.
            console.error("Error updating document: ", error);
            resolve()
        });
    })
}

async function getFood(id) {

    const loading = Loading.fire({title: "Loading Food..."})

    return new Promise((resolve, reject) => {
        foodsRef.doc(id)
            .get()
            .then((foodDoc) => {
                if (foodDoc.exists) {
                    const foodData = foodDoc.data()
                    const name = foodData.food_name ?? ""
                    const type = foodData.food_type ?? ""
                    const desc = foodData.description ?? ""
                    const image_url = foodData.image_url ?? ""
                    loading.close()
                    return resolve({
                        name: name,
                        type: type,
                        desc: desc,
                        image_url: image_url
                    })
                } else {
                    loading.close()
                    return console.log("No such document!");
                }
            }).catch((error) => {
                loading.close()
                return console.log("Error getting document: ", error);
            });
    })
}

const openAddFood = async function(type) {
    const { value: formValues } = await Swal.fire({
        title: `Create ${type}`,
        html: `
            <label for="food_img" class="custom-swal-label">Image</label>
            <input type="file" id="food_img" accept="image/*" class="custom-swal-input" required>
            <img id="preview_image" class="swal-preview-img" src="#">
            <label for="food_name" class="custom-swal-label">Name</label>
            <input type="text" id="food_name" placeholder="Enter Name..." class="custom-swal-input" required>
            <label for="food_desc" class="custom-swal-label">Description</label>
            <input type="text" id="food_desc" placeholder="Enter Description..." class="custom-swal-input" required>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Create',
        willOpen: () => {
            const foodImg = document.getElementById("food_img");
            const previewImage = document.getElementById("preview_image");

            foodImg.onchange = evt => {
                const [file] = foodImg.files;
            
                if (file) {
                    previewImage.style.display = "flex"
                    previewImage.src = URL.createObjectURL(file)
                    return
                }
            
                previewImage.style.display = "none"
                
            }
        },
        preConfirm: () => {
            if(document.getElementById('food_img').files.length == 0){
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "Image missing!"
                })
                return
            }

            if(document.getElementById('food_name').value.trim() == ""){
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "Name can't be empty!"
                })
                return
            }

            if(document.getElementById('food_desc').value.trim() == ""){
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "Description can't be empty!"
                })
                return
            }

            return {
                img: document.getElementById('food_img'),
                name: document.getElementById('food_name').value,
                desc: document.getElementById('food_desc').value,
                type: type
            }
        }
    })

    if (formValues) {

        const checkFood = await checkIfFoodUsed(formValues.name)

        if(checkFood) {
            Swal.fire({
                icon: 'error',
                title: 'Oops.. Something went wrong',
                text: 'That food is already in the menu!'
            });
            return;
        }

        addFood(formValues)
    }
}

async function checkIfFoodUsed(name) {
    return new Promise((resolve, reject) => {
        foodsRef.where("food_name", "==", name)
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

const addFood = async (values) => {
    console.log(values)
    let imageUploadResult = await uploadImage(values.img, values.name)
    let imageUrl = ""

    if(imageUploadResult == "Error") {
        console.log("An error has occured while uploading image")
    } else {
        imageUrl = imageUploadResult
    }

    const loading = Loading.fire({title: "Adding Food..."})

    foodsRef.add({
        food_name: values.name,
        image_url: imageUrl,
        food_type: values.type,
        description: values.desc
    }).then((newFoodRef) => {
        loading.close()
        Toast.fire({
            icon: 'success',
            title: `Food has been added to ${values.type}`
        })
    }).catch((error) => {
        loading.close();
        console.log(error)
        Toast.fire({
            icon: 'error',
            title: `Error: ${error}`,
        })
    })
}

async function uploadImage(img, name) {
    return new Promise((resolve, reject) => {

        if(img == "") return resolve("Error");

        console.log(img.files[0]);

        let filenameSplit = img.value.split('\\')[2];
        //var filename = filenameSplit.split('.')[0];
        let filename = name;
        let extension = img.value.split('.')[1];
        //var fileLocation = "pics/businesses/" + +"/" + filename + "." + extension;
        let fileLocation = `pics/businesses/${bid}/${menuName}/${filename}.${extension}`
        let imagesRef = storageRef.child(fileLocation)

        //console.log(test.files[0]);
        let uploadTask = imagesRef.put(img.files[0]);

        const progressSwal = Swal.fire({
            title: 'Uploading Image',
            html: `
                <label for="myProgress" id="progress_label">Task</label>
                <div id="myProgress">
                    <div id="myBar"></div>
                </div>
                <div id="progress">100%</div>
            `,
            showConfirmButton: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
            willOpen: () => {
                let elem = document.getElementById("myBar");
                let label = document.getElementById("progress_label");
                let progressText = document.getElementById("progress");

                elem.style.display = "flex"
                label.style.display = "flex"
                progressText.style.display = "flex"

                elem.style.width = 1;
                label.innerHTML = 'Uploading Image'

                uploadTask.on('state_changed',
                    (snapshot) => {
                        let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log(progress)
                        elem.style.width = progress + "%";
                        let megabytesTransfered = snapshot.bytesTransferred * 0.001 * 0.001
                        let totalMegabytes = snapshot.totalBytes * 0.001 * 0.001
                        progressText.innerHTML = `${Math.round(megabytesTransfered * 100) / 100} MB / ${Math.round(totalMegabytes * 100) / 100} MB`
                    },
                    (error) => {
                        progressSwal.close()
                        Swal.fire({
                            icon: 'error',
                            title: 'An error has occured',
                            text: error
                        })
                        resolve("Error");
                    },
                    () => {
                        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                            progressSwal.close()
                            resolve(downloadURL);
                        });
                    }
                );
            }
        })
    })
}

const deleteMenu = (id) => {
    
    const loading = Loading.fire({title: "Deleting Menu..."})

    menusRef.doc(id).delete().then(() => {
        loading.close()
        Toast.fire({
            icon: 'success',
            title: `Menu has been deleted!`
        }).then((result) => {
            if(result.dismiss === Swal.DismissReason.timer) {
                window.location = '../business/menu.html';
            }
        })
    }).catch((error) => {
        loading.close()
        Toast.fire({
            icon: 'success',
            title: `Error removing document: ${error}`
        })
        console.error("Error removing document: ", error);
    });
}

const openDeleteModal = (id) => {

    Swal.fire({
        icon: 'warning',
        title: 'Are you sure you want to Delete this Menu?',
        text: "You won't be able to revert this deletion!",
        showCancelButton: true,
        confirmButtonText: "Delete"
    }).then((result) => {
        if(result.isConfirmed) {
            deleteMenu(id)
        }
    })

}

const editName = async (id) => {

    const { value: name } = await Swal.fire({
        title: 'Enter new name!',
        input: 'text',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return 'You need to write something!'
            }
        }
    })

    if (name) {

        const loading = Swal.fire({
            title: 'Loading...',
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading()
            }
        })

        menusRef.doc(id).update({
            name: name
        }).then(() => {
            loading.close();
            Toast.fire({
                icon: 'success',
                title: 'Menu name has been updated!',
            })
            console.log("Document successfully updated!");
        })
        .catch((error) => {
            // The document probably doesn't exist.
            console.error("Error updating document: ", error);
        });
    } 

}

const editPrice = async (id) => {
    
    const { value: price } = await Swal.fire({
        title: 'Enter new price!',
        html: `
            <input type="number" id="price" placeholder="Enter Price..." class="custom-swal-input">
        `,
        showCancelButton: true,
        preConfirm: () => {
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

            return document.getElementById('price').value
            
        }
    })

    if (price) {

        const loading = Swal.fire({
            title: 'Loading...',
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading()
            }
        })

        menusRef.doc(id).update({
            price: parseInt(price, 10)
        }).then(() => {
            loading.close();
            Toast.fire({
                icon: 'success',
                title: 'Price has been updated!'
            })
            console.log("Document successfully updated!");
        })
        .catch((error) => {
            // The document probably doesn't exist.
            console.error("Error updating document: ", error);
        });
    } 

}

const editMenu = function () {
    if (document.getElementById('edit_name').style.visibility === "hidden") {
        document.querySelector(".create_btn").innerHTML = "Stop Editing"
        document.getElementById('edit_name').style.visibility = "visible"
        document.getElementById('edit_price').style.visibility = "visible"
    } else {
        document.querySelector(".create_btn").innerHTML = "Edit"
        document.getElementById('edit_name').style.visibility = "hidden"
        document.getElementById('edit_price').style.visibility = "hidden"
    }
}

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  
    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

const setupMenu = async (menuDoc) => {

    let html = `
        <a class="create_btn" onclick="editMenu()">Edit</a>
        <a class="create_btn btn-red" onclick="openDeleteModal('${menuDoc.id}')">Delete</a>
    `
    let cont = ''

    if(!menuDoc.exists) {
        cont += "<div>Error</div>";
        return
    } 

    const menuData = menuDoc.data();
    menuName = menuData.name

    cont += `
        <div class="menu-name">
            <p>
                ${menuData.name}
                <span class="food-action" id="edit_name" onclick="editName('${menuDoc.id}')">
                    <i class="fas fa-pen"></i>
                </span>
            </p>
        </div>
        <div class="menu-price">
            <p>
                ${formatter.format(menuData.price)}/head
                <span class="food-action" id="edit_price" onclick="editPrice('${menuDoc.id}')">
                    <i class="fas fa-pen"></i>
                </span>
            </p>
        </div>
    `;

    cont += `
        <div class="dishes">
            <p>Dishes</p>
            <div class="dishes-cards-container">
            
            </div>
        </div>
        <div class="drinks">
            <p>Drinks</p>
            <div class="drinks-cards-container">
            
            </div>
        </div>
        <div class="desserts">
            <p>Desserts</p>
            <div class="desserts-cards-container">
            
            </div>
        </div>
    `

    foodsRef.onSnapshot((foodSnapshot) => {
        setupFoods(foodSnapshot)
    })

    html += cont;
    container.innerHTML = html;

    document.getElementById('edit_name').style.visibility = "hidden"
    document.getElementById('edit_price').style.visibility = "hidden"
    // cards.innerHTML = menuData.name;

}

const setupFoods = async (foodSnapshot) => {

    const dishes = document.querySelector('.dishes-cards-container');
    const drinks = document.querySelector('.drinks-cards-container');
    const desserts = document.querySelector('.desserts-cards-container');

    let nameArray = []
    let dishesCont = ''
    let drinksCont = ''
    let dessertsCont = ''

    foodSnapshot.forEach((foodDoc) => {
        const foodData = foodDoc.data();
        let foodImageUrl = foodData.image_url ?? testImage
        let foodName = foodData.food_name ?? ""
        let foodType = foodData.food_type ?? ""

        switch(foodType) {
            case "Dish":
                dishesCont += `
                    <div class="dishes-card" onclick="openFood('${foodDoc.id}')">
                        <img class="food-image" src="${foodImageUrl}">
                        <p class="food-name"><b>${foodName}</b></p>
                    </div>
                `
                break;
            case "Drink":
                drinksCont += `
                    <div class="drinks-card" onclick="openFood('${foodDoc.id}')">
                        <img class="food-image" src="${foodImageUrl}">
                        <p class="food-name"><b>${foodName}</b></p>
                    </div>
                `
                break;
            case "Dessert":
                dessertsCont += `
                    <div class="desserts-card" onclick="openFood('${foodDoc.id}')">
                        <img class="food-image" src="${foodImageUrl}">
                        <p class="food-name"><b>${foodName}</b></p>
                    </div>
                `
                break;
        }
        nameArray.push({food_name: foodName, food_type: foodType, image_url: foodImageUrl})
    })

    dishesCont += `
            <div class="dishes-card" onclick="openAddFood('Dish')">
                <i class="fas fa-plus"></i>
            </div>
    `

    drinksCont += `
            <div class="drinks-card" onclick="openAddFood('Drink')">
                <i class="fas fa-plus"></i>
            </div>
    `

    dessertsCont += `
            <div class="desserts-card" onclick="openAddFood('Dessert')">
                <i class="fas fa-plus"></i>
            </div>
    `

    dishes.innerHTML = dishesCont
    drinks.innerHTML = drinksCont
    desserts.innerHTML = dessertsCont

    console.table(nameArray);
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