
async function createTestConversation() {

    const today = firebase.firestore.Timestamp.fromDate(new Date());

    let users = {
        user1: "user1",
        user2: "user2"
    }

    let message = {
        date_sent: today,
        message: "this is a test message"
    }

    try {
        const conversationRef = db.collection("conversation");
        const docRef = await conversationRef.add(users);
        const subDocRef = await conversationRef.doc(docRef.id).collection("message").add(message);
    } catch (e) {
        console.error(e)
    }

}