const express  = require('express')
const router = express.Router()
const Post = require('../model/Post')
const User = require('../model/User')
const {postVal} = require('../validation/checks')
const token = require('../tokenGen')
const topicCheck = require('../topicCheck/checks')
const { post } = require('./user')

router.post('/newpost', token, async (req, res) => {
    if (req.body.userId) {
        delete req.body.userId
    }
 
    const { error } = postVal(req.body)
    if (error) {
        return res.status(400).send({ Error: error['details'][0]['message'] })
    }
 
    const check = topicCheck(req.body.topic)
    if (!check) {
        return res.status(400).send({ Invalid: 'Invalid topic' })
    }
 
    const user_Id = req.user._id
    let expiredTime = new Date()
    expiredTime.setTime(Date.now() + req.body.timeLimit * 60 * 1000)
 
    try {
        const currentDate = new Date().getTime()
        if (currentDate >= expiredTime.getTime()) {
            return res.status(400).send({ message: 'Time limit has already expired' })
        }
        const username = await User.findById(user_Id)
        const name = username.username
       
        const dataFormat = new Post({
            topic: check,
            title:req.body.title,
            message: req.body.message,
            expireDate: expiredTime,
            poster:name,
            posterId: user_Id
        })
 
        const newPost = await dataFormat.save()
        
        const topicName = req.body.topic
 
        console.log( name+ " made a post in " + topicName )
        return res.status(200).send({
            Topic: newPost.topic,
            Title: newPost.title,
            Poster: username.username,
            PostId: newPost._id,
            Message: newPost.message,
            DatePost: newPost.dateposted,
            ExpirationTime: newPost.expireDate,
            NumberOfLikes: newPost.likes,
            NumberOfDislikes: newPost.dislike
        })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ Error: 'Internal server error' })
    }
 })

 async function expirePostCheck(postId,res,action){
    const post = await Post.findById(postId)
    const currentDate = new Date().getTime()
    const expireDate = new Date(post.expireDate).getTime()
    if(currentDate >= expireDate){
        console.log('Post has expired cant '.concat(action))

        await Post.findByIdAndUpdate(postId, { expired: 'Expired' })
        return res.status(400).send({message:'Post has expired'})
    }
}


async function allPostExpireCheck(postId,res){
    
        const post = await Post.findById(postId)
        const currentDate = new Date().getTime()
        const expireDate = new Date(post.expireDate).getTime()    
        if(currentDate >= expireDate){
        console.log('Post status edited')
        post.expired = 'Expired'
        await post.save()
    }
    return post
    

}

router.get('/:topic/homepage',token,async(req,res)=>{
    try{
        const topic = req.params.topic
        const valid = topicCheck(topic)
        if(!valid){
            return res.status(400).send({message:'Invalid topic'})
        }
        const allPosts = await Post.find({topic:valid})
        const updatedPosts = []
        for(const post of allPosts){
            const updatedPost = await allPostExpireCheck(post._id,res)
            console.log(post.poster)
            updatedPosts.push(updatedPost)
        }

        console.log(topic + ' homepage accessed by ')
        res.status(200).send({message:'Updated post:',Post:updatedPosts})

    }catch(err){
        return res.status(500).send({message:err})
    }
})

router.get('/post/:id',token,async(req,res)=>{
    try{
        const postId = req.params.id
        const post = await Post.findById(postId)
        if(!post){
            return res.status(404).send({message:'Post not found'})
        }
        console.log({'Post':post})
        res.status(200).send(post)
    }catch(err){
        console.log(err)
        return res.status(500).send({message:err})
    }
})


router.post('/post/:id/like',token,async(req,res)=>{
    try {
        const postId = req.params.id
        const post = await Post.findById(postId)
        const userId = req.user._id

       

        const expire = await expirePostCheck(postId, res, 'like')
        if (expire) {
            return
        }

        const username = await User.findById(userId)

        if (post.dislikedBy.includes(userId) || post.likedBy.includes(userId)) {
            if (post.likedBy.includes(userId)) {
                const unLikePost = await Post.findByIdAndUpdate(
                    postId,
                    { $inc: { likes: -1 }, $pull: { likedBy: userId, likeList: username.username } },
                    { new: true }
                )
                return res.status(200).send({
                    message: 'Post unliked',
                    PeopleWhoLiked: unLikePost.likeList,
                    NumberOfLikes: unLikePost.likes
                })
            }

            if (post.dislikedBy.includes(userId)) {
                const dislikeRemoved = await Post.findByIdAndUpdate(
                    postId,
                    {
                        $inc: { dislike: -1, likes: 1 },
                        $pull: { dislikedBy: userId, dislikeList: username.username },
                        $addToSet: { likedBy: userId, likeList: username.username }
                    },
                    { new: true }
                )
                return res.status(200).send({
                    message: 'Dislike removed and post liked',
                    PeopleWhoDisliked: dislikeRemoved.dislikeList,
                    NumberOfDislikes: dislikeRemoved.dislike,
                    PeopleWhoLiked: dislikeRemoved.likeList,
                    NumberOfLikes: dislikeRemoved.likes
                })
            }
        }

        const likedPost = await Post.findByIdAndUpdate(
            postId,
            { $inc: { likes: 1 }, $addToSet: { likedBy: userId, likeList: username.username } },
            { new: true }
        )

        return res.status(200).send({ message: 'Post liked', details: likedPost })
    } catch (err) {
        console.error(err)
        return res.status(400).send({ message: 'Error occurred' })
    }
})
  router.post('/post/:id/dislike',token,async(req,res)=>{
    try {
        const postId = req.params.id
        const post = await Post.findById(postId)

        const userId = req.user._id
       
     const expire =  await expirePostCheck(postId,res,'dislike')
     if(expire){
       //this is a check
        return 
     }
       
   
        const username = await User.findById(userId)
        if (post.dislikedBy.includes(userId) || post.likedBy.includes(userId)) {
            if(post.dislikedBy.includes(userId)){
                const dislikeRemoved = await Post.findByIdAndUpdate(postId, {$inc:{dislike: -1}, 
                    $pull:{dislikedBy:userId,dislikeList:username.username}},{new:true})
                console.log('post un-disliked')
                return res.status(200).send({message:'Disliked removed',
                PeopleWhoDisliked:dislikeRemoved.dislikeList,
                NumberOfDislikeds:dislikeRemoved.dislike})
            }
            if(post.likedBy.includes(userId) ){
                const unLikePost =  await Post.findByIdAndUpdate(postId,{$inc:{likes:-1,dislike:1},
                    $pull:{likedBy:userId, likeList:username.username}, 
                    $addToSet:{dislikedBy:userId,dislikeList:username.username}},{new:true})
                console.log('post unliked')
                return res.status(200).send({Topic:unLikePost.topic,message:'Post disliked',
                PeopleWhoLiked:unLikePost.likedList,NumberOfLikes:unLikePost.likes,
                NumberofDislikes:unLikePost.dislike,
                PeopleWhoDisliked:unLikePost.dislikeList})
            }
           
        }

       
       const likedPost= await Post.findByIdAndUpdate( postId,{ $inc: { dislike: 1 }, 
        $addToSet: { dislikedBy: userId, dislikeList:username.username}},{ new: true })
        console.log('post disliked')

      return res.status(200).send({message:'Post disliked',details:likedPost})
    } catch (err) {
        console.error(err)
        return res.status(400).send({ message: 'Error occurred' })
    }
})

  
module.exports = router