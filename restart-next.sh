#!/bin/bash
kill $(lsof -ti:3000) 2>/dev/null
sleep 2
cd /Users/djag/Documents/Vocalize/vocalize
nohup /usr/local/bin/node node_modules/.bin/next dev --port 3000 --webpack > /tmp/next-dev.log 2>&1 &
echo "Started PID $!"
