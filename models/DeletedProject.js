const mongoose =  require('mongoose');

const productData =  new mongoose.Schema({
    productId:{
        type:String,
        required:true,
    },
    productName:{
        type:String,
        required:true
    },
    productSummary:{
        type:String,
        required:true,
    },
    requiredDoc:{
        type:String,
        required:true,
    },
    costomerCount:{
        type:Number,
    },
    createdBy:{
        type:String,
    },
    updatedBy:{
        type:String,
    },
    deletedBy:{
        type:String,
    },


},{
    timestamps:true
})

module.exports = mongoose.model('DeletedProduct', productData);