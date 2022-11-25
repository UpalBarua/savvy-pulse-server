require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('SavvyPulse server running...');
});

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.4w0vbzl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const categoriesCollection = client
      .db('savvy-pulse')
      .collection('categories');

    const productsCollection = client.db('savvy-pulse').collection('products');
    const usersCollection = client.db('savvy-pulse').collection('users');

    app.get('/categories', async (req, res) => {
      const response = await categoriesCollection.find({}).toArray();
      res.json(response);
    });

    app.get('/products/:type', async (req, res) => {
      const type = req.params.type;
      const response = await productsCollection.find({ type: type }).toArray();
      res.json(response);
    });

    app.post('/products/new', async (req, res) => {
      const newProduct = req.body;
      const response = await productsCollection.insertOne(newProduct);
      res.json(response);
    });

    app.get('/my-products/:email', async (req, res) => {
      const email = req.params.email;
      const response = await productsCollection
        .find({ seller: email })
        .toArray();
      res.json(response);
    });

    app.patch('/my-products/sell/:id', async (req, res) => {
      const id = req.params.id;
      const product = await productsCollection.findOne({ _id: ObjectId(id) });

      const updatedDoc = {
        $set: {
          isAvailable: !product.isAvailable,
        },
      };

      const response = await productsCollection.updateOne(
        { _id: ObjectId(id) },
        updatedDoc
      );

      res.json(response);
    });

    app.delete('/my-products/delete/:id', async (req, res) => {
      const id = req.params.id;
      const response = await productsCollection.deleteOne({
        _id: ObjectId(id),
      });
      res.json(response);
    });

    app.patch('/my-products/advertisements/:id', async (req, res) => {
      const id = req.params.id;
      const product = await productsCollection.findOne({ _id: ObjectId(id) });

      const updatedDoc = {
        $set: {
          isAdvertised: !product.isAdvertised,
        },
      };

      const response = await productsCollection.updateOne(
        { _id: ObjectId(id) },
        updatedDoc
      );

      res.json(response);
    });

    app.post('/user/new', async (req, res) => {
      const newUser = req.body;
      const response = await usersCollection.insertOne(newUser);
      res.json(response);
    });

    app.get('/user/type/:email', async (req, res) => {
      const email = req.params.email;
      const response = await usersCollection.findOne({ email: email });
      res.json(response.type);
    });
  } finally {
  }
};

run().catch((error) => console.log(error));

app.listen(port);
