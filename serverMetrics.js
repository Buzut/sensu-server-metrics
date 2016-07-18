#!/usr/bin/nodejs

// currently https://github.com/Buzut/systeminformation needed
const fs = require('fs');
const si = require('systeminformation');
const _ = require('lodash');
const ps = require('current-processes');

// read config file
var clientJSON;
try {
    clientJSON = '/etc/sensu/client.json';
    fs.statSync(clientJSON);
}
catch (e) {
    try {
        clientJSON = '/etc/sensu/conf.d/client.json';
        fs.statSync(clientJSON);
    }
    catch (e) {
        console.log('client.json can\'t be found or read neither in sensu root nor in conf.d');
        process.exit(3);
    }
}

var clientConf = fs.readFileSync(clientJSON);
clientConf = JSON.parse(clientConf);
const hostname = clientConf.client.name;

// don't start it at the same time as ps as it generates load by itself
setTimeout(function(){
    si.getAllData((data) => {
        console.log(`cpu_load,host=${hostname} value=${data.currentLoad.currentload}`);

        // http://www.binarytides.com/linux-command-check-memory-usage/
        // Used - (buffered + cached) = buffer/cache used
        // Total - buffer/cache used = really avail

        var ram = (data.mem.used - data.mem.buffcache) * (100 / data.mem.total);
        var swap = (data.mem.swaptotal === 0) ? 0 : data.mem.swapused * (100 / data.mem.swaptotal);
        console.log(`ram_used,host=${hostname} value=${ram}`);
        console.log(`swap_used,host=${hostname} value=${swap}`);

        // volumes IOPS
        console.log(`disk_rIOPS,host=${hostname} value=${data.fsStats.rIOPS}`);
        console.log(`disk_wIOPS,host=${hostname} value=${data.fsStats.wIOPS}`);
        console.log(`disk_tIOPS,host=${hostname} value=${data.fsStats.totalIOPS}`);

        // network transmit rates
        var netRx = data.networkStats.rx_sec;
        var netTx = data.networkStats.tx_sec;
        console.log(`network_rx,host=${hostname} value=${netRx}`);
        console.log(`network_tx,host=${hostname} value=${netTx}`);

        // fs usage
        data.fsSize.forEach((el) => {
            var watchedMounts = ['/', '/dev', '/home'];

            if (watchedMounts.indexOf(el.mount) !== -1) {
                console.log(`fs_usage,host=${hostname},volume=${el.mount} value=${el.use}`);
            }
        });
    });
}, 1000);

ps.get((err, processes) => {
    // get five most CPU hungry
    var sorted = _.sortBy(processes, 'cpu');
    var top5  = sorted.reverse().splice(0, 6);

    top5.forEach((el) => {
        // avoid the observer effect
        if (el.name === 'metrics.js') return;

        var cleanName = el.name.replace(' ', '_');
        console.log(`process_cpu,host=${hostname},name=${cleanName} value=${el.cpu}`);
        console.log(`process_mem,host=${hostname},name=${cleanName} value=${el.mem.usage}`);
    });
});
