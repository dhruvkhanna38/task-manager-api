const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const Task = require("../models/task");
const User = require("../models/user");


// /tasks?completed=true
// /tasks?limit=2&skip=3
// /tasks?sortBy=createdAt:asc
router.get("/tasks", auth, async (req , res)=>{
    const match = {};
    const sort = {};

    if(req.query.completed){
        match.completed = req.query.completed === 'true';
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc'? -1 : 1;

    }

    try{
        const user = await User.findById(req.user._id);
        await user.populate({
            path : 'tasks' , 
            match,
            options : {
                limit : parseInt(req.query.limit) , 
                skip : parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        //const tasks = await Task.find({});
        res.status(200);
        res.send(user.tasks);
    }catch(error){
        console.log(error);
        res.status(500);
        res.send(error);
    }

    // Task.find({}).then((tasks)=>{
    //     res.send(tasks);
    // }).catch((error)=>{
    //     res.status(500);
    //     res.send(error);
    // }); 
});

router.get("/tasks/:id" , auth , async (req , res)=>{

    const _id = req.params.id;
    try{
        //const task = await Task.findById(_id);
        const task = await Task.findOne({_id , owner  : req.user._id});

        if(!task){
            return res.status(404).send();
        }
        res.send(task);
    }catch(error){
        res.status(500);
        res.send(error);
    }

    // Task.findById(_id).then((task)=>{
    //     if(!task){
    //         return res.status(404).send();
    //     }
    //     res.send(task);
    // }).catch((error)=>{
    //     res.status(500);
    //     res.send(error);
    // });
});


router.post("/tasks" , auth , async (req,res)=>{
    //const task = new Task(req.body);
    const task = new Task({
        ...req.body , 
        owner :  req.user._id
    });
    try{
        await task.save();
        res.send(task);
    }catch(error){
        res.status(400);
        res.send(error);
    }
    // task.save().then(()=>{
    //     res.send(task);
    // }).catch((error)=>{
    //     res.status(400);
    //     res.send(error);
    // });
});



router.patch("/tasks/:id" ,auth ,  async(req , res)=>{
   // ObjectId("5e2217d65923793402698a00")    
    const updates = Object.keys(req.body);
    const validUpdates = ['description' , 'completed'];
    const isValidUpdate = updates.every((update)=>{
        return validUpdates.includes(update); 
    });

    if(!isValidUpdate){
        return res.status(404).send({error : "invlid update"});
    }

    try{
        //const task = await Task.findById(req.params.id);
        const task = await Task.findOne({_id:req.params.id , owner : req.user._id});

        //const task = await Task.findByIdAndUpdate(req.params.id , req.body , {new:true , runValidators: true});
        if(!task){
            return res.status(404).send();
        }
        updates.forEach((update)=>{
            task[update] = req.body[update];
        });
        await task.save();

        res.status(200).send(task);
    }catch(error){
        res.status(500);
        console.log(error);
        res.send(error);
    }
});

router.delete("/tasks/:id" , auth , async(req, res)=>{
    const _id = req.params.id;
    try{
        //const task = await Task.find ByIdAndUpdate(_id);
        const task = await Task.findOneAndDelete({_id ,  owner : req.user._id});
        if(!task){
            return res.status(404).send({error: "Not Found"});
        }
        res.status(200);
        res.send(task);
    }catch(error){
        res.status(500);
        res.send(error);
    }
});

module.exports = router;

