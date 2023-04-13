if (process.env.NODE_ENV === 'production') {
    module.exports = require('./key-prod');
} else {
    module.exports = require('./keys-dev');
}

//module.exports is used to export folders or files to use in different files/folders