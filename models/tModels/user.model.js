const mongoose = require('mongoose')

const userShecma =  mongoose.Schema({
    username : {type : String, required : true},
    password : {type : String, required : true},
    email : {type : String, required : true}
})


const User = mongoose.model('task_user', userShecma)


module.exports = {User}