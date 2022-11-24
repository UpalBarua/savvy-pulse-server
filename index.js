require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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

    app.get('/categories', async (req, res) => {
      const response = await categoriesCollection.find({}).toArray();
      res.json(response);
    });

    app.get('/categories/:type', async (req, res) => {
      const type = req.params.type;
      const response = await productsCollection.find({ type: type }).toArray();
      res.json(response);
    });
  } finally {
  }
};

run().catch((error) => console.log(error));

app.listen(port);
