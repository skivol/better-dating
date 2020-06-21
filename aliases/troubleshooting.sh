#!/bin/bash

# Example usage with cron (for example, every 15 and every 10 minutes):
# $ crontab -e
# 0/15 * * * * flock -w 0 -s 200 /home/user/troubleshooting.sh >/dev/null 2>&1
#
# Tracking reboots:
# @reboot echo "$(date -u) - System start up" >> /home/user/reboot.log
# flock is used for avoiding running several commands simultaneously (https://linux.die.net/man/1/flock)
#
# https://cronitor.io/cron-reference/cron-troubleshooting-guide

# check number of healthy services
healthyServices=$(docker ps --filter "health=healthy" --format "{{.ID}}" | wc -l)

if [ $healthyServices -eq 4 ]; then
    echo "Looks good!"
else
    logFile=~/troubleshooting.log
    function now {
        echo $(date -u)
    }
    # if not 4, then some service is down (for example, stuck in "created" state) -> restart docker
    echo "Some services seem to be down!"

    inCreatedState=$(docker ps --filter "status=created" --format "{{.ID}}")
    if [ ! -z "$inCreatedState" ]; then
        echo "Some services seem to be stuck in created state! ($inCreatedState)"
        echo $(now)" - Removing ($inCreatedState) containers in created state" >> $logFile
        docker rm -f $inCreatedState
    fi

    echo $(now)" - Restarting docker" >> $logFile

    sudo systemctl restart docker

    echo $(now)" - Done" >> $logFile
fi
