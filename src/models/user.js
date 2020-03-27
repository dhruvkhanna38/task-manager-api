const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task  = require("../models/task");

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    age : {
        type : Number , 
        trim : true,
        lowercase  : true,
        validate(value){
            if(value < 0){
                throw new Error("age cannot be negetive");
            }
        }
    },
    email : {
        type : String , 
        unique : true , 
        default : 0 , 
        required : true , 
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Not a valid email");
            }
        }
    },
    password : {
        required : true, 
        type : String , 
        validate(value){
            if(!validator.isLength(value , {min : 7 , max : undefined})){
                throw new Error("Password length must be greater than 6 characters");
            }
            if(validator.contains(value.toLowerCase() , 'password')){
                throw  new Error("the password cannot contain the word password");
            }
        },
        trim : true
    },
    tokens : [{
        token :  {
            type : String , 
            required : true
        }
    }],
    avatar : {
        type : Buffer
    }
}, {timestamps : true})

userSchema.virtual("tasks" , {
        ref : 'Task',
        localField : '_id' , 
        foreignField  : 'owner'
});

userSchema.methods.toJSON =  function(){
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}


userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({_id  : user._id.toString()} , process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;   
}

userSchema.statics.findByCredentials = async (email, password)=>{
    const user = await User.findOne({email});
    if(!user){
        throw new Error("Unable to Login");
    }
    const isMatch = await bcrypt.compare(password , user.password);
    if(!isMatch){
        throw new Error("Unable to Login");
    }
    return user;
}

userSchema.pre('save'  , async function(next){
    const user  =  this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password , 8);
    }
    console.log("before saving");
    next();
});

userSchema.pre('remove' , async function(next){
    const user = this;
    await Task.deleteMany({owner :  user._id});
    next();
});


const User = mongoose.model("User" , userSchema);



//const user1 = new User({name : "Harry" ,  age : 13 , email : "harrypotter13@gmail.com" ,  password  : "harry_1313"});

module.exports = User;