const Project = require('../../models/Project');
const jwt = require('jsonwebtoken');
require('dotenv').config({path:'../../.env'});
const logger = require('../User/logger');
const AdminUser = require('../../models/AdminUser');
module.exports.superAdminConsole = async function(req, res){
try {
    logger.info(`Activated Super Admin Console Endpoint`)
    //input token from user
    const token = req.body.token || req.query.token || req.headers["x-access-token"];
    logger.info(`Token - ${token}`)
    //check for token provided or not
    if(!token){
        return res.status(401).json('Please Provide Token');
    }
    var decode;
    var userRole;
    try {
        //decode token signature
        const secret = process.env.SECRET_KEY;
         decode = jwt.verify(token , secret);
        console.log(decode);
    //check for user role as per token
         userRole = decode.role;
    } catch (error) {
        return res.status(401).json(`Token Expired`)
    }
    const _id = decode.id;
    //check Admin user is active or not
    const activeUser = await AdminUser.findById({_id}) 
    if(activeUser == null){
        logger.error(`In active Admin`)
        return res.status(401).json(`Access Denied`)
    }
    logger.info(`User Role - ${userRole}`)
    //check for authorization
    if(userRole == "Super_Admin" || userRole == "super_admin"){
        //find the data in DB
        const projectData = await Project.find()
        //check record found in DB or not
        if(projectData.length == 0){
            logger.error(`NO Projects Available`)
            return res.status(404).json("NO Projects Available")
        }else{
            logger.info(`Output - ${projectData}`)
            //response
            return res.status(200).json(projectData)
        }
    }else{
        logger.error(`Anauthorized Access`)
        return res.status(403).json(`Anauthorized Access`)
    }
} catch (error) {
    logger.error(`Super Admin Console Endpoint Failed`)
    return res.status(500).json("Something went wrong in Super Admin Console")
}
    
}

