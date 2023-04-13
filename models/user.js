const mongoose= require('mongoose');
const schema= mongoose.Schema;

const userSchema= new schema ({
    fullname: {
        type: String,
        default: ''
    },
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    phone: {
        type: Number
    },
    location: {
        type: String
    },

    fbTokens: Array,              //when we make request to fb database, it will send us back token. Wo data array me store hoga
    facebook: {              
        type: String
    },
    google: {                  //when we request google database, they send us back user's profile picture,name etc. we will save it in our DB and it will be property of this google property of our user collection
        type: String
    },
    instagram: {
        type: String
    }
});

module.exports= mongoose.model('user',userSchema);      //user is passed thorugh userSchema to check the data types for every single data