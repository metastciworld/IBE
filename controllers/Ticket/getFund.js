const Fund = require('../../models/Fund');
const errorMessages = require('../../response/errorMessages');
const successMessages = require('../../response/successMessages');
const logger = require('../User/logger');

module.exports.getFund = async function(req , res){
try {
    logger.info(successMessages.START);
    logger.info(successMessages.GET_FUND_ACTIVATED);
    const contact = req.headers['contact'];
    var data ;
    if(contact){
        data = await Fund.find({contact});
    }else{
        data = await Fund.find();
    }

    try {        

        if(data){
            logger.info(successMessages.DATA_SEND_SUCCESSFULLY)
            return res.status(200).json({'Data':data})
        }else{
            logger.info(errorMessages.NOT_FOUND)
            return res.status(404).json(errorMessages.NOT_FOUND)
        }
    } catch (error) {
        logger.error(error)
        return res.status(502).json(errorMessages.BAD_GATEWAY)
    }
} catch (error) {
    logger.error(errorMessages.GET_FUND_FAILED);
    return res.status(500).json(errorMessages.INTERNAL_ERROR)
}
}