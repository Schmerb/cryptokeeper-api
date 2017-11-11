var cron = require('node-cron');

let base = process.hrtime();

console.log('base: ', base);


cron.schedule('*/5 * * * * *', function(){
    let t = process.hrtime();
    console.log('running a task every min');
    console.log(`it has been ${t[0] - base[0]}seconds since first run`);
});