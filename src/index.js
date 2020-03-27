const express = require("express");
const app = express();
const userRouter = require("../src/routers/user");
const taskRouter = require("../src/routers/task"); 

require("./db/mongoose");

const User = require("../src/models/user");
const Task = require("../src/models/task");

const port = process.env.PORT;

// const multer = require("multer");
// const upload = multer({
//     dest : 'images',
//     limits:{
//         fileSize : 1000000
//     },
//     fileFilter(req, file, cb){
//         if(!file.originalname.match(/\.(doc|docx)/)){
//             cb(new Error("must be a MS Word file"));
//         }
//         cb(undefined , true);

//         // cb(new Error("must be a docx file"));
//         // cb(undefined , true);
//         // cb(undefined, false);
//     }
// });

// const errorMiddleware = (req , res , next)=>{
//     throw new Error("From my Middleware");
// }

// app.post("/upload" , upload.single('upload') , (req , res)=>{
//     res.send();
// }, (error, req , res , next)=>{
//     res.status(400);
//     res.send({error :  error.message});
// });


// app.use((req, res, next)=>{
//   if(req.method === 'GET'){
//       res.send("GET requests are disabled");
//   }
//   else{
//       next();
//   }
// });


// app.use((req , res, next)=>{
//     res.status(503);
//     res.send("Site under maintenance");
// });

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);


app.listen(port , ()=>{
    console.log("listening on " + port);
});

// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// const myFunction = async ()=>{
//     const token = jwt.sign({_id : "abc123"} , "Harry Potter" , {expiresIn : '7 days'});
//     console.log(token);

//     const data = jwt.verify(token , "Harry Potter");
//     console.log(data);

// }

// myFunction();



// const main = async ()=>{
//     // const task = await Task.findById("5e7cfe7a1a5ac09516561fe5");
//     // console.log(task);
//     // await task.populate('owner').execPopulate();
//     // console.log(task.owner);


//     const user = await User.findById("5e7cfe671a5ac09516561fe2");
//     await user.populate('tasks').execPopulate();
//     console.log(user.tasks);

// }

// main();