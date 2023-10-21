// Copyright (c) 2019 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at http://mozilla.org/MPL/2.0/.

const fs = require('fs')
const Log = require('../lib/logging')
const path = require('path')
const { spawnSync } = require('child_process')
const util = require('../lib/util')

Log.progress('Performing initial checkout of express-core')

const expressCoreDir = path.resolve(__dirname, '..', 'src', 'express')
const expressCoreRef = util.getProjectVersion('express-core')

if (!fs.existsSync(path.join(expressCoreDir, '.git'))) {
  Log.status(`Cloning express-core [${expressCoreRef}] into ${expressCoreDir}...`)
  fs.mkdirSync(expressCoreDir)
  util.runGit(expressCoreDir, ['clone', util.getNPMConfig(['projects', 'express-core', 'repository', 'url']), '.'])
  util.runGit(expressCoreDir, ['checkout', expressCoreRef])
}
const expressCoreSha = util.runGit(expressCoreDir, ['rev-parse', 'HEAD'])
Log.progress(`express-core repo at ${expressCoreDir} is at commit ID ${expressCoreSha}`)

let npmCommand = 'npm'
if (process.platform === 'win32') {
  npmCommand += '.cmd'
}

util.run(npmCommand, ['install'], { cwd: expressCoreDir })

util.run(npmCommand, ['run', 'sync' ,'--', '--init'].concat(process.argv.slice(2)), {
  cwd: expressCoreDir,
  env: process.env,
  stdio: 'inherit',
  shell: true,
  git_cwd: '.', })
