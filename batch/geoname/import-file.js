var geonames = require('geonames-stream');
var through = require('through2');
var fs = require('fs');

// Clone Utility
var clone = require('safe-clone-deep');

// Elasctic Client
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'info'
});

// Index Writer
var Writable = require('writable-stream-parallel').Writable;
var esIndex = new Writable({objectMode: true, maxWrites: 2});
esIndex._write = function(chunk, encoding, next) {
    client.index(chunk, function (err, resp) {
        next();
        if (err) {
            console.error(err);
        } else {
            //  console.log(resp);
        }
    });
};


// Open Strem
var fsRead = fs.createReadStream('allCountries.zip', {
    'flags': 'r',
    autoClose: true,
    mode: 0666,
    'bufferSize': 4 * 1024
});

fsRead
    .pipe(geonames.pipeline)
    .pipe(through.obj(function (data, enc, next) {
        //   fsRead.pause();
        // console.log(data);
        var entity = clone(data);
        delete entity._id;
        // console.log(entity);
        var opt = {
            index: 'geonames2',
            type: data.country_code,
            refresh: false,
            id: data._id,
            body: entity
        };
        this.push(opt);
        next();
    }))
//    .pipe(through.obj(function (data, enc, next) {
//        console.log(data);
//        client.index(opt, function (err, resp) {
//            next();
//            if (err) {
//                console.error(err);
//            } else {
//                //  console.log(resp);
//            }
//        });
//    }))
    .pipe(esIndex)

;


