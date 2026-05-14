#!/bin/bash
export PATH=/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:$PATH
cd /Users/djag/Documents/Vocalize/vocalize
exec node node_modules/.bin/next dev --port 3000 --webpack
