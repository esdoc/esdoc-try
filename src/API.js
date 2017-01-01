const co = require('co');
const fs = require('fs-extra');
const ESDocGenerator = require('./ESDocGenerator');
const Logger = require('./Util/Logger.js');

const processing = [];
const MaxProcess = 10;

class API {
  constructor() {
    this._destinationDirPath = './www/out/';
  }

  set destinationDirPath(dest) {
    this._destinationDirPath = dest;
  }

  create(req, res) {
    const sessionId = req.body.sessionId;
    const indexCode = req.body.indexCode;
    const sourceCode = req.body.sourceCode;
    const testCode = req.body.testCode;
    const manualCode = req.body.manualCode;
    const configCode = req.body.configCode;

    // check processing count.
    if (processing.length >= MaxProcess) {
      Logger.e(`processing is max.`);
      res.json({success: false, message: 'System is busy. Please try after a little.'});
      return;
    }

    processing.push(sourceCode);

    const generator = new ESDocGenerator({indexCode, sourceCode, testCode, manualCode, configCode, sessionId}, this._destinationDirPath);
    fs.removeSync(generator.outDirFullPath);

    const promise = co(function*(){
      try {
        yield generator.exec();
        finish(generator.outDirFullPath, {success: true});
      } catch(e) {
        Logger.e(e);
        finish(generator.outDirFullPath, {success: false, message: e.message});
      }

      const index = processing.indexOf(sourceCode);
      processing.splice(index, 1);
    });

    res.json({success: true, path: `/out/${generator.outDirPath}`});

    return promise;
  }
}

function finish(dirFullPath, obj) {
  fs.outputFileSync(`${dirFullPath}/.finish.json`, JSON.stringify(obj, null, 2));
}

module.exports = new API();
