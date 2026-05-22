import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {type: String,required: true,trim: true},
  email: {type: String,required: true,unique: true,trim: true,lowercase: true},
  password: {type: String,required: true,minlength: 6},
  avatar: {type: String,default: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'},
  morningMotivation: {type: Boolean,default: false},
},{
    timestamps: true
}); 

userSchema.pre('save', async function(next) 
{
    if (!this.isModified('password')) 
    {     
        return next();
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    
    }
});
userSchema.methods.matchPassword = async function(enteredPassword) 
{
    return await bcrypt.compare(enteredPassword, this.password);
}   

userSchema.methods.toJSON = function()
{
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
}
export default mongoose.model('User', userSchema);