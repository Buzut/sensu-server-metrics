#!/usr/bin/nodejs

const fs = require('fs');
const si = require('systeminformation');

// read config file
let clientJSON;
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

let clientConf = fs.readFileSync(clientJSON);
clientConf = JSON.parse(clientConf);

const hostname = clientConf.client.name;
const defaultIface = clientConf.client.defaultIface;
const services = clientConf.client.services;

si.getDynamicData(services, defaultIface, (data) => {
    console.log(`cpu_load,host=${hostname} value=${data.currentLoad.currentload}`);

    // http://www.binarytides.com/linux-command-check-memory-usage/
    // Used - (buffered + cached) = buffer/cache used
    // Total - buffer/cache used = really avail

    var ram = (data.mem.used - data.mem.buffcache) * (100 / data.mem.total);
    var swap = (data.mem.swaptotal === 0) ? 0 : data.mem.swapused * (100 / data.mem.swaptotal);
    console.log(`ram_used,host=${hostname} value=${ram}`);
    console.log(`swap_used,host=${hostname} value=${swap}`);

    data.services.forEach((service) => {
        if (service.running) {
            console.log(`process_cpu,host=${hostname},name=${service.name} value=${service.pcpu}`);
            console.log(`process_mem,host=${hostname},name=${service.name} value=${service.pmem}`);
        }
    });

    // fs usage
    data.fsSize.forEach((el) => {
        const watchedMounts = ['/', '/dev', '/home'];

        if (watchedMounts.indexOf(el.mount) !== -1) {
            console.log(`fs_usage,host=${hostname},volume=${el.mount} value=${el.use}`);
        }
    });

    si.networkStats(defaultIface, (netData) => {
        // network transmit rates
        console.log(`network_rx,host=${hostname} value=${netData.rx_sec}`);
        console.log(`network_tx,host=${hostname} value=${netData.tx_sec}`);
    });

    si.disksIO((diskDatas) => {
        // volumes IOPS
        console.log(`disk_rIOPS,host=${hostname} value=${diskDatas.rIO_sec}`);
        console.log(`disk_wIOPS,host=${hostname} value=${diskDatas.wIO_sec}`);
        console.log(`disk_tIOPS,host=${hostname} value=${diskDatas.tIO_sec}`);
    });
});
