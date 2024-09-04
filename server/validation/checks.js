const joi = require("joi")


const signUpVal = (data) =>{
    const schemaValidation = joi.object({

        firstname:joi.string().required().min(1).max(256),
        lastname:joi.string().required().min(1).max(256),
        username:joi.string().required().min(6).max(256),
        email:joi.string().required().min(6).max(256).email(),
        password:joi.string().required().min(6).max(1056)
    })
    return schemaValidation.validate(data)
}

const loginVal =(data)=>{
    const schemaValidation = joi.object({

        email:joi.string().required().min(6).max(256).email(),
        password:joi.string().required().min(6).max(1056)
    })
    return schemaValidation.validate(data)
}
const postVal = (data) => {
    const schema = joi.object({
        topic: joi.string().required(),
        title: joi.string().min(1).max(25).required(),
        message: joi.string().min(1).max(256).required(),
        timeLimit: joi.number().optional()
    })
 
    return schema.validate(data)
 }

module.exports.signUpVal = signUpVal
module.exports.loginVal = loginVal
module.exports.postVal = postVal
