const fs = require('fs');

exports.deleteFile = (filePath,next) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.log("opps error in remove image");
            next()
        }
    })
};
