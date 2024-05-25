// Imports
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import jwt from 'jsonwebtoken';


const app = express();
const port = process.env.PORT || 5000;

// middleware
const corsConfiguration = {
    origin: ["http://localhost:5173", "https://b8-a11-job-spring-server.onrender.com"],
    credentials: true
}
dotenv.config();
app.use(express.json());
app.use(cors(corsConfiguration));
app.use(cookieParser());


// custom middleware
// verify jwt
const verifyToken = async (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).send({ message: "Unauthorized Request!" })
    }
    jwt.verify(token, process.env.JWT_KEY, (error, decoded) => {
        if (error) {
            return res.status(401).send({ message: "Unauthorized Request!" })
        }
        req.jwtUserVerified = decoded;
        next();
    })
}


// Connet to mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.${process.env.DB_CLUSTER}.mongodb.net/?retryWrites=true&w=majority`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Uncomment to ping database
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


// Databases
const database = client.db("Job_Spring");
const userCollection = database.collection("userCollection");
const jobCollection = database.collection("jobCollection");
const appliedJobs = database.collection("appliedJobs");


// API Endpoints

// Get Methods

// Get user by UID [working]
app.get("/users/:uid", verifyToken, async (req, res) => {
    try {
        const uid = req.params.uid;
        if (uid !== req.jwtUserVerified.uid) {
            return res.status(403).send("Forbidden: User not found");
        }
        const filter = { uid: uid };
        const result = await userCollection.findOne(filter);
        res.send(result);
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

// Get Jobs Created By Me (by UID) [working]
app.get("/my-jobs/:uid", verifyToken, async (req, res) => {
    try {
        const uid = req.params.uid;
        if (uid !== req.jwtUserVerified.uid) {
            return res.status(403).send("Forbidden: User not found");
        }
        const filter = { publisher : req.jwtUserVerified.email };
        const result = await jobCollection.find(filter).toArray();
        res.send(result);
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
})

// Get Jobs With Query [working]
app.get("/get-all-jobs", async (req, res) => {
    try {
        const category = req.query.category || null;
        const filter = category ? { jobType: category} : {};
        const projection = { jobDescription: 0, companyThumb: 0};
        const cursor = jobCollection.find(filter).project(projection);
        const result = await cursor.toArray();
        res.send(result);
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
})

// Get Single Job Details Using _ID [working]
app.get("/job-details/:id", verifyToken, async(req, res)=>{
    try{
        const id = req.params.id;
        const filter = { _id : new ObjectId(id)};
        const result = await jobCollection.findOne(filter);
        res.send(result)
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
})

// Get applicants
app.get('/get-applications/:id', verifyToken, async (req, res)=>{
    try{
        const id = req.params.id;
        const filter = { jobId : id};
        const result = await appliedJobs.find(filter).toArray();
        res.send(result)
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
})

// Post Methods

// Create User [working]
app.post("/users", async (req, res) => {
    try {
        const user = req.body;
        const result = await userCollection.insertOne(user);
        res.send(result)
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
})

// JWT Generator [working]
app.post("/jwt", async (req, res) => {
    try {
        const jwtUser = req.body;
        const token = jwt.sign(jwtUser, process.env.JWT_KEY, {
            expiresIn: "2h"
        })
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 2
        }).send({ success: true })
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
})


// Logout User [working]
app.post("/logout", async (req, res) => {
    res.clearCookie('token').send({ message: "logout successfull!" })
})

// Add a Job [working]
app.post("/add-job", verifyToken, async (req, res) => {
    try {
        const newJob = req.body;
        if (newJob.publisher !== req.jwtUserVerified.email) {
            return res.status(403).send("Forbidden: User not found");
        }
        const result = await jobCollection.insertOne(newJob);
        res.send(result)
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
})

// Apply new job [add to appliedJobs Collection]
app.post("/apply-job", verifyToken, async (req, res)=>{
    try{
        const appliedJob = req.body;
        console.log(appliedJob);
        const result = await appliedJobs.insertOne(appliedJob);
        res.send(result)
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
})

// Put

// Updating Job [working]
app.patch('/update-my-job/:id', verifyToken, async(req,res)=>{
    try {
        const id = req.params.id;
        const updatedJob = req.body;
        if (updatedJob.email !== req.jwtUserVerified.email) {
            return res.status(403).send("Forbidden: User not found");
        }
        const filter = { _id : new ObjectId(id)};
        const setUpdatedJob = {
            $set: {
                ...updatedJob
            }
        }
        
        const result = await jobCollection.updateOne(filter, setUpdatedJob);
        res.send(result)
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
})

// Login User By Social [working]
app.put("/users", async (req, res) => {
    try {
        const user = req.body;
        const options = { upsert: true };
        const filter = { email: user.email }
        const updatedUser = {
            $set: {
                ...user
            }
        }
        const result = await userCollection.updateOne(filter, updatedUser, options);
        res.send(result)
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
})



// Test Server
app.get('/', async (req, res) => {
    res.send("Searching For Jobs............")
})








// Listen to port
app.listen(port, () => {
    console.log(`Running on port no: ${port}`)
})