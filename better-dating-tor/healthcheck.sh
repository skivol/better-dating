#!/bin/sh
# [How to check if Tor is working and debug the problem on CLI?](https://tor.stackexchange.com/questions/12678/how-to-check-if-tor-is-working-and-debug-the-problem-on-cli)
status=$(curl --socks5 localhost:9050 --socks5-hostname localhost:9050 -s https://check.torproject.org/ | cat | grep -m 1 Congratulations | wc -l)

if [ $status -eq 1 ]; then
    exit 0
fi;

exit 1