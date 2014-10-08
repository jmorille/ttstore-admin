var http = require('http');
var url = require('url');
var request = require('request');
var gstream = require('geonames-stream');
var through = require('through2');

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
});

// http://download.geonames.org/export/dump/allCountries.zip

request.get( 'http://download.geonames.org/export/dump/FR.zip')
    .pipe(gstream.pipeline)
    .pipe(through.obj(function (data, enc, next) {
        console.log(data);
        var geoline = {
            geonameid: data._id,
            name: data.name,
            asciiname: data.asciiname,
            alternatenames: data.alternatenames,
            //loc: [fields[4], fields[5]],
            feature_class: data.feature_class,
            feature_code: data.feature_code,
            country_code: data.country_code,
            alternatenames: data.alternatenames,
            cc2: data.cc2,
            admin1: data.admin1_code,
            admin2: data.admin2_code,
            admin3: data.admin3_code,
            admin4: data.admin4_code,
            population: data.population,
            elevation: data.elevation,
            dem: data.dem,
            timezone: data.timezone,
            modification_date: data.modification_date
        };
        console.log(geoline);
    }));