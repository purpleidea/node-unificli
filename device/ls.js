'use strict';
const columnify = require('columnify')
    , accessDevice = require('node-unifi-settings').accessDevice;

var deps = { };

var columns = {
    _: {
        name: 'name',
        ip: 'ip',
        mac: 'mac',
        model: 'model',
        version: 'version'
    },
    'ugw,usw': {
        'data down': 'txstat',
        'data up': 'rxstat'
    },
    uap: {
        clients: 'num_sta',
        channel: 'channel',
    },
    all: {
        uptime: 'uptime'
    }
}

function listAccessDevices(called, args) {
    var unifi = deps.unifi;
    var config = deps.config;

    var type = 'all';
    var coltype=type;
    if (args.type) {
        type = args.type;
        switch(type) {
            case 'usw':
            case 'ugw':
            case 'ugw,usw':
            case 'usw,ugw':
                coltype='ugw,usw';
                break;
        default:
            coltype=type;
        }
    }
    var filtype = type;
    var fcol = { };
    Object.assign(fcol, columns._, columns[coltype])

    unifi.list_aps('', config.site)
        .then(data => {
            var devices = data.data;
            var output = [ ];
            var devObjs = [ ];
            for(key in devices) {
                var dev = new accessDevice(devices[key]);

                dev.human = (args.human !== 'false');

                if (filtype !== 'all') {
                    var types = filtype.split(',');
                    if (types.indexOf(dev.type) === -1)
                       continue;
                }

                var tmp = { };
                Object.keys(fcol).forEach(function(key, index) {
                    if (dev[fcol[key]]) {
                        tmp[key] = dev[fcol[key]];
                    }
                });
                output.push(tmp)

            }
            console.log(columnify(output));
        })
        .catch(err => {throw err});
}

module.exports = {
    login: true,
    func: listAccessDevices,
    deps: deps
}
