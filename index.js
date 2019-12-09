const unicodeLoremIpsum = '却朝徳禁載陳実違更育趣常争立流改交。病並選帯審阪鉄箱都打東売。暢官内能団積森集商造泉治通変末。情断保成理長取属事店哲著供払';


const zlib = require('zlib');
const stream = require('stream');
const throttle = require('stream-throttle');


function gzipString(stringContent) {
    const gzip = zlib.createGzip();
    const buffer = Buffer.from(stringContent, 'utf-8');
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    return new Promise(resolve => {
        let content = [];
        gzip.on('data', function (chunk) {
            content.push(chunk);
        });
        gzip.on('end', () => resolve(Buffer.concat(content)));
        bufferStream.pipe(gzip);
    })
}

function gunzipConcatStrings(gzippedBuffer) { //This is the default prerender-node's behaviour 
    const gunzip = zlib.createGunzip();
    const gzippedStream = new stream.PassThrough();
    gzippedStream.end(gzippedBuffer);
    const throttleStream = new throttle.Throttle({ rate: 1024, chunksize: 1 }); //Here we emulate the worst situation - each chunk is only 1 byte
    return new Promise(resolve => {
        let content = '';
        gunzip.on('data', function (chunk) {
            content += chunk;
        });
        gunzip.on('end', () => resolve(content));
        gzippedStream.pipe(throttleStream).pipe(gunzip);
    })
}

function gunzipConcatBuffers(gzippedBuffer) { //Fixed
    const gunzip = zlib.createGunzip();
    const gzippedStream = new stream.PassThrough();
    gzippedStream.end(gzippedBuffer);
    const throttleStream = new throttle.Throttle({ rate: 1024, chunksize: 1 }); //Here we emulate the worst situation - each chunk is only 1 byte
    return new Promise(resolve => {
        let content = [];
        gunzip.on('data', function (chunk) {
            content.push(chunk);
        });
        gunzip.on('end', () => resolve(Buffer.concat(content).toString()));
        gzippedStream.pipe(throttleStream).pipe(gunzip);
    })
}

async function run() {
    console.log('START');
    const gzippedBuffer = await gzipString(unicodeLoremIpsum);
    console.log(`Corrupted string: ${await gunzipConcatStrings(gzippedBuffer)}`);
    console.log(`Healthy string: ${await gunzipConcatBuffers(gzippedBuffer)}`);
    console.log('END');
};

run();