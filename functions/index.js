const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Expo } = require('expo-server-sdk');
const fetch = require('node-fetch');
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

  exports.botMessage = functions.region('asia-northeast2').firestore
    .document('THREADS/WIMi5WBba4N2XNtK5o5g/MESSAGES/{chatId}')
    .onCreate((snap, context) => {
      const newValue = snap.data();
      const comment = newValue.text;
      const u = newValue.user._id

      if (u != 'XVY0p3KFxVaaQtq25JwlwWafUbs1') {
        const params = new URLSearchParams();
        params.append('apikey', "DZZf7SoRWoozQmseljBkRKjvVKphwm8t");
        params.append('query', comment);
        fetch('https://api.a3rt.recruit-tech.co.jp/talk/v1/smalltalk',{
          method: 'post',
          body: params
        }).then(response => {
          response.json().then(data => {
            console.log(data.results[0].reply);
            const text = data.results[0].reply;
            const messageRef = db.collection('THREADS');
            messageRef
            .doc('WIMi5WBba4N2XNtK5o5g')
            .collection('MESSAGES')
            .add({
              text,
              createdAt: new Date().getTime(),
              user: {
                _id: 'XVY0p3KFxVaaQtq25JwlwWafUbs1',
                email: 'pineprobot@pinepro.ml',
                avatar: 'https://firebasestorage.googleapis.com/v0/b/kenmochat.appspot.com/o/avatar%2FXVY0p3KFxVaaQtq25JwlwWafUbs11621592754467?alt=media&token=f2366ddf-dc22-4977-a80c-496c5394c8fb',
                name: 'PINE pro BOT',
              }
            });
          })
        }).catch(error => console.log(error));
      } else { null }
  });