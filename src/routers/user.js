const express = require("express");
const router =  new express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const {sendWelcomeEmail} = require("../emails/account");
const {sendCancellationEmail} = require("../emails/account");
const upload = multer({
    
    limits : {
        filesize :  1000000
    },
    fileFilter(req , file , cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)/)){
            cb(new Error("must be an image"));
        }
        cb(undefined , true);
    }
});


router.post("/users/me/avatar", auth, upload.single('avatar') , async (req , res)=>{
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
},(error, req, res, next)=>{
    res.status(400);
    res.send({error : error.message});
});

router.delete("/users/me/avatar" , auth , async (req , res)=>{
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
}); 

router.get("/users/:id/avatar" , async(req , res)=>{
    try{
        const user = await User.findById(req.params.id);
        if(!user || !user.avatar){
            throw new Error("Avatar not found");
        }
        res.set("Content-Type" , "image/png");
        res.send(user.avatar);

    } catch(error){
        res.status(404);
        res.send(error);
    }
});

router.get("/users/me" , auth , async (req, res)=>{


    res.send(req.user);
    // try{
    //    const users =  await User.find({});
    //    res.send(users);
    // }catch(error){
    //     res.status(500);
    //     res.send(error);
    // }

    // User.find({}).then((users)=>{
    //     res.send(users);
    // }).catch((error)=>{
    //     res.status(500);
    //     res.send(error);
    // })
});


router.post("/users" , async (req,res)=>{
    const user = new User(req.body);

    try{
        sendWelcomeEmail(user.email , user.name)
        const token = await user.generateAuthToken();
        await user.save();
        res.status(200);
        res.send({user, token});
    }catch(error){
        res.status(500);
        console.log(error);
        res.send(error);
    }

    // user.save().then(()=>{
    //     res.statusCode(201);
    //     res.send(user);
    // }).catch((error)=>{
    //     res.status(400);
    //     res.send(error);
    // });
});

router.post("/users/login"  ,async(req , res)=>{
    
    try{ 
        const user = await User.findByCredentials(req.body.email , req.body.password);
        const token = await user.generateAuthToken();
        res.send({user , token});

    }catch(error){
        res.status(400);
        res.send();
     }

});


router.post("/users/logout" , auth , async(req , res)=>{
        try{   
                req.user.tokens = req.user.tokens.filter((token)=>{
                    return token.token !== req.token
                })
                await req.user.save();
                res.send();
        }catch(error){
                res.status(500);
                res.send(error);
        }
});

router.post("/users/logoutAll" ,  auth , async(req ,res)=>{
        try{    
            req.user.tokens =  [];
            await req.user.save();
            res.status(200);
            res.send();
        }catch(error){
            res.status(500);
            res.send(error);
        }

});

router.patch("/users/me", auth,   async (req, res)=>{
    const _id  = req.user._id;
  //  ObjectId("5e24b318e791af44ea25e1a4")
    const updates = Object.keys(req.body);
    const validUpdates = ['name' , 'age' , 'email' , 'password'];
    const isValidUpdate = updates.every((update)=>{
            return validUpdates.includes(update);
    });
    if(!isValidUpdate){
        return res.status(404).send({error : "invlid update"});
    }
    try{ 
        const user = req.user;
        updates.forEach((update)=>{
            user[update] = req.body[update]; 
        });
        await user.save();

        //const user = await User.findByIdAndUpdate(_id , req.body , {new: true , runValidators : true});
        // if(!user){
        //     res.status(404).send();
        // }
        res.status(200).send(user);
    }catch(error){
        res.status(500).send(error);
    }
});
router.delete("/users/me" ,auth ,  async(req, res)=>{
    const _id = req.user._id;
    try{
        const user = await User.findByIdAndDelete(_id);
        if(!user){
            return res.status(404).send({error :"not found"});
        }
        sendCancellationEmail(req.user.email, req.user.name);
        res.status(200);
        res.send(req.user);
    }catch(error){
        res.status(500);
        res.send(error);
    }
});


module.exports = router;
