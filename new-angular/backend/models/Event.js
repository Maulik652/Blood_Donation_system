const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
{
title:{
type:String,
required:true,
trim:true,
maxlength:120
},

description:{
type:String,
required:true,
trim:true,
maxlength:1000
},

location:{
type:String,
required:true,
trim:true,
maxlength:120
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
default:"https://images.unsplash.com/photo-1615461066841-6116e61058f4",
trim:true,
maxlength:500
},

status: {
type: String,
enum: ['scheduled', 'live', 'postponed', 'ended'],
default: 'scheduled'
},

startedAt: {
type: Date,
default: null
},

endedAt: {
type: Date,
default: null
},

postponedFrom: {
type: Date,
default: null
},

postponeReason: {
type: String,
trim: true,
maxlength: 240,
default: null
}

},
{
timestamps:true
}
);

eventSchema.index({ date: 1 });

module.exports = mongoose.model('Event',eventSchema);