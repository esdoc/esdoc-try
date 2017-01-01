const path = require('path');
const child_process = require('child_process');

class Process {
  static exec(cmd) {
    return new Promise(function(resolve, reject){
      cmd = cmd.replace(/\//g, path.sep);
      child_process.exec(cmd, {stdio: 'inherit'}, function(error){
        error ? reject(error) : resolve();
      });
    });
  }
}

module.exports = Process;
