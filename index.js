const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hkqyz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        // create database
        const database = client.db('tourism_db');
        // create database table or collection.
        const packageCollection = database.collection('packages');
        const orderCollection = database.collection('orders');
        console.log("Database is Connected with server")


        //GET ALL Package API
        app.get('/packages', async (req, res) => {
            const cursor = packageCollection.find({});
            packages = await cursor.toArray();
            res.send({
                packages
            });
        });

        // GET Single Package
        app.get('/packages/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const package = await packageCollection.findOne(query);
            res.send(package);
        })

        // POST API ADD SINGLE PACKAGE
        app.post('/package', async (req, res) => {
            const package = req.body;
            const result = await packageCollection.insertOne(package);
            res.json(result)
        });

        // POST API ADD ORDER 
        app.post('/place_order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result)
        });

        //GET ALL ORDER API
        app.get('/all-orders', async (req, res) => {
            const cursor = orderCollection.find({});
            orders = await cursor.toArray();
            res.send(
                orders
            );
        });

        //GET SPECIFIC USER ORDER
        app.get('/order/:email', async (req, res) => {
            const user_email = req.params.email;
            const query = { email: user_email };
            const cursor = orderCollection.find({ email: user_email });
            orders = await cursor.toArray();
            res.send(orders);
        })

        // DELETE API
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        })

        //UPDATE ORDER STATUS API
        app.put('/order/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: false };
            const updateDoc = {
                $set: {
                    "isApproved": "done",
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Tourism server is running');
});

app.listen(port, () => {
    console.log('Server running at port', port);
})