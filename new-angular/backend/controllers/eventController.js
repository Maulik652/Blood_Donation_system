const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const mongoose = require('mongoose');
const { sanitizeText } = require('../utils/validation');

const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const normalizeEventPayload = (payload) => {
    const date = payload.date ? new Date(payload.date) : null;
    const normalizedCapacity = payload.capacity !== undefined ? Number(payload.capacity) : undefined;
    const normalizedImageUrl = sanitizeText(payload.imageUrl, { maxLength: 500 });
    return {
        title: sanitizeText(payload.title, { maxLength: 120 }),
        description: sanitizeText(payload.description, { maxLength: 1000 }),
        location: sanitizeText(payload.location, { maxLength: 120 }),
        date,
        bloodGroups: Array.isArray(payload.bloodGroups)
            ? payload.bloodGroups.filter((group) => VALID_BLOOD_GROUPS.includes(group))
            : undefined,
        capacity: normalizedCapacity,
        imageUrl: normalizedImageUrl || undefined,
    };
};

const validateFutureDate = (date) => {
    if (!date || Number.isNaN(date.getTime())) {
        return false;
    }
    return date.getTime() > Date.now();
};


// GET ALL EVENTS

const getAllEvents = asyncHandler(async (req,res)=>{

const events = await Event.find().sort({date:1});

res.json({

success:true,
events

});

});



// CREATE EVENT

const createEvent = asyncHandler(async (req,res)=>{

const {
title,
description,
location,
date,
bloodGroups,
capacity,
imageUrl
} = req.body;

const normalized = normalizeEventPayload({
title,
description,
location,
date,
bloodGroups,
capacity,
imageUrl
});

if(!normalized.title || !normalized.description || !normalized.location || !normalized.date || Number.isNaN(normalized.date.getTime())){

res.status(400);
throw new Error("Please Fill All Fields");

}

if (!validateFutureDate(normalized.date)) {
res.status(400);
throw new Error('Event date must be in the future');
}

if (normalized.description.length < 10) {
res.status(400);
throw new Error('Event description must be at least 10 characters');
}

if (normalized.capacity !== undefined && normalized.capacity < 1) {
res.status(400);
throw new Error('Capacity must be at least 1');
}

if (!Array.isArray(bloodGroups)) {
res.status(400);
throw new Error('bloodGroups must be an array');
}

if (!Array.isArray(normalized.bloodGroups) || normalized.bloodGroups.length === 0 || normalized.bloodGroups.length !== bloodGroups.length) {
res.status(400);
throw new Error('At least one valid blood group is required');
}

const event = await Event.create({

title: normalized.title,
description: normalized.description,
location: normalized.location,
date: normalized.date,
bloodGroups: normalized.bloodGroups,
capacity: normalized.capacity,
imageUrl: normalized.imageUrl

});

res.status(201).json({

success:true,
event

});

});




// UPDATE EVENT

const updateEvent = asyncHandler(async (req,res)=>{

if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
res.status(400);
throw new Error('Invalid event id');
}

const event = await Event.findById(req.params.id);

if(!event){

res.status(404);
throw new Error("Event Not Found");

}

const normalized = normalizeEventPayload(req.body);

if (req.body.date !== undefined && normalized.date === null) {
res.status(400);
throw new Error('Invalid event date');
}

if (normalized.title !== undefined) event.title = normalized.title;
if (normalized.description !== undefined) event.description = normalized.description;
if (normalized.location !== undefined) event.location = normalized.location;
if (normalized.date !== undefined && normalized.date !== null) {
if (Number.isNaN(normalized.date.getTime())) {
res.status(400);
throw new Error('Invalid event date');
}

if (!validateFutureDate(normalized.date)) {
res.status(400);
throw new Error('Event date must be in the future');
}

event.date = normalized.date;
}
if (normalized.bloodGroups !== undefined) {
if (!Array.isArray(req.body.bloodGroups)) {
res.status(400);
throw new Error('bloodGroups must be an array');
}

if (req.body.bloodGroups.length === 0 || normalized.bloodGroups.length === 0) {
res.status(400);
throw new Error('At least one valid blood group is required');
}
event.bloodGroups = normalized.bloodGroups;
}
if (normalized.capacity !== undefined) {
if (!Number.isFinite(normalized.capacity) || normalized.capacity < event.registeredCount || normalized.capacity < 1) {
res.status(400);
throw new Error('Capacity cannot be less than registered users');
}
event.capacity = normalized.capacity;
}
if (req.body.imageUrl !== undefined && normalized.imageUrl) event.imageUrl = normalized.imageUrl;

await event.save();

res.json({

success:true,
event

});

});




// DELETE EVENT

const deleteEvent = asyncHandler(async (req,res)=>{

if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
res.status(400);
throw new Error('Invalid event id');
}

const event = await Event.findById(req.params.id);

if(!event){

res.status(404);
throw new Error("Event Not Found");

}

await event.deleteOne();

res.json({

success:true,
message:"Event Deleted"

});

});



// START EVENT

const startEvent = asyncHandler(async (req, res) => {

if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
res.status(400);
throw new Error('Invalid event id');
}

const event = await Event.findById(req.params.id);

if (!event) {
res.status(404);
throw new Error('Event Not Found');
}

if (event.status === 'live') {
res.status(400);
throw new Error('Event is already live');
}

if (event.status === 'ended') {
res.status(400);
throw new Error('Ended events cannot be started again');
}

event.status = 'live';
event.startedAt = new Date();
event.endedAt = null;

await event.save();

res.json({
success: true,
message: 'Event started successfully',
event,
});

});



// END EVENT

const endEvent = asyncHandler(async (req, res) => {

if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
res.status(400);
throw new Error('Invalid event id');
}

const event = await Event.findById(req.params.id);

if (!event) {
res.status(404);
throw new Error('Event Not Found');
}

if (event.status === 'ended') {
res.status(400);
throw new Error('Event is already ended');
}

if (event.status !== 'live') {
res.status(400);
throw new Error('Only live events can be ended');
}

event.status = 'ended';
event.endedAt = new Date();

await event.save();

res.json({
success: true,
message: 'Event ended successfully',
event,
});

});



// POSTPONE EVENT

const postponeEvent = asyncHandler(async (req, res) => {

if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
res.status(400);
throw new Error('Invalid event id');
}

const event = await Event.findById(req.params.id);

if (!event) {
res.status(404);
throw new Error('Event Not Found');
}

if (event.status === 'ended') {
res.status(400);
throw new Error('Ended events cannot be postponed');
}

if (event.status === 'live') {
res.status(400);
throw new Error('Live events cannot be postponed. End event first.');
}

const nextDate = req.body.date ? new Date(req.body.date) : null;

if (!nextDate || Number.isNaN(nextDate.getTime())) {
res.status(400);
throw new Error('A valid future date is required to postpone event');
}

if (!validateFutureDate(nextDate)) {
res.status(400);
throw new Error('Postponed date must be in the future');
}

const reason = sanitizeText(req.body.reason, { maxLength: 240 });

event.postponedFrom = event.date;
event.date = nextDate;
event.status = 'postponed';
event.postponeReason = reason || null;

await event.save();

res.json({
success: true,
message: 'Event postponed successfully',
event,
});

});




// REGISTER EVENT (REAL SYSTEM)

const registerForEvent = asyncHandler(async (req,res)=>{

if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
res.status(400);
throw new Error('Invalid event id');
}

const event = await Event.findOneAndUpdate(
{
_id: req.params.id,
$or: [{ status: 'scheduled' }, { status: 'postponed' }],
$expr: { $lt: ['$registeredCount', '$capacity'] },
registeredUsers: { $ne: req.user._id }
},
{
$addToSet: { registeredUsers: req.user._id },
$inc: { registeredCount: 1 }
},
{ new: true }
);

if(!event){

const existingEvent = await Event.findById(req.params.id);

if (!existingEvent) {
res.status(404);
throw new Error("Event Not Found");
}

if (existingEvent.registeredUsers.some((userId) => userId.toString() === req.user._id.toString())) {
res.status(409);
throw new Error('You are already registered for this event');
}

if (existingEvent.registeredCount >= existingEvent.capacity) {
res.status(400);
throw new Error('Event Full');
}

if (existingEvent.status === 'ended') {
res.status(400);
throw new Error('Registration closed for ended events');
}

res.status(409);
throw new Error('Unable to register for event at this time');

}

res.json({

success:true,
message:"Registration Successful"

});

});



module.exports = {

getAllEvents,
createEvent,
updateEvent,
deleteEvent,
startEvent,
endEvent,
postponeEvent,
registerForEvent

};