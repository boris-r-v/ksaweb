const fs = require('fs')
const exec = require('child_process').exec
const versionInfo = JSON.parse(fs.readFileSync('dist/version.json')).version

const modifier = process.argv[2] || 'auto'
const tagName = `v-${versionInfo.version}-${modifier}` 

exec(`git tag "${tagName}" && git push origin : "${tagName}"`)