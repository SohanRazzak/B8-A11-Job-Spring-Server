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
    origin: ["http://localhost:5173/"],
    crendentials: true
}
dotenv.config();
app.use(express.json());
app.use(cors(corsConfig));
app.use(cookieParser());


// Connet to mongodb
const uri = process.env.DB_URI;


// Uncomment to ping database
// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     }
// });

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


// API Endpoints

    // Test Server
    app.get('/', (req, res)=>{
        res.send("Searching For Jobs............")
    })








// Listen to port
app.listen(port,()=>{
    console.log(`Running on port no: ${port}`)
})