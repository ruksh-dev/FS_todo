const mongoose = require('mongoose');
const zod = require('zod');
const path=require('path');
require("dotenv").config({path: path.resolve(__dirname, '../.env')})
const db_URI=process.env.DB_URI;
mongoose.connect(db_URI)
  .then(() => console.log('db connected'))
    .catch(err => console.log("db not connecteed, error:"+err));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  todos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Todo'
  }]
});
const todoSchema = new mongoose.Schema({
  title: { type: String, required:true},
  description: { type: String, required: true },
  markAsDone: { type: Boolean, default: false },
});
const User = mongoose.model('User', userSchema);
const Todo = mongoose.model('Todo', todoSchema);
module.exports = {
  User,
  Todo
}
