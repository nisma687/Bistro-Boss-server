const express =require('express');
const app = express();
const port=process.env.PORT || 5000;
const cors = require('cors');

app.use(cors());
app.use(express.json());
require('dotenv').config();
// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASS);
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.231nuf3.mongodb.net/?retryWrites=true&w=majority`;

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

    const menuCollection = client.db("bistroDb").collection("menu");
    const reviewCollection = client.db("bistroDb").collection("reviews");
    const cartCollection = client.db("bistroDb").collection("carts");
    const userCollection=client.db("bistroDb").collection("users");

    // storing users
    app.patch('/users/admin/:id',
    async(req,res)=>{
      const id=req.params.id;
      const filter={_id:new ObjectId(id)};
      const updatedDoc={ 
        $set:{
          role:'admin' 
        }
      }
      const result=await userCollection.updateOne(filter,updatedDoc);
      res.send(result);
      
    })
    app.get('/users',async(req,res)=>{
      const result=await userCollection.find();
      const data=await result.toArray();
      res.send(data);
    })
    app.delete('/users/:id',async(req,res)=>{
      const id=req.params.id;
      const result=await userCollection.deleteOne({_id:new ObjectId(id)});
      res.send(result);
    })
    app.post('/users',async(req,res)=>{
      const user=req.body;
      // if user exists don't insert data in database
      const query={email:user.email};
      const existingUser=await userCollection.findOne(query);
      if(existingUser){
       return res.send({message:'user already exists',insertedId:null});
      }
      const result=await userCollection.insertOne(user);
      res.send(result);
    })



    // menu
    app.get('/menu',async(req,res)=>{

        const request = await menuCollection.find();
        const result = await request.toArray();
        res.send(result);

    })
    // carts 
    app.get('/carts',async(req,res)=>{
      const email=req.query.email;
      // console.log(email);
      const result=await cartCollection.find({email:email});
      const data=await result.toArray();
      res.send(data);
    
    })
    app.delete('/carts/:id',async(req,res)=>{
      const id=req.params.id;
      const result=await cartCollection.deleteOne({_id:new ObjectId(id)});
      res.send(result);
    })

    app.post('/carts',async(req,res)=>{
        const cart=req.body;
        const result=await cartCollection.insertOne(cart);
        res.send(result);
    })
    app.get('/reviews',async(req,res)=>{
        const request = await reviewCollection.find();
        const result = await request.toArray();
        res.send(result);

    })
   





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
 

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('Bistro Boss Restaurant is running');
})
app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})