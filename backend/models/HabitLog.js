import mongoose from "mongoose";
const habitLogSchema = new mongoose.Schema(
    {
        habitID:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Habit",    
            required:true,
            index:true
        },
        userID:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
            index:true
        },
        completedDate:{
            type:Date,
            required:true
        },
        notes:{
            type:String,
            default:""
        }
    },
    {timestamps:true}
);
habitLogSchema.index(
    { habitID: 1, userID: 1, completedDate: 1 },
     { unique: true }
);
export default mongoose.model("HabitLog",habitLogSchema);