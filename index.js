require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) => {
  const requestHeaders = req.headers.authorization;

  if (!requestHeaders) {
    res.status(401).send('unauthorized access');
  }

  const token = requestHeaders.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded) => {
    if (error) {
      res.status(403).send({ message: 'forbidden access' });
    }

    req.decoded = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.4w0vbzl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

app.get('/', (req, res) => {
  res.send('SavvyPulse server running...');
});

const run = async () => {
  try {
    const categoriesCollection = client
      .db('savvy-pulse')
      .collection('categories');

    const productsCollection = client.db('savvy-pulse').collection('products');
    const usersCollection = client.db('savvy-pulse').collection('users');
    const blogCollection = client.db('savvy-pulse').collection('blog');
    const ordersCollection = client.db('savvy-pulse').collection('orders');

    app.get('/categories', async (req, res) => {
      const response = await categoriesCollection.find({}).toArray();
      res.json(response);
    });

    app.get('/orders', verifyJWT, async (req, res) => {
      const email = req.query.email;
      const response = await ordersCollection.find({ email: email }).toArray();
      res.json(response);
    });

    app.post('/orders', async (req, res) => {
      const newPurchase = req.body;
      const response = await ordersCollection.insertOne(newPurchase);
      res.json(response);
    });

    app.get('/blog', async (req, res) => {
      const response = await blogCollection.find({}).toArray();
      res.json(response);
    });

    app.get('/products/:type', verifyJWT, async (req, res) => {
      const type = req.params.type;
      const response = await productsCollection.find({ type: type }).toArray();
      res.json(response);
    });

    app.get('/my-products/wishlist', verifyJWT, async (req, res) => {
      const response = await productsCollection
        .find({ isWishListed: true })
        .toArray();
      res.json(response);
    });

    app.get('/my-products/advertised', verifyJWT, async (req, res) => {
      const response = await productsCollection
        .find({ isAdvertised: true })
        .toArray();
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

    app.get('/user/all/', verifyJWT, async (req, res) => {
      const type = req.query.type;
      const response = await usersCollection.find({ type: type }).toArray();
      res.json(response);
    });

    app.delete('/user/delete/:id', async (req, res) => {
      const id = req.params.id;
      const response = await usersCollection.deleteOne({
        _id: ObjectId(id),
      });
      res.json(response);
    });

    app.patch('/user/verify/:id', async (req, res) => {
      const id = req.params.id;
      const seller = await usersCollection.findOne({ _id: ObjectId(id) });

      const updatedDoc = {
        $set: {
          isVerified: !seller.isVerified,
        },
      };

      const response = await usersCollection.updateOne(
        { _id: ObjectId(id) },
        updatedDoc
      );

      res.json(response);
    });

    app.get('/user/seller/verify/:email', async (req, res) => {
      const email = req.params.email;
      const response = await usersCollection.findOne({ email: email });
      res.send(response?.isVerified);
    });

    app.patch('/my-products/wishlist/new/:id', async (req, res) => {
      const id = req.params.id;
      const product = await productsCollection.findOne({ _id: ObjectId(id) });

      const updatedDoc = {
        $set: {
          isWishListed: !product.isWishListed,
        },
      };

      const response = await productsCollection.updateOne(
        { _id: ObjectId(id) },
        updatedDoc
      );

      res.json(response);
    });

    app.get('/jwt', async (req, res) => {
      const email = req.query.email;
      const response = await usersCollection.findOne({ email: email });

      if (response?.email) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: '1h',
        });
        return res.json({ accessToken: token });
      }

      res.status(403).json({ accessToken: '' });
    });
  } finally {
  }
};

run().catch((error) => console.log(error));

app.listen(port);
