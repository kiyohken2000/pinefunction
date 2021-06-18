const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Expo } = require('expo-server-sdk');
const fetch = require('node-fetch');
const axios = require("axios");
const request = require('request')
const arr = require('./shinzo');
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
    const previousValue = change.before.data();
    const newTime = newValue.latestMessage.createdAt;
    const prevTime = previousValue.latestMessage.createdAt;
    // console.log(name,text,members)

    if (newTime != prevTime) {
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
    } else { null }
  });

  exports.botMessage = functions.region('asia-northeast2').firestore
    .document('THREADS/Dj04ExLoykNI2sbmOVeW/MESSAGES/{chatId}')
    .onCreate((snap, context) => {
      const newValue = snap.data();
      const comment = newValue.text;
      const u = newValue.user._id;

      if (comment && comment != 'kenmo') {
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
              .doc('Dj04ExLoykNI2sbmOVeW')
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
      } else { null }
  });

  exports.imageBotMessage = functions.region('asia-northeast2').firestore
    .document('THREADS/Dj04ExLoykNI2sbmOVeW/MESSAGES/{chatId}')
    .onCreate((snap, context) => {
      const newValue = snap.data();
      const image = newValue.image;
      const messageRef = db.collection('THREADS').doc('Dj04ExLoykNI2sbmOVeW').collection('MESSAGES');
      const t = new Date().getTime();
      const u = {
        _id: 'cYx7BY4HJWVL7KT7iAelCwiDaUl2',
        email: 'pinproimagebot@pinepro.ml',
        avatar: 'https://firebasestorage.googleapis.com/v0/b/kenmochat.appspot.com/o/avatar%2FcYx7BY4HJWVL7KT7iAelCwiDaUl21622003719314?alt=media&token=c4f520cb-4591-4670-b17d-9c96caaab08c',
        name: 'PINE pro image BOT',
      };
      const us = {
        _id: 'GrB69PO5oyaTTXbRmLJYqcKGFzf2',
        email: 'pineproimagebot@pinepro.ml',
        avatar: 'https://firebasestorage.googleapis.com/v0/b/kenmochat.appspot.com/o/avatar%2FGrB69PO5oyaTTXbRmLJYqcKGFzf21622094941027?alt=media&token=b82d4765-e603-46eb-ad8e-c213e286e2b0',
        name: 'PINE pro image BOT',
      };
      const apiKey = 'AIzaSyAwHurWva6sJxhhIFiqTr3oqN5G_P4d0_8';
      const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
      const options = {
        requests: [
          {
            "features": [
              {
                "maxResults": 5,
                "type": "LABEL_DETECTION"
              }
            ],
            "image": {
              "source": {
                "imageUri": image
              }
            }
          }
        ]        
      };
      const COMPUTER_VISION_API_ENDPOINT_URL = 'https://japaneast.api.cognitive.microsoft.com/vision/v3.2/analyze?visualFeatures=Description&language=ja&model-version=latest';
      const configCustomVisionAPI = {
        url: COMPUTER_VISION_API_ENDPOINT_URL,
        method: 'post',
        headers: {
          'Content-type': 'application/json',
          'Ocp-Apim-Subscription-Key':'85af9ada81b445b3adfcf8094c4d6e78'
        },
        data: {
          url:image
        }
      };

      if (image) {
        (async function () {
          try {
            const result = await axios.post(visionApiUrl, options);
            console.log("Request success!");
            if (result.data) {
              const labels = await result.data.responses[0].labelAnnotations;
              if (labels) {
                const descriptions = await labels.map(label => label.description);
                const dStr = descriptions.join('か');
                const text = `これは${dStr} たぶんね`;
                console.log(text);
                messageRef
                .add({
                  text,
                  createdAt: t,
                  user: u
                });
              } else {
                const text = 'わからん';
                console.log(text);
                messageRef
                .add({
                  text,
                  createdAt: t,
                  user: u
                });
              }
            } else {
              const text = 'わからん';
              console.log(text);
              messageRef
              .add({
                text,
                createdAt: t,
                user: u
              });
            }
          } catch (error) {
            console.error('error', error.response || error);
          }
          try {
            const response = await axios.request(configCustomVisionAPI);
            console.log(response.data.description.captions[0].text)
            const res = response.data.description.captions[0].text
            const ti = new Date().getTime();
            if(res) {
              const text = `あるいは ${res} かも`;
              messageRef
              .add({
                text,
                createdAt: ti,
                user: us
              });
            } else {
              const text = 'やっぱりわからん';
              messageRef
              .add({
                text,
                createdAt: ti,
                user: us
              });
            }
          } catch (error) {
            console.log("post Error");
            console.error(error);
          }
        })();
      } else { null }
  });

  exports.kenmoBotMessage = functions.region('asia-northeast2').firestore
    .document('THREADS/Dj04ExLoykNI2sbmOVeW/MESSAGES/{chatId}')
    .onCreate((snap, context) => {
      const newValue = snap.data();
      const comment = newValue.text;
      const messageRef = db.collection('THREADS').doc('Dj04ExLoykNI2sbmOVeW').collection('MESSAGES');
      const t = new Date().getTime();
      const u = {
        _id: 'XVY0p3KFxVaaQtq25JwlwWafUbs1',
        email: 'pineprobot@pinepro.ml',
        avatar: 'https://firebasestorage.googleapis.com/v0/b/kenmochat.appspot.com/o/avatar%2FXVY0p3KFxVaaQtq25JwlwWafUbs11621592754467?alt=media&token=f2366ddf-dc22-4977-a80c-496c5394c8fb',
        name: 'PINE pro BOT',
      };
      const options = {
        url: 'https://itest.5ch.net/subbacks/poverty.json',
        method: 'GET',
        json: true
      }

      if (comment === 'kenmo') {
        request(options, function (error, response, body) {
          console.log('現在のスレッド数',body.total_count);
          const threads = body.threads;
          const titles = threads.map(thread => thread[5]);
          const tts = titles.slice(0, 10)
          const top = tts.join('\n');
          console.log(top)
          const text = top;
            messageRef
            .add({
              text,
              createdAt: t,
              user: u
            });
          if (error) {
            const text = '失敗、嫌儲落ちてるかも';
              messageRef
              .add({
                text,
                createdAt: t,
                user: u
              });
          }
        })
      } else { null }
  });

  exports.translation = functions.region('asia-northeast2').firestore
    .document('THREADS/o65qDbjlphSbs281TDX3/MESSAGES/{chatId}')
    .onCreate((snap, context) => {
      const newValue = snap.data();
      const comment = newValue.text;
      const user = newValue.user._id;
      const messageRef = db.collection('THREADS').doc('o65qDbjlphSbs281TDX3').collection('MESSAGES');
      const t = new Date().getTime();
      const u = {
        _id: 'vScvjdhKU8VgjrIwINThWEAYUro1',
        email: 'pineprotranslation@pinepro.ml',
        avatar: 'https://firebasestorage.googleapis.com/v0/b/kenmochat.appspot.com/o/avatar%2FvScvjdhKU8VgjrIwINThWEAYUro11622597058533?alt=media&token=ee015141-d7b5-4d1c-919a-8067b642f26a',
        name: 'PINE pro translation BOT ru',
      };

      const fromLang = 'ja'
      const toLang = 'ru'
      const apiKey = 'AIzaSyAwHurWva6sJxhhIFiqTr3oqN5G_P4d0_8'

      const URL = "https://translation.googleapis.com/language/translate/v2?key="+apiKey+"&q="+encodeURI(comment)+"&source="+fromLang+"&target="+toLang
      const options = {
        url: URL,
        method: 'GET',
        json: true
      }

      if (user != 'vScvjdhKU8VgjrIwINThWEAYUro1') {
        request(options, function (error, response, body) {
          console.log(body.data.translations[0].translatedText);
          const text = body.data.translations[0].translatedText;
            messageRef
            .add({
              text,
              createdAt: t,
              user: u
            });
          if (error) {
            const text = 'わからん';
              messageRef
              .add({
                text,
                createdAt: t,
                user: u
              });
          }
        })
      } else { null }
  });

  exports.translationKr = functions.region('asia-northeast2').firestore
    .document('THREADS/T5XMlAahT3dWwHfxFnqH/MESSAGES/{chatId}')
    .onCreate((snap, context) => {
      const newValue = snap.data();
      const comment = newValue.text;
      const user = newValue.user._id;
      const messageRef = db.collection('THREADS').doc('T5XMlAahT3dWwHfxFnqH').collection('MESSAGES');
      const t = new Date().getTime();
      const u = {
        _id: 'XkBevYAjDDQO04UW8MGDTrPL4063',
        email: 'pineprotranslationkr@pinepro.ml',
        avatar: 'https://firebasestorage.googleapis.com/v0/b/kenmochat.appspot.com/o/avatar%2FXkBevYAjDDQO04UW8MGDTrPL40631622597137740?alt=media&token=b23141bd-95bb-4916-9c96-28e339e87e96',
        name: 'PINE pro translation kr',
      };

      const fromLang = 'ja'
      const toLang = 'ko'
      const apiKey = 'AIzaSyAwHurWva6sJxhhIFiqTr3oqN5G_P4d0_8'

      const URL = "https://translation.googleapis.com/language/translate/v2?key="+apiKey+"&q="+encodeURI(comment)+"&source="+fromLang+"&target="+toLang
      const options = {
        url: URL,
        method: 'GET',
        json: true
      }

      if (user != 'XkBevYAjDDQO04UW8MGDTrPL4063') {
        request(options, function (error, response, body) {
          console.log(body.data.translations[0].translatedText);
          const text = body.data.translations[0].translatedText;
            messageRef
            .add({
              text,
              createdAt: t,
              user: u
            });
          if (error) {
            const text = 'わからん';
              messageRef
              .add({
                text,
                createdAt: t,
                user: u
              });
          }
        })
      } else { null }
  });

  exports.abeBotMessage = functions.region('asia-northeast2').firestore
    .document('THREADS/zBVTu3ZWHN69NEuBfU0P/MESSAGES/{chatId}')
    .onCreate((snap, context) => {
      const newValue = snap.data();
      const u = newValue.user._id;
      const text = arr[Math.floor(Math.random() * arr.length)]

      if ( u != 'Phy7XmUDoeTwQswXI5hXli9Pnrx1') {
        const messageRef = db.collection('THREADS');
        messageRef
        .doc('zBVTu3ZWHN69NEuBfU0P')
        .collection('MESSAGES')
        .add({
          text,
          createdAt: new Date().getTime(),
          user: {
            _id: 'Phy7XmUDoeTwQswXI5hXli9Pnrx1',
            email: 'abeshinzo@kantei.go.jp',
            avatar: 'https://firebasestorage.googleapis.com/v0/b/kenmochat.appspot.com/o/avatar%2FPhy7XmUDoeTwQswXI5hXli9Pnrx11623930608603?alt=media&token=151d49f9-aa2b-40b7-8848-00d2cc047e51',
            name: '安倍晋三公式✅',
          }
        });
        messageRef
        .doc('zBVTu3ZWHN69NEuBfU0P')
        .set(
          {
            latestMessage: {
              text,
              avatar: 'https://firebasestorage.googleapis.com/v0/b/kenmochat.appspot.com/o/avatar%2FPhy7XmUDoeTwQswXI5hXli9Pnrx11623930608603?alt=media&token=151d49f9-aa2b-40b7-8848-00d2cc047e51',
              createdAt: new Date().getTime()
            }
          },
          { merge: true }
        );
      }
  });
