const mongoose = require('mongoose')

const PostSchema = mongoose.Schema({
    topic:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    }
    ,
    message:{
        type:String,
        required:true,
        min:1,
        max:256

    },
    
    dateposted:{
        type:Date,
        default:Date.now
    },
    timeLimit:{
        type:Number
    },
    expireDate:{
        type:Date
    },
    likes:{
        type:Number,
        default:0
    },
    likedBy:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }],
    likeList:{
        type:[String]
    },
    dislike:{
        type:Number,
        default:0
    },
    dislikedBy:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }],
    dislikeList:{
        type:[String]
    },
   comments:{
    
    type:[String]
   },
   expired:{
    type:String,
    default:'Live'
   },
   userId:{
    
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
   }
   ,
   poster:{
    type:String,
    required:true

   }


},
{
    versionKey:false
}
)

module.exports = mongoose.model('posts',PostSchema)