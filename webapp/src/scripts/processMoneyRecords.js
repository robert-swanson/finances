
// const dfd = import("danfojs")
let processMoneyRecords = (file) => {

    console.log("Processing Uploaded File: " + file)

    const csv = require('csv-parser')
    const fs = require('fs')
    const results = [];

    fs.createReadStream(file)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            console.log(results);
            // [
            //   { NAME: 'Daffy Duck', AGE: '24' },
            //   { NAME: 'Bugs Bunny', AGE: '22' }
            // ]
        });


    return "Uploaded and Processed File: " + file
};

module.exports = processMoneyRecords
