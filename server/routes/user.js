const express = require('express')
const router = express()
const User = require('../model/User')
const {signUpVal,loginVal} = require('../validation/checks')
const bcryptjs = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken')

router.post("/signup",async(req,res)=>{


    const {error} = signUpVal(req.body)
    if(error){
        console.log({Invalid:error})
        return res.status(400).send({Invalid:error['details'][0]['message']})
    }

    const emailCheck = await User.findOne({email:req.body.email})
    const userNameCheck = await User.findOne({username:req.body.username})
    if(emailCheck || userNameCheck){
        return res.status(400).send({message:'Email or Username already in use'})
    }
    const salt = await bcryptjs.genSalt(3)
    const hashlastname = await bcryptjs.hash(req.body.lastname,salt)
    const hashpassword = await bcryptjs.hash(req.body.password,salt)
    const dataFormat = new User({
        firstname:req.body.firstname,
        lastname:hashlastname,
        username:req.body.username,
        email:req.body.email,
        password:hashpassword
    })
    try{
        const newUser = await dataFormat.save()
        console.log('Successful user creation')
        return res.status(200).send({Success:'Sign up successful'})

    }catch(err){
        console.log('Internal error')
        return res.status(400).send({message:err})
    }
})

router.post('/login',async(req,res)=>{
    const emailCheck = await User.findOne({email:req.body.email})
    if(!emailCheck){
        return res.status(400).send({message:'Account does not exist'})
    }

    const passwordCheck  = await bcryptjs.compare(req.body.password,emailCheck.password)
    if(!passwordCheck){
        return res.status(400).send({message:'Incorrect password'})
    }
   const token = jsonwebtoken.sign({_id:emailCheck._id},process.env.TOKEN_KEY)
   const email = req.body.email
    console.log(email + " Sign in success")
    res.header('auth-token',token).send({'auth-token':token})
})

router.get('/allaccounts',async(req,res)=>{
    try{
        const allAccounts = await User.find()
        console.log(allAccounts)
        const allFirstNames = allAccounts.map(user => user.firstname)
        return res.status(200).send({verifiedUsers:allFirstNames})
    }catch(err){
        console.log(err)
        return res.status(400).send({message:err})
    }
})

module.exports = router