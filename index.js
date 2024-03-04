// Imports
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { MongoClient, ServerApiVersion } from 'mongodb';


const app = express();
const port = process.env.PORT || 5000;

// middleware
const corsConfig = {
    origin: "http://localhost:5173",
    crendentials: true
}
dotenv.config();
app.use(express.json());
app.use(cors(corsConfig));
app.use(cookieParser());


// Connet to mongodb
const uri = process.env.DB_URI;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Uncomment to ping database
// async function run() {
//     try {
//         // Connect the client to the server	(optional starting in v4.7)
//         await client.connect();
//         // Send a ping to confirm a successful connection
//         await client.db("admin").command({ ping: 1 });
//         console.log("Pinged your deployment. You successfully connected to MongoDB!");
//     } finally {
//         // Ensures that the client will close when you finish/error
//         // await client.close();
//     }
// }
// run().catch(console.dir);


// Databases
const database = client.db("Job_Spring");
const userCollection = database.collection("userCollection");


// API Endpoints

// Get

// Post
app.post("/users", async (req, res) => {
    try {
        const user = req.body;
        const result = await userCollection.insertOne(user);
        res.send(result)
    }
    catch (error) {
        console.log(error);
    }
})

// Put
app.put("/users", async(req, res)=>{
    const user = req.body;
    const options = { upsert: true };
    const filter = { email: user.email }
    const updatedUser = {
        $set : {
            ...user
        }
    }
    const result = await userCollection.updateOne(filter, updatedUser, options);
    res.send(result)
})



// Test Server
app.get('/', (req, res) => {
    res.send("Searching For Jobs............")
})








// Listen to port
app.listen(port, () => {
    console.log(`Running on port no: ${port}`)
})