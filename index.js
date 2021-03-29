const express = require('express');
const cors = require('cors');
const app = express();
const admin = require('firebase-admin');
//get user/pass from env
require('dotenv').config();
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;

const port = 4000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send("hello world")
})

app.listen(port, () => {
    console.log("I am listening at port: ", port)
})
//firebase token related codes
//firebaseConsole>settings>ServiceAccounts>Node/js code

const serviceAccount = require("./configs/burj-al-arab-24095-firebase-adminsdk-iprce-f29f422eb6.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});




//mongodb connection
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${dbUser}:${dbPass}@cluster0.lroqv.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, connectTimeoutMS: 30000, keepAlive: 1 });
client.connect(err => {
    const collection = client.db("burjAlArab").collection("bookins");
    // perform actions on the collection object
    console.log('mongodb connection success');

    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        collection.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0);
                console.log(result.insertedCount);
            })
        //res.send(newBooking);
        console.log(newBooking);
    })
    app.get('/bookings', (req, res) => {
        const qr = req.query.email;
        const bearer = req.headers.authorization;
        console.log(bearer);

        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            console.log('IDTOKEN:',idToken);
            // idToken comes from the client app -- this code is copied from firebase-adminSDK
            admin.auth()
                .verifyIdToken(idToken)
                .then((decodedToken) => {
                    const uid = decodedToken.uid;
                    const uemail = decodedToken.email;
                    if(uemail == qr){
                        collection.find({ email: qr }).toArray((err, docs) => { res.send(docs) });
                    }
                    // ...
                    console.log('UID:',uid)
                })
                .catch((error) => {
                    // Handle error
                });

        }
        else{
            res.status(401).send("Sorry Unaothorized Access");
        }




        
    })

    //client.close ta off kore dilam
    //client.close();
});
