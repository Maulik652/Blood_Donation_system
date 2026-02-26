const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
{
title:{
type:String,
required:true
},

description:{
type:String,
required:true
},

location:{
type:String,
required:true
},

date:{
type:Date,
required:true
},

bloodGroups:{
type:[{
type:String,
enum:['A+','A-','B+','B-','AB+','AB-','O+','O-']
}],
default:["A+","O+","B+"]
},

capacity:{
type:Number,
default:50,
min:1
},

registeredCount:{
type:Number,
default:0,
min:0
},

registeredUsers: [{
type: mongoose.Schema.Types.ObjectId,
ref: 'User'
}],

imageUrl:{
type:String,
default:"https://images.unsplash.com/photo-1615461066841-6116e61058f4"
}

},
{
timestamps:true
}
);

module.exports = mongoose.model('Event',eventSchema);