let html = '';

const welcomeHeader = document.querySelector('.content');

db.collection("businesses").where("business_owner_id", "==", uid)
    .get()
    .then((querySnapshot) => {
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                let business_name = data.business_name;
                let business_image_url = data.business_img_url;
                localStorage.setItem("background_url", business_image_url);
                document.body.style.backgroundImage = `url("${business_image_url}")`;
                const h1 = `<h1>Welcome ${business_name}!</h1>`;
                console.log(business_name);
                html += h1;
            });
            welcomeHeader.innerHTML += html;
        } else {
            console.log("No document found!");
        }
    }).catch((error) => {
        console.log("Error getting document: ", error);
    });
    