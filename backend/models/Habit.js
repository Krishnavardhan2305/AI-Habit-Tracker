import mongoose from "mongoose";
const CATEGORIES=
[
    "Health",
    "Fitness",
    "Learning",
    "Mindfulness",
    "Productivity",
    "Social",
    "Finance",
    "Creativite",
    "Other"
]
const habitSchema = new mongoose.Schema(
    {
        userID:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
            index:true
        },
        name:{
            type:String,
            required:true,
            trim:true
        },
        description:{
            type:String,
            trim:true
        },
        category:{
            type:String,
            enum:CATEGORIES,
            default:"Other"
        },
        frequency:{
            type:String,
            enum:["Daily","Weekly","Monthly"],
            default:"Daily"
        },
        targetDays:{
            type:Number,
            default:5,
            min:1,
            max:10
        },
        color:{
            type:String,
            default:"#4CAF50"
        },
        icon:
        {
            type:String,
            default:"fa-solid fa-check"
        },
        isArchived:{
            type:Boolean,
            default:false
        },
        order:{
            type:Number,
            default:0
        }
    },
    {timestamps:true}
);
export const CATEGORIES_ENUM = CATEGORIES;
export default mongoose.model("Habit",habitSchema);