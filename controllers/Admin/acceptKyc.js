const Kyc = require('../../models/Kyc');
const errorMessages = require('../../response/errorMessages');
const successMessages = require('../../response/successMessages');
var CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const logger = require('../User/logger');
const AdminUser = require('../../models/AdminUser');
require('dotenv').config({path:'../../.env'});

module.exports.acceptKyc = async function(req, res){
try {
    const {empId} = req.body;
        //user input
        var token = req.body.token || req.query.token || req.headers["x-access-token"];
        //check for valid response
        if(!token){
            return res.status(401).json(errorMessages.TOKEN_NOT_FOUND);
        }
        var userRole;
        try {
            //decode token signature
            const secret = process.env.SECRET_KEY;
             // Decrypt
             var bytes  = CryptoJS.AES.decrypt(token, secret);
             token = bytes.toString(CryptoJS.enc.Utf8);
            const decode = jwt.verify(token , secret);
            
        //check for user role as per token
             userRole = decode.role;
             var _id =decode.id
             var acceptedBy = decode.email;
        } catch (error) {
            return res.status(401).json(errorMessages.TOKEN_EXPIRED)
        }
            //check Admin user is active or not
        try {
            var activeUser = await AdminUser.findById(_id) 
             if(activeUser == null){
                logger.error(`In active Admin`)
                return res.status(401).json(errorMessages.ACCESS_DENIED)
            }
        } catch (error) {
            logger.error(errorMessages.SOMETHING_WENT_WRONG)
            return res.status(502).json(errorMessages.SOMETHING_WENT_WRONG)
        }


    if(!empId){
        return res.status(400).json(errorMessages.ALL_FIELDS_REQUIRED)
    }
    try {
        const status = 'In Progress';
        const updateStatus = await Kyc.findOneAndUpdate({empId},{status , acceptedBy},{new:true});
        if(!updateStatus){
            return res.status(404).json(errorMessages.NOT_FOUND)
        }else{
            res.status(200).json(successMessages.STATUS_HAS_UPDATED_SUCCESSFULLY)
        }
    } catch (error) {
        return res.status(502).json(errorMessages.BAD_GATEWAY);
    }
} catch (error) {
    return res.status(500).json(errorMessages.INTERNAL_ERROR)
}
   
}