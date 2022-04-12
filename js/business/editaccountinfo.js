document.body.style.backgroundImage = `url("${localStorage.getItem("background_url")}")`;

const bid = localStorage.getItem('bid');

const businessRef = db.collection("businesses").doc(bid)

const normalImageInput = document.getElementById("business_img")
const img360Input = document.getElementById("business_360_img")

const business_name = $("#business_name")
const owner_name = $("#owner_name")
const address = $("#address")
const maxCapacity = $("#maxCapacity")
const mobile_no = $("#mobile_no")
const tel_no = $("#tel_no")
const email = $("#email")
const latitude = $("#latitude")
const longitude = $("#longitude")
const normalImage = $("#normalImage")
const img360 = $("#img360")

const business_info = document.querySelector('.business-info')

let businessValues
let nameChanged = false
let ownerChanged = false
let addressChanged = false
let capacityChanged = false
let mobileChanged = false
let telChanged = false
let emailChanged = false
let latChanged = false
let longChanged = false
let imgChanged = false
let img360Changed = false

businessRef.onSnapshot((businessDoc) => {
    setupBusiness(businessDoc);
});

const setupBusiness = async (businessDoc) => {
    businessValues = await getBusinessValues(businessDoc)
    console.table(businessValues)

    business_name.val(businessValues.name)
    owner_name.val(businessValues.owner)
    address.val(businessValues.address)
    maxCapacity.val(businessValues.capacity)
    mobile_no.val(businessValues.mobile_no)
    tel_no.val(businessValues.tel_no)
    email.val(businessValues.email)
    latitude.val(businessValues.geopoint._lat)
    longitude.val(businessValues.geopoint._long)
    normalImage.attr('src', businessValues.img_url)
    img360.attr('src', businessValues.img_360_url)

    document.querySelector(".edit-business-btns").innerHTML = `
        <a id="save_btn" class="btn" onclick="openSaveModal()">Save</a>
    `

    const save_btn = document.getElementById("save_btn")

    save_btn.style.display = "none"

}

const getBusinessValues = async(businessDoc) => {
    
    if(!businessDoc.exists) {
        console.log("No such document!");
        return
    }

    return new Promise((resolve, reject) => {
        const businessData = businessDoc.data()
        const address = businessData.business_address ?? ""
        const email = businessData.business_email ?? ""
        const geopoint = businessData.business_geopoint
        const img_url = businessData.business_img_url ?? ""
        const mobile_no = businessData.business_mobile_no ?? ""
        const owner = businessData.business_owner ?? ""
        const name = businessData.business_name ?? ""
        const owner_id = businessData.business_owner_id ?? ""
        const rating = businessData.business_rating ?? 0
        const tel_no = businessData.business_tel_no ?? ""
        const capacity = businessData.business_capacity ?? 0
        const img_360_url = businessData.business_360_image_url ?? ""

        return resolve({
            address: address,
            email: email,
            geopoint: geopoint,
            img_url: img_url,
            img_360_url: img_360_url,
            owner: owner,
            mobile_no: mobile_no,
            name: name,
            owner_id: owner_id,
            rating: rating,
            tel_no: tel_no,
            capacity: capacity
        })
    })
}

const openSaveModal = async(id) => {
    Swal.fire({
        icon: 'warning',
        title: 'Are you sure you want to Save?',
        text: "You won't be able to revert this change!",
        showCancelButton: true,
        confirmButtonText: "Save"
    }).then((result) => {
        if(result.isConfirmed) {
            const changedList = { 
                nameChanged: nameChanged,
                ownerChanged: ownerChanged,
                addressChanged: addressChanged,
                capacityChanged: capacityChanged,
                mobileChanged: mobileChanged,
                telChanged: telChanged,
                emailChanged: emailChanged,
                latChanged: latChanged,
                longChanged: longChanged,
                imgChanged: imgChanged,
                img360Changed: img360Changed
            }
            editBusiness(changedList)
        }
    })
}

const editBusiness = async(changed) => {
    console.table(changed)

    if (changed.nameChanged) {
        await updateName(business_name.val())
    }

    if (changed.ownerChanged) {
        await updateOwner(owner_name.val())
    }

    if (changed.addressChanged) {
        await updateAddress(address.val())
    }

    if (changed.capacityChanged) {
        await updateCapacity(maxCapacity.val())
    }

    if (changed.mobileChanged) {
        await updateMobile(mobile_no.val())
    }

    if (changed.telChanged) {
        await updateTel(tel_no.val())
    }

    if (changed.emailChanged) {
        await updateEmail(email.val())
    }

    if (changed.latChanged || changed.longChanged) {
        await updateGeopoint(latitude.val(), longitude.val())
    }

    if (changed.imgChanged) {
        await updateNormalImage(normalImageInput, businessValues.img_url)
    }

    if (changed.img360Changed) {
        await update360Image(img360Input, businessValues.img_360_url)
    }

    Toast.fire({
        icon: 'success',
        title: 'Account Info has been updated!',
    })
}

const updateName = async (name) => {

    const loading = Loading.fire({title: "Updating Name..."})

    return new Promise((resolve, reject) => {
        businessRef.update({
            business_name: name,
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

const updateAddress = async (address) => {

    const loading = Loading.fire({title: "Updating Address..."})

    return new Promise((resolve, reject) => {
        businessRef.update({
            business_address: address,
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

const updateCapacity = async (capacity) => {

    const loading = Loading.fire({title: "Updating Capacity..."})

    return new Promise((resolve, reject) => {
        businessRef.update({
            business_capacity: parseInt(capacity),
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

const updateMobile = async (mobile) => {

    const loading = Loading.fire({title: "Updating Mobile..."})

    return new Promise((resolve, reject) => {
        businessRef.update({
            business_mobile_no: mobile,
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

const updateTel = async (tel) => {

    const loading = Loading.fire({title: "Updating Telephone..."})

    return new Promise((resolve, reject) => {
        businessRef.update({
            business_tel_no: tel,
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

const updateEmail = async (email) => {

    const loading = Loading.fire({title: "Updating Email..."})

    return new Promise((resolve, reject) => {
        businessRef.update({
            business_email: email,
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

const updateGeopoint = async (latitude, longitude) => {

    const loading = Loading.fire({title: "Updating Geopoint..."})

    return new Promise((resolve, reject) => {
        businessRef.update({
            business_geopoint: new firebase.firestore.GeoPoint(
                Number(latitude.value),
                Number(longitude.value))
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

const updateNormalImage = async (image, url) => {
        // Create a reference to the file to delete
        const oldUrl = url
        const fileRef = firebase.storage().refFromURL(oldUrl)
    
        // Delete the file
        fileRef.delete().then(() => {
            console.log("Old Image Deleted!")
        }).catch((error) => {
            console.log("An Error has occured: ", error)
        });
    
        let imageUploadResult = await uploadImage(image, businessValues.name)
        let imageUrl = ""
    
        if(imageUploadResult == "Error") {
            console.log("An error has occured while uploading image")
        } else {
            imageUrl = imageUploadResult
        }
    
        return new Promise((resolve, reject) => {
            businessRef.update({
                business_img_url: imageUrl,
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

async function uploadImage(img, name) {
    return new Promise((resolve, reject) => {

        if(img == "") return resolve("Error");

        console.log(img.files[0]);

        let filenameSplit = img.value.split('\\')[2];
        //var filename = filenameSplit.split('.')[0];
        let filename = name;
        let extension = img.value.split('.')[1];
        //var fileLocation = "pics/businesses/" + +"/" + filename + "." + extension;
        let fileLocation = `pics/businesses/${filename}.${extension}`
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

const update360Image = async (image, url) => {
    // Create a reference to the file to delete
    const oldUrl = url
    const fileRef = firebase.storage().refFromURL(oldUrl)

    // Delete the file
    fileRef.delete().then(() => {
        console.log("Old Image Deleted!")
    }).catch((error) => {
        console.log("An Error has occured: ", error)
    });

    let imageUploadResult = await upload360Image(image, businessValues.name)
    let imageUrl = ""

    if(imageUploadResult == "Error") {
        console.log("An error has occured while uploading image")
    } else {
        imageUrl = imageUploadResult
    }

    return new Promise((resolve, reject) => {
        businessRef.update({
            business_360_image_url: imageUrl,
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

async function upload360Image(img, name) {
    return new Promise((resolve, reject) => {

        if(img == "") return resolve("Error");

        console.log(img.files[0]);

        let filenameSplit = img.value.split('\\')[2];
        //var filename = filenameSplit.split('.')[0];
        let filename = name;
        let extension = img.value.split('.')[1];
        //var fileLocation = "pics/businesses/" + +"/" + filename + "." + extension;
        let fileLocation = `pics/businesses/360/${filename}.${extension}`
        let imagesRef = storageRef.child(fileLocation)

        //console.log(test.files[0]);
        let uploadTask = imagesRef.put(img.files[0]);

        const progressSwal = Swal.fire({
            title: 'Uploading 360 Image',
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
                label.innerHTML = 'Uploading 360 Image'

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

business_name.on("input", function() {
    if(this.value != businessValues.name) {
        nameChanged = true
        save_btn.style.display = ""
    } else { 
        nameChanged = false
        save_btn.style.display = "none"
    }
});

owner_name.on("input", function() {
    if(this.value != businessValues.owner) {
        ownerChanged = true
        save_btn.style.display = ""
    } else { 
        ownerChanged = false
        save_btn.style.display = "none"
    }
});

address.on("input", function() {
    if(this.value != businessValues.address) {
        addressChanged = true
        save_btn.style.display = ""
    } else { 
        addressChanged = false
        save_btn.style.display = "none"
    }
});

maxCapacity.on("input", function() {
    if(this.value != businessValues.capacity) {
        capacityChanged = true
        save_btn.style.display = ""
    } else { 
        capacityChanged = false
        save_btn.style.display = "none"
    }
});

mobile_no.on("input", function() {
    if(this.value != businessValues.mobile_no) {
        mobileChanged = true
        save_btn.style.display = ""
    } else { 
        mobileChanged = false
        save_btn.style.display = "none"
    }
});

tel_no.on("input", function() {
    if(this.value != businessValues.tel_no) {
        telChanged = true
        save_btn.style.display = ""
    } else { 
        telChanged = false
        save_btn.style.display = "none"
    }
});

email.on("input", function() {
    if(this.value != businessValues.email) {
        emailChanged = true
        save_btn.style.display = ""
    } else { 
        emailChanged = false
        save_btn.style.display = "none"
    }
});

latitude.on("input", function() {
    if(this.value != businessValues.geopoint._lat) {
        latChanged = true
        save_btn.style.display = ""
    } else { 
        latChanged = false
        save_btn.style.display = "none"
    }
});

longitude.on("input", function() {
    if(this.value != businessValues.geopoint._long) {
        longChanged = true
        save_btn.style.display = ""
    } else { 
        longChanged = false
        save_btn.style.display = "none"
    }
});

$("#business_img").change(function() {
    const [file] = this.files;

    if (file) {
        imgChanged = true;
        save_btn.style.display = ""
        normalImage.attr('src', URL.createObjectURL(file))
        return
    } else {
        imgChanged = false;
        save_btn.style.display = "none"
        normalImage.attr('src', businessValues.img_url)
    }
})

$("#business_360_img").change(function() {
    const [file] = this.files;

    if (file) {
        img360Changed = true;
        save_btn.style.display = ""
        img360.attr('src', URL.createObjectURL(file))
        return
    } else {
        img360Changed = false;
        save_btn.style.display = "none"
        img360.attr('src', businessValues.img_360_url)
    }
})

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
