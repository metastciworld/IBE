const nodemailer = require("nodemailer");
require('dotenv').config({path:'../../.env'});
const errorMessages = require('../../response/errorMessages');
const successMessages = require('../../response/successMessages');
const OTP = require('../../models/OTP');
const logger = require("./logger");
const User = require("../../models/User");

module.exports.generateEmailOtp = async function(req, res){
    // try {
        logger.info(`Start`);
        logger.info(successMessages.GENERATE_EMAIL_OTP_ACTIVATED)
            //user email address
            var useremail = req.body.email;
            logger.info(`Input - ${useremail}`)

            const userExist =  await User.findOne({email:useremail})
            
            if(!userExist){
                return res.status(422).json(errorMessages.USER_DOES_NOT_EXIST);
            } 
            if(userExist.userStatus == 'Inactive'){
                return res.status(401).json(errorMessages.INACTIVE_USER_ERROR)
            }
            const data = Math.floor(Math.random() * 9000) + 1000;
            var otp = data.toString();
            //set otp expiry time
            const expiration= Date.now() + 120000;
            logger.info(`OTP - ${otp}`)    
        //     module.exports.expiration = expiration;
         console.log(otp)
        //     module.exports.otp = otp;
        try {
            const isExist =  await OTP.findOne({email:useremail});
        
            if(isExist){
                const otpData = await OTP.findOneAndUpdate({email:useremail},{otp , expiration},{new:true})
            }else{
                const otpData = await OTP.create({
                    email:useremail , otp , expiration 
                })
            }
        } catch (error) {
            logger.error(`Error - ${error}`)
            return res.json(errorMessages.SOMETHING_WENT_WRONG);
        }

            let testAccount = await nodemailer.createTestAccount();

            //sender email
            var senderEmail = process.env.EMAIL;
            //sender email password
            var userPassword = process.env.EMAIL_PASSWORD;

            let transporter = nodemailer.createTransport({
                host:process.env.EMAIL_HOST,
                port: 465,
                secure: true, // true for 465, false for other ports
                auth: {
                    user: senderEmail,
                    pass: userPassword
                },
            })
      
        try {
            let info = await transporter.sendMail({
                from: `no-reply@bmcsindia.in <${senderEmail}>`, // sender address
                to: useremail, // list of receivers
                subject: "OTP Verification", // Subject line
                text: `Important message from BMCS India
                Your one-time code is ${otp} .
                Use it for secure login.
                Please do not share.
                Securing smiles, one password at a time! `, // plain text body
                html: `Important message from <b>BMCS India</b> <br>
                Your one-time code is <b>${otp}</b> .<br>
                Use it for secure login.<br>
                Please do not share.<br>
                <b>Securing smiles, one password at a time!</b> `, // html body
            });
            logger.info(`Email info - ${info.response , info.envelope , info.accepted , info.rejected, info.messageId}`)
            //console.log(info);
            // console.log("Message sent: %s", info.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            
            // Preview only available when sending through an Ethereal account
            // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            logger.info(successMessages.EMAIL_OTP_SENT_SUCCESSFULLY)
            logger.info(`End`);
            return res.status(200).json(successMessages.EMAIL_OTP_SENT_SUCCESSFULLY)
        } catch (error) {
            logger.error(`Error - ${error}`)
            return res.status(550).json('Invalid Email');
        }
    // } catch (error) {
    //     logger.error(errorMessages.GENERATE_EMAIL_OTP_FAILED)
    //     return res.status(500).json(errorMessages.INTERNAL_ERROR)
   // }
}