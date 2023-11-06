#!/usr/bin/bash
# this file is copied over to /usr/bin/ when deployed to server
# the actual script used in cronjob stored in /usr/bin/
NODE_ENV=production /usr/local/bin/node /Users/mohamad/notion-schoology-integration/index.js >> /Users/mohamad/notion-schoology-integration/cron.log 2>&1