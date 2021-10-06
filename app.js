if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const path = require('path')
const Detail = require('./models/details')
const mongoose = require('mongoose')
const { urlencoded } = require('express')
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.API_KEY)

mongoose.connect(process.env.URL)
.then(()=>{console.log("DB Connected!!")})
.catch((e)=>{console.log("Something went Wrong");console.log(e);})

app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.use(express.static(path.join(__dirname,'public')))
app.use(urlencoded({extended:true}))

app.get('/',(req,res)=>{
    res.render('home/index')
})
app.get('/check-in',(req,res)=>{
    res.render('home/form',{heading:"check-in"})
})
app.get('/check-out',(req,res)=>{
    res.render('home/form',{heading:"check-out"})
})

//check-in time
app.post('/check-in',async(req,res)=>{

    let c_i_time = Date();

    const { phone,email,fname,lname } = req.body

    const message = {
        to:`${email}`,
        from:{
            name:process.env.NAME,
            email:process.env.EMAIL
        },
        subject:`Hello from ${process.env.SHORT}`,
        text:`Hello ${fname} ${lname}!!, you have succesfully checked in on ${c_i_time}. Thanks for checking in !! Hope you have a great time ahead!!`,
        html:`<p>Hello <strong>${fname} ${lname}</strong>!!, you have succesfully checked in on ${c_i_time}. Thanks for checking in !! Hope you have a great time ahead!!</p>`
    }
    if((await Detail.find({phone:phone})).length===0){

        const newDetail={
            ...req.body,
            check_in_date:c_i_time,
            is_checkedIn:true 
        }

        await Detail.create(newDetail)

        sgMail.send(message)
        .then(response=>console.log("Email sent succesfully"))
        .catch(e=>console.log(e.message))

        res.send(`<script>alert("You have checked-in. An email has been send to ${email}"); window.location.href = "/"; </script>`);
    }
    else if((await Detail.find({phone:phone,is_checkedIn:false,email:email})).length!==0){

        await Detail.findOneAndUpdate({phone:phone,is_checkedIn:false},{$set:{check_in_date:c_i_time,is_checkedIn:true,check_out_date:""}})
        
        sgMail.send(message)
        .then(response=>console.log("Email sent succesfully"))
        .catch(e=>console.log(e.message))
        
        res.send(`<script>alert("You have checked-in. An email has been send to ${email}"); window.location.href = "/"; </script>`);
    }
    else{
        
        res.send('<script>alert("You have already checked-in"); window.location.href = "/"; </script>');
    
    }
})

//check-out time
app.post('/check-out',async(req,res)=>{
    let c_o_time = Date()

    const { phone,email,fname,lname } = req.body

    const message = {
        to:`${email}`,
        from:{
            name:process.env.NAME,
            email:process.env.EMAIL
        },
        subject:`Hello from ${process.env.SHORT}`,
        text:`Hello ${fname} ${lname},you have succesfully checked out on ${c_o_time}. Thanks for checking out!! Hope you have a great time ahead!!`,
        html:`<p>Hello <strong>${fname} ${lname}</strong>,you have succesfully checked out on ${c_o_time}. Thanks for checking out!! Hope you have a great time ahead!!</p>`
    }
    if((await Detail.find({phone:phone,is_checkedIn:true})).length!==0){  
        await Detail.findOneAndUpdate({phone:phone},{$set:{check_out_date:c_o_time,is_checkedIn:false}})

        sgMail.send(message)
        .then(response=>console.log("Email sent succesfully"))
        .catch(e=>console.log(e.message))

        res.send(`<script>alert("You have checked-out. An email has been send to ${email}"); window.location.href = "/"; </script>`);
    }
    else{
        res.send('<script>alert("You have already checked-out"); window.location.href = "/"; </script>');
    }
})

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
    console.log(`Server running at port ${PORT}`)
})