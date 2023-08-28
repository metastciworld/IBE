const Project = require('../../models/Project');
const History = require('../../models/History');
const Wallet = require('../../models/Wallet');
const logger = require("../logger");
module.exports.completeProject = async function(req , res){
try {
    logger.info(`Activated Complete Project Endpoint`)
    //Input project ID
    const _id =  req.params.id || req.body.id || req.query.id || req.headers["id"];
    logger.info(`Id - ${_id}`)
    //input of status from body
    const {projectStatus} = req.body;
    logger.info(`Input - ${req.body}`)
    //check if ID provided or not
    if(!_id){
        logger.error(`Project Id is required`)
        return res.status(400).json("Project Id is required")
    }
    //check for project status provided or not
    if(!projectStatus){
        logger.error(`Project Status is required`)
        return res.status(400).json("Project Status is required")
    }
    //check for project status by admin
    if(projectStatus == "Completed" || projectStatus == "completed"){
        //check projec exist in DB or not
        const projectData = await Project.findById({_id});
        //console.log(projectData);
        //if no record found
        if(projectData ==  null){
            logger.error(`No Records Found`)
            return res.status(404).json("No Records Found");
        }
        //check if Data in DB status is approved or not
        if(projectData.projectStatus == "Approved" || projectData.projectStatus == "approved"){
            //find and update data in DB
            const completeData = await Project.findByIdAndUpdate({_id},{projectStatus},{new:true})
            const contact = projectData.contact;
            //console.log(completeData);
            //withdraw amount
            const withdrawableAmount = parseInt(projectData.sanctionedAmount);
            //get detials fro wallert for the user
            const lessAMount = await Wallet.findOne({contact});
            //less the pending amount
            const amount = parseInt(lessAMount.projectEarning[0].pendingAmount) - withdrawableAmount; 
            //add pending amount in total amount and withdrawable amount
            const totalAmount = parseInt(lessAMount.totalEarning) + withdrawableAmount;
            //check and update amount in DB
            const pendingAmount = await Wallet.findOneAndUpdate({contact},{
                projectEarning:[
                    {
                    pendingAmount:amount,
                    withdrawableAmount:withdrawableAmount,
                    }
                ],
                totalEarning:totalAmount,
            },{new:true})
            logger.info(`Output - ${pendingAmount}`)
            //console.log("pending amount ",pendingAmount);
            //define all required data field
            const type = 'credit';
            const origin = 'projectEarning';
            const status = 'completed'
            //generate history for user transaction
            const userHistory = await History.create({
                contact,
                transactionAmount:withdrawableAmount,
                type,
                status,
                origin,
            }) 
            logger.info(`Output - ${userHistory}`)
            //console.log("hist",userHistory);
            
        }else{
            logger.error(`Unable to perform action as status is ${projectData.projectStatus}`)
            return res.status(401).json(`Unable to perform action as status is ${projectData.projectStatus}`)
        }
        return res.status(200).json("Project has been completed successfully");
    }else{
        logger.error(`Unable to perform action`)
        return res.status(401).json(`Unable to perform action`)
    }
} catch (error) {
    logger.error(`Complete Project Endpoint Failed`)
    return res.status(500).json("Something went wrong in Project Complete")
}

}

