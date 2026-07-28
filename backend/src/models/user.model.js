import bcrypt, { compare } from 'bcrypt';
import mongoose from 'mongoose';

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        select:false,
    }
});

userSchema.methods.comparePassword=async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

const User= mongoose.model('User',userSchema);

export default User;