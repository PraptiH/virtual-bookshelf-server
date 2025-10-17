const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Password}@cluster0.ndmztgi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });

        //books API
        const booksCollection = client.db('virtualBookshelf').collection('Books')

        app.get('/books', async (req, res) => {
            const result = await booksCollection.find().toArray()
            res.send(result)
        })

        app.post('/books', async (req, res) => {
            const newBook = req.body
            console.log(newBook)
            const result = await booksCollection.insertOne(newBook)
            res.send(result)
        })

        app.get('/books/:id', async(req,res)=>{
            const id = req.params.id
            const query = {_id: new ObjectId(id)}
            const result = await booksCollection.findOne(query)
            res.send(result)
        })



        //users API
        const usersCollection = client.db('virtualBookshelf').collection('users')

        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray()
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const userProfile = req.body;
            console.log(userProfile)

            const query = { email: userProfile.email }
            const updatedDoc = {
                $set: userProfile
            };
            const options = {
                upsert: true
            }
            const result = await usersCollection.updateOne(query, updatedDoc, options);
            if (result.upsertedId) {
                return res.send((result.upsertedId))
            }

            else {
                res.send(result)
            }
        })

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Books are on the way")
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})