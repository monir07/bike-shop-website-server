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
        const database = client.db('lifan_bike_db');
        // create database table or collection.
        const usersCollection = database.collection('users');
        const productCollection = database.collection('products');
        const orderCollection = database.collection('orders');
        const reviewCollection = database.collection('reviews');
        console.log("Database is Connected with server")


        //GET ALL Product API
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            products = await cursor.toArray();
            res.send({
                products
            });
        });

        // GET Single Product
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const package = await productCollection.findOne(query);
            res.send(package);
        })

        // POST API ADD SINGLE PRODUCT
        app.post('/product', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.json(result)
        });

        // POST API ADD ORDER 
        app.post('/place_order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result)
        });

        // POST API ADD REVIEW
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result)
        });

        //GET ALL REVIEW API
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            reviews = await cursor.toArray();
            res.send({
                reviews
            });
        });

        //GET ALL ORDER API
        app.get('/all-orders', async (req, res) => {
            const cursor = orderCollection.find({});
            orders = await cursor.toArray();
            res.send({
                orders
            });
        });

        //GET SPECIFIC USER ORDER
        app.get('/order/:email', async (req, res) => {
            const user_email = req.params.email;
            const query = { email: user_email };
            const cursor = orderCollection.find({ email: user_email });
            orders = await cursor.toArray();
            res.send(orders);
        })

        // DELETE SINGLE ORDER API
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        })

        // DELETE SINGLE PRODUCT API
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
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

        //GET ALL USERS API
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            users = await cursor.toArray();
            res.send({
                users
            });
        });

        // GET Single user api
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            res.send(user);
        })

        // ADD USER TO DB API
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        // ADD UPDATE OR INSERT USER TO DB API
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // ADD UPDATE SINGLE USER API
        app.put('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Bike Point server is running');
});

app.listen(port, () => {
    console.log('Server running at port', port);
})