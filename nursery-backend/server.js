const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// DB
mongoose.connect('mongodb://localhost:27017/nursery');

// MODELS
const Parent = mongoose.model('Parent', new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  children: [String]
}));

const Child = mongoose.model('Child', new mongoose.Schema({
  name: String,
  dob: Date,
  room: String,
  parentId: String,
  journals: Array,
}));

const Staff = mongoose.model('Staff', new mongoose.Schema({
  name: String,
  role: String,
  hourlyRate: Number,
  rota: Array,
  timesheets: Array
}));

const Invoice = mongoose.model('Invoice', new mongoose.Schema({
  parentId: String,
  childId: String,
  amount: Number,
  dueDate: Date,
  status: String,
  paymentId: String
}));

// ROUTES
app.post('/parents', async (req, res) => {
  const parent = await Parent.create(req.body);
  res.json(parent);
});

app.post('/children', async (req, res) => {
  const child = await Child.create(req.body);
  res.json(child);
});

app.get('/children', async (req, res) => {
  const children = await Child.find();
  res.json(children);
});

app.post('/journal', async (req, res) => {
  const { childId, entry } = req.body;
  const child = await Child.findById(childId);
  child.journals.push(entry);
  await child.save();
  res.json(child);
});

app.post('/invoice', async (req, res) => {
  const invoice = await Invoice.create(req.body);
  res.json(invoice);
});

app.get('/staff', async (req, res) => {
  const staff = await Staff.find();
  res.json(staff);
});

app.post('/staff', async (req, res) => {
  const staff = new Staff(req.body);
  await staff.save();
  res.send(staff);
});

app.listen(4000, () => console.log('Backend running on 4000'));
