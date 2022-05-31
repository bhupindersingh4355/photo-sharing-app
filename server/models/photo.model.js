const mongoose = require('mongoose');

var photoSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: "User id can't be empty",
    },
    title: {
        type: String,
        required: "Title can't be empty",
        maxlength: [30, 'Title should be 30 characters atmost']
    },
    description: {
        type: String,
        required: "Description can't be empty"
    },
    photo: {
        type: String,
        required: 'Password can\'t be empty',
        minlength: [6, 'Password must be atleast 6 character long']
    },
    create_at: {
        type: Date,
        default: Date.now
    },
    saltSecret: String
});

mongoose.model('Photo', photoSchema);