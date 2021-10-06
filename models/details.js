const mongoose = require('mongoose')

const detailSchema = mongoose.Schema({
    fname:{
        type:String,
        trim:true,
    },
    lname:{
        type:String,
        trim:true,
    },
    phone:{
        type:Number
    },
    email:{
        type:String,
        trim:true,
    },
    check_in_date:{
        type:String,
        trim:true
    },
    check_out_date:{
        type:String,
        trim:true
    },
    is_checkedIn:{
        type:Boolean
    }
})

const Detail = mongoose.model('Detail',detailSchema)

module.exports = Detail