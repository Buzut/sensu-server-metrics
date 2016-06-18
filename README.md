# sensu-server-metrics
Sensu metric check is a metrics check written in nodejs that gathers server performance indicators

## Prerequisites

* As this check is written in NodeJS, [Node](https://nodejs.org/en/) has to be installed on the system running it.

* The check was initialy written to store data in a InfluxDB. Therefore it outputs metrics on <code>stdin</code> 
and needs an appropriate handler. I have written one in Node that is [available as a Gist](https://gist.github.com/Buzut/dd49ee9c9b589f1035296ef96e63698e).

## Installation

In your Sensu plugins directory run:

<pre><code>npm install sensu-server-metrics</code></pre>

Then add the check to your checks file:

<pre><code>
{
    "checks": {
        "collect_metrics": {
            "type": "metric",
            "command": "/etc/sensu/plugins/node_modules/sensu-server-metrics/metrics.js",
            "interval": 30,
            "handlers": ["influxdb"],
            "subscribers": ["default"]
        }
    }
}
</pre></code>
