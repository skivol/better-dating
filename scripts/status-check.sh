#!/bin/bash

# Example usage
# */5 * * * * /home/user/status-check.sh > /dev/null 2>&1

healthyServices=$(docker ps --filter "health=healthy" --format "{{.ID}}" | wc -l)

if [ $healthyServices -ne 4 ]; then
    function now {
        echo $(date -u)
    }
    logFile=~/status.log
    echo $(now)" - Some service is down" >> $logFile
fi
