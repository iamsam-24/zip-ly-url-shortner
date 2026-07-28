import mongoose from "mongoose";

const shortUrlSchema= new mongoose.Schema({

    full_url:{
        type:String,
        required:true
    },

    short_url:{
        type:String,
        index:true, ///in order to make the search easy for the mongodb
        required:true,
        unique:true
    },
     
    click:{  //counts the number of time user accesed or used the links from database
        type:Number,
        required:true,
        default:0

    },
    user:{ //creating the reference for every user ...like what belong to whom 
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"

    }


})

const shortUrl=mongoose.model("shortUrl",shortUrlSchema)






export default shortUrl