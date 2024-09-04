const jsonwebtoken = require('jsonwebtoken')

function validateToken(req, res, next) {
   const token = req.header('auth-token')

   if (!token) {
       return res.status(401).send({ message: 'Access Denied: No token provided' })
   }

   try {
       const verified = jsonwebtoken.verify(token, process.env.TOKEN_KEY)
       req.user = verified
       next()
   } catch (err) {
       return res.status(401).send({ message: 'Invalid token' })
   }
}

module.exports = validateToken
