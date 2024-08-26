import React, {  useState,useEffect } from 'react';

export default function App() {
    const [todoList,setTodoList]=useState([]);
    const [isSigned,setIsSigned]=useState(false);
    const [userExists,setUserExists]=useState(false);
    {useEffect(()=>{
      async function fetchData(){
      const isSigned=await CheckSignedIn({setTodoList});
      setIsSigned(isSigned);
      }
      fetchData();
    },[])}

    return (
      <>
      {(isSigned)?(
        <>
        <SignOut setIsSigned={setIsSigned} setTodoList={setTodoList} />
        <AddTodo setTodoList={setTodoList} />
        <ViewToDo todoList={todoList} setTodoList={setTodoList} />
        </>
      ):(
        <>
        {(userExists)?(
            <>
            <SignIn setIsSigned={setIsSigned} setTodoList={setTodoList} />
            </>):(
            <>
            <SignUp />
            </>)}
        <TopButton userExists={userExists} setUserExists={setUserExists} />
     </>
      )}
      </>
    )
}

function TopButton(props){
    function topbtn(){
        props.setUserExists(!props.userExists);
    }
    return (
        <>
        {(props.userExists)?(
            <>
            <button id="topBtn" onClick={topbtn} >Sign Up</button>
            </>
        ):(
            <>
            <button id="topBtn" onClick={topbtn} >Sign In</button>
            </>
        )

        }
        </>
    )
}
function SignUp(){
    const [msg,setMsg]=useState('');
    async function cleanMsg(){
        setTimeout(()=>{
            setMsg('');
        },4000)
    }
    async function doSignUp(){
        const username=document.getElementById('username').value;
        const password=document.getElementById('password').value;
        try{
        const res=await fetch('http://localhost:3000/user/signup',{
            method:"POST",
            headers:{
                'Content-Type':'application/json',
                username,
                password
            }
        })
        document.getElementById('username').value='';
        document.getElementById('password').value='';
        const data=await res.json();
        setMsg(data.msg);
        cleanMsg();
        if(!res.status===200){
            throw new Error("some error occured");
        }
        }catch(err){
           console.log(err)
            }
    }
    return (
        <>
        <input type="text" placeholder='enter username' id="username"></input>
        <br />
        <input type="password" placeholder='enter password' id='password'></input>
        <br />
        <button onClick={doSignUp}>Sign Up</button>
        <p>{msg}</p>
        </>
    )
}

async function CheckSignedIn({setTodoList}){
  const token=localStorage.getItem('token')
  console.log(token)
  if(!token) return false;
  try{
  const todos=await GetTodoList();
  setTodoList(todos);
  return true;
  }catch(err){
    console.log(err);
    return false;
  }

}


function SignOut(props){
    function DoSignOut(){
        localStorage.removeItem('token');
        {props.setTodoList([])}
        {props.setIsSigned(false)}
    }
    return (
        <button id="signout" onClick={DoSignOut}>Sign Out</button>
    )
}
function SignIn(props){
   const [errMsg,setErrMsg]=useState('');
    async function DoSignIn(){
        const username=document.getElementById("username").value;
        const password=document.getElementById("password").value;
        try{
        const res=await fetch("http://localhost:3000/user/signin",{
            method:"GET",
            headers:{
                username,
                password
            }
        });
            const data=await res.json();
            if(res.status===200){
            localStorage.setItem('token',data.token);
            {props.setIsSigned(true)}
            const todos=await GetTodoList();
            {props.setTodoList(todos)}
            }else{
              setErrMsg(data.msg);
            }
        }catch(err){
            console.log(err)
        }
    }
    return (
        <div id="signin">
            <input type="text" id="username" placeholder="enter username"></input>
            <br />
            <input id="password" type="password" placeholder="enter passwrod"></input>
            <br />
            <button id="sigin_button" onClick={DoSignIn}>Sign In</button>
            {errMsg && <p>{errMsg}</p>}
        </div>
    )
}

function AddTodo({setTodoList}){
    async function onclickhandler(){
        const token=localStorage.getItem('token');
        const titleElement=document.getElementById("ip_title");
        const descriptionElement=document.getElementById("ip_description");
        const title=titleElement.value;
        const description=descriptionElement.value;
        console.log(title+" "+description);
        try{
        const res=await fetch("http://localhost:3000/user/create_todo",{
            method:"POST",
            headers:{
                'authorization':`Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body:JSON.stringify({
              title: title,
              description: description
            })
        });
            titleElement.value="";
            descriptionElement.value="";
            const todos=await GetTodoList();
            setTodoList(todos);
            console.log("success "+res);
        }catch(err){
            console.log(err);
        }
    }
    return (
      <div id="add_todo">
          <input  type="text" id="ip_title" placeholder="Enter title"></input>
          <br/>
          <input type="text" id="ip_description" placeholder="Enter description"></input>
          <br/>
          <button id="addTodo" onClick={onclickhandler}>Add Todo</button>
      </div>
  ) 
}

function ViewToDo(props){
 return (
        <div id="container">
            <h1><em>To-Do List</em></h1>
            <ul>
                {props.todoList.map(todo=>(
                <SingleTodo _id={todo._id} title={todo.title} description={todo.description} markasdone={todo.markAsDone} setTodoList={props.setTodoList}/>
            ))}
            </ul>
        </div>
    )
}


async function GetTodoList(){
    const token=localStorage.getItem('token');
    try{
    const res=await fetch("http://localhost:3000/user/view_todos",{
        method:"GET",
        headers:{
            'authorization':`Bearer ${token}`
        }
    });
        if(!res) throw new Error("failed to fetch todo list!");
    const data=await res.json();
        console.log(data.todos);
        return data.todos;
    }catch(err){
        console.log(err);
        throw new Error("err");
    }
}

function SingleTodo(props){
  const [editable,setEditable]=useState(false);
  async function deleteTodo(){
    const token=localStorage.getItem('token');
    try{
        const res=await fetch("http://localhost:3000/user/delete_todo",{
            method:"DELETE",
            headers:{
                'Content-Type':'application/json',
                'authorization':`Bearer ${token}`
            },
            body:JSON.stringify({
                _id:props._id
            })
        })
        if(!res.status===200) throw new Error("couldnt delete todo");
        const todos=await GetTodoList();
        props.setTodoList(todos);
    }catch(err){
        console.log(err);
    }
  }
  async function mainUpdate(){
    // todo update implementation
    console.log(props._id);
    const div=document.getElementsByClassName(props._id)[0];
    const titleElement=div.children[0];
    const descriptionElement=div.children[1];
    const markasdoneElement=div.children[3];
    const title=titleElement.value;
    const description=descriptionElement.value;
    const markasdone=markasdoneElement.checked;
    const token=localStorage.getItem('token');
    try{
    const res=await fetch("http://localhost:3000/user/edit_todo",{
        method:"PUT",
        headers:{
            'Content-Type': 'application/json',
            'authorization':`Bearer ${token}`
        },
        body:JSON.stringify({
            _id:props._id,
            title:title,
            description:description,
            markAsDone:markasdone
        })
    })
    if(!res.status===200) throw new Error("update todo failed!");
    const todos=await GetTodoList();
    props.setTodoList(todos);
    }catch(err){
        console.log(err);
    }
  }
  async function updateTodo(){
    if(!editable){
        setEditable(true);
    }else{
        // do some logic
        setEditable(false);
        await mainUpdate();
    }
  }
    return (
       <>
       {(editable)?(
        <>
        <li id={props._id}>
            <div className={props._id}>
                <input type="text" placeholder='enter updated title' defaultValue={props.title} ></input>
                <input type="text" placeholder='enter updated description' defaultValue={props.description} ></input>
                <p>Mark As Done</p>
                <input type="checkbox" checked={props.markasdone} />
                <button onClick={updateTodo} >Save</button>
            </div>
        </li>
        </>
       ):(
        <>
        <li id={props._id}>
            <div className={props._id}>
                <h2>{props.title}</h2>
                <h3>{props.description}</h3>
                <p>Mark As Done</p>
                <input type="checkbox" checked={props.markasdone} onChange={mainUpdate}/>
                <button onClick={updateTodo} >Edit</button>
                <button onClick={deleteTodo} >Delete</button>
            </div>
        </li>
        </>
      )}
        </>
    );
}

