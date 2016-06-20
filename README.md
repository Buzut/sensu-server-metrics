# sensu-server-metrics
Sensu metric check is a metrics check written in nodejs that gathers server performance indicators

## Prerequisites

* As this check is written in NodeJS, [Node](https://nodejs.org/en/) has to be installed on the system running it.

* The check was initialy written to store data in InfluxDB. Therefore it outputs metrics on `stdin`
and needs an appropriate handler. I have written one in Node that is [available as a Gist](https://gist.github.com/Buzut/dd49ee9c9b589f1035296ef96e63698e).

## Installation

In your Sensu plugins directory run:

`npm install sensu-server-metrics`

Note that it's important to have `node_modules` in the `plugins` directory. Otherwise it won't be able to locate `client.json` and read the host name from it.


Finally add the check to your checks file:

```json
{
  "checks": {
    "collect_metrics": {
      "type": "metric",
      "command": "/etc/sensu/plugins/node_modules/serverMetrics.js",
      "interval": 30,
      "handlers": ["influxdb"],
      "subscribers": ["default"]
    }
  }
}
```

## Metrics

The check gathers the following metrics:
* 5 most cpu hungry processes cpu and memory usage
* cpu load (in %)
* RAM usage (in %)
* SWAP usage (in %)
* disk IOPS (read, write, total)
* network rx & tx
* fs usage (in %)
