const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true)
const NoteSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        index: true
    },
    password: String,
    deviceId: String
}, {
    timestamps: true
});

module.exports = mongoose.model('User', NoteSchema);