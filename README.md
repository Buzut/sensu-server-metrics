# sensu-server-metrics
Sensu metric check is a metrics check written in nodejs that gathers server performance indicators

## Prerequisites

* As this check is written in NodeJS, [Node 6+](https://nodejs.org/en/) has to be installed on the system running it.

* The check was initialy written to store data in InfluxDB. Therefore it outputs metrics on `stdin`
and needs an appropriate handler. I have written one in Node that is [available as a Gist](https://gist.github.com/Buzut/dd49ee9c9b589f1035296ef96e63698e).

## Installation

In your Sensu plugins directory run:

`npm install sensu-server-metrics`

Add `defaultIface` if you want to get stats about your network rx & tx and `services` (as a list of comma seperated system service names) to get their CPU & RAM usage.
Exemple:

```json
{
  "client": {
    "name": "lb1",
    "system": "Ubuntu 16.04",
    "cpu": "Intel(R) Atom(TM) CPU  C2750  @ 2.40GHz",
    "cpu_cores": "8",
    "cpu_threads_per_core": "1",
    "ram": "16010MB",
    "defaultIface": "enp0s20f0",
    "address": "63.17.218.135",
    "subscriptions": ["default", "httpd80"],
    "services": "nginx,fail2ban,exim4"
  }
}
```

Finally add the check to your checks file:

```json
{
  "checks": {
    "collect_metrics": {
      "type": "metric",
      "command": "/etc/sensu/plugins/node_modules/sensu-server-metrics/serverMetrics.js",
      "interval": 30,
      "handlers": ["influxdb"],
      "subscribers": ["default"]
    }
  }
}
```

## Metrics

The check gathers the following metrics:
* given system services CPU and RAM usage (in %)
* cpu load (in %)
* RAM usage (in %)
* SWAP usage (in %)
* disk IOPS (read, write, total)
* network rx & tx
* fs usage (in %)
