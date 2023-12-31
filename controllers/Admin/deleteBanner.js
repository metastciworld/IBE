const AdminUser = require('../../models/AdminUser');
const HomeBanner = require('../../models/HomeBanner');
const errorMessages = require('../../response/errorMessages');
const successMessages = require('../../response/successMessages');
const logger = require('../User/logger');
const jwt = require('jsonwebtoken');
require('dotenv').config({path:'../../.env'});
var CryptoJS = require("crypto-js");
module.exports.deleteBanner = async function(req , res){
    
try {
    logger.info(successMessages.START);
    logger.info(successMessages.DELETE_BANNER_ACTIVATED)
    var token = req.body.token || req.query.token || req.headers["x-access-token"];

    const id = req.params.id || req.body.id || req.query.id || req.headers["id"];
    if(!id){
        logger.error(errorMessages.ALL_FIELDS_REQUIRED);
        return res.status(400).json(errorMessages.ALL_FIELDS_REQUIRED)
    }
    //check for token provided or not
    if(!token){
        logger.error(errorMessages.TOKEN_NOT_FOUND)
        return res.status(401).json(errorMessages.TOKEN_NOT_FOUND);
    }

    var userRole;
    var decode;
   try {
        //decode token signature
        const secret = process.env.SECRET_KEY;
        // Decrypt
        var bytes  = CryptoJS.AES.decrypt(token, secret);
        token = bytes.toString(CryptoJS.enc.Utf8);
         decode = jwt.verify(token , secret);
        console.log(decode);
    //check for user role as per token
         userRole = decode.role;
    } catch (error) {
        logger.error(errorMessages.TOKEN_EXPIRED);
        return res.status(401).json(errorMessages.TOKEN_EXPIRED)
    }
    const _id = decode.id;
    const adminEmail = decode.email;
    const activeUser = await AdminUser.findById({_id})
    
    if(activeUser == null){
        logger.error(`In active Admin`)
        return res.status(401).json(errorMessages.ACCESS_DENIED)
    }
    logger.info(`User Role - ${userRole}`)
    //check for authorization
    if(userRole == "Admin" || userRole == "admin" || userRole == "Super_Admin" || userRole == "super_admin"){
        console.log("ID",id);
        const isExist = await HomeBanner.findOne({_id:id});
        logger.info(`Banner In DB - ${isExist}`)
        if(isExist == null){
            logger.error(errorMessages.NOT_FOUND)
            return res.status(404).json(errorMessages.NOT_FOUND)
        }
        try {

            const hiddenData = await HomeBanner.findByIdAndDelete({_id:id})

            if(hiddenData){
                logger.info(successMessages.RECORD_DELETED_SUCCESSFULLY)
                logger.info(successMessages.END)
                return res.status(200).json(successMessages.RECORD_DELETED_SUCCESSFULLY);
            }else{
                logger.error(errorMessages.SOMETHING_WENT_WRONG)
                return res.json(errorMessages.SOMETHING_WENT_WRONG);
            }
            
        } catch (error) {
            logger.error(`Error -${error}`)
            return res.status(502).json(errorMessages.BAD_GATEWAY)
        }

    }else{
        logger.error(errorMessages.ACCESS_DENIED)
        return res.status(403).json(errorMessages.ACCESS_DENIED)
    }

} catch (error) {
    logger.error(errorMessages.DELETE_BANNER_FAILED)
    return res.status(500).json(errorMessages.INTERNAL_ERROR);
}
}