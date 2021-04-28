const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Expo } = require('expo-server-sdk');
admin.initializeApp();

const db = admin.firestore();
const expo = new Expo();

exports.sendMessage = functions.region('asia-northeast2').firestore
  .document('talk/{talkId}')
  .onUpdate((change, context) => {
    const newValue = change.after.data();
    const text = newValue.latestMessage.text;
    const talkName = newValue.name;
    const members = newValue.members;
    const email = newValue.latestMessage.email;
    // console.log(name,text,members)

    for (const elem of members) {
      const message = [];
      const userRef = db.collection('tokens').doc(elem)
      userRef.get().then((doc) => {
        if (doc.exists) {
          const data = doc.data()
          const token = data.token
          const id = data.email
          if (id != email) {
            message.push({
              to: token,
              sound: 'default',
              title: talkName,
              body: text,
            });
          console.log(message)
          expo.sendPushNotificationsAsync(message)
          } else { null }
        } else { null }
      })
    }
  });
