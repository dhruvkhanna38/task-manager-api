const mongoose = require("mongoose");
const validator = require("validator");


const taskSchema = new mongoose.Schema({
    description : {
        type :  String,
        trim : true , 
        required : true
    },
    completed : {
        type : Boolean,
        default : false
    },
    owner : {   
        type : mongoose.Schema.Types.ObjectId , 
        required : true,
        ref : 'User'
    }
}, {timestamps : true});

const Task = mongoose.model("Task" , taskSchema);

// const task1 = new Task({description : "Buy Groceries" , completed : false});

// task1.save().then(()=>{
//     console.log(task1);
// }).catch((error)=>{
//     console.log(error);
// })


module.exports = Task;
