const { Router } = require("express");
const router = Router();
const userMiddleware  = require('../middlewares/userMiddleware');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, Todo } = require('../db/index');
const saltRounds = 10;
const path=require('path');
require("dotenv").config({path: path.resolve(__dirname, '../.env')})
const jwtPassword = process.env.jwtPasswd;

async function userCheck(req,res,next){
  const username=req.headers.username;
  const user=await User.findOne({username});
  if(user) return res.status(409).json({msg:'user already exists'});
  next();
}

//signup
router.post('/signup', userCheck, async (req, res) => {
  const username = req.headers.username;
  const password = req.headers.password;
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    const newUser = new User({
      username,
      password: hash
    });
    await newUser.save();
    return res.status(200).json({ msg: 'user created successfully' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: 'internal server error' });
  }
});

//signin
router.get('/signin', async (req, res) => {
  const username = req.headers.username;
  const password = req.headers.password;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ msg: 'email not registered' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ msg: 'incorrect password' });
    const token = jwt.sign({ username }, jwtPassword);
    return res.status(200).json({ token });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: 'internal server error' });
  }
});

//view todo
router.get('/view_todos',userMiddleware,async (req,res)=>{
  const username=req.headers.username;
  try{
    const usertodos=await User.findOne({username}).select('todos -_id').populate({
      path:'todos',
      select:'-__v'
    });
    return res.status(200).json(usertodos);
  }catch(err){
    console.log(err);
    return res.status(500).json({msg:'internal server error'});
  }
});

//create todo
router.post('/create_todo', userMiddleware, async (req, res) => {
  const username = req.headers.username;
  const todos = req.body;
  try{
  const newTodo = new Todo({
    title: todos.title,
    description: todos.description,
  });
  const response = await newTodo.save();
  const oid=response._id;
  const updated = await User.findOneAndUpdate({ username }, { $push: { todos: oid } }, { new: true });
  console.log(updated);
  return res.status(200).json({ msg: 'todo created successfully' });
  }catch(err){
    console.log(err);
    return res.status(500).json({msg:'internal server error'});
  }
});

//edit todo
router.put('/edit_todo', userMiddleware, async (req, res) => {
  const username = req.headers.username;
  const {_id,title,description,markAsDone}=req.body;
  //check this id is a valid of this user
  try{
  const user=await User.findOne({username});
  const match=user.todos.some(id=>id.equals(_id));
  if(!match) return res.status(409).json({msg:'invalid todo!'});
  //update the todo
  const updatedtodo=await Todo.findOneAndUpdate(
    {_id},
    {title,description,markAsDone},
    {new:true,runValidators:true}
  );
  console.log(updatedtodo);
  return res.status(200).json({msg:'updated todo successfully'});
  }catch(err){
    console.log(err);
    return res.status(500).json({msg:'internal server error'});
  }
});

//delete todo
router.delete('/delete_todo',userMiddleware,async (req,res)=>{
  const username=req.headers.username;
  const _id=req.body._id;
  try{
    const user=await User.findOne({username});
    const index=user.todos.indexOf(_id);
    if(index==-1) return res.status(401).json({msg:'invalid todo'});
    const deletedTodo=user.todos[index];
    user.todos.splice(index,1);
    await user.save();
    await Todo.findByIdAndDelete(_id);
    return res.status(200).json({msg:'todo deleted successfully'});
  }catch(err){
    console.log(err);
    return res.status(500).json({msg:'internal server error'});
  }
});


module.exports = router;
