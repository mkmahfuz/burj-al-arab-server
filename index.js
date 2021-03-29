const express = require('express');
const cors = require('cors');
const app = express();
//get user/pass from env
require('dotenv').config();
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;

const port = 4000;

app.use(express.json());
app.use(cors());

app.get('/',(req, res) =>{
    res.send("hello world")
})

app.listen(port,()=>{
    console.log("I am listening at port: ",port)
})

//mongodb connection
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${dbUser}:${dbPass}@cluster0.lroqv.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true ,connectTimeoutMS: 30000,keepAlive: 1});
client.connect(err => {
  const collection = client.db("burjAlArab").collection("bookins");
  // perform actions on the collection object
  console.log('mongodb connection success');

  app.post('/addBooking',(req, res) => {
      const newBooking = req.body;
      collection.insertOne(newBooking)
      .then(result=>{
          res.send(result.insertedCount > 0);
          console.log(result.insertedCount);
      })
      //res.send(newBooking);
      console.log(newBooking);
  })
  app.get('/bookings',(req, res)=>{
      const qr = req.query.email;
      const token = req.headers.authorization;
      console.log(token);
      collection.find({email:qr}).toArray((err,docs)=>{res.send(docs)})
  })

  //client.close ta off kore dilam
  //client.close();
});
