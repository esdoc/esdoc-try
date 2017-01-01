import co from 'co';
import fs from 'fs-extra';
import ESDocGenerator from './ESDocGenerator';
import Logger from './Util/Logger.js';

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
    const sourceCode = req.body.sourceCode;
    const testCode = req.body.testCode;
    const manualCode = req.body.manual;

    // check processing count.
    if (processing.length >= MaxProcess) {
      Logger.e(`processing is max. ${gitUrl}`);
      res.json({success: false, message: 'System is busy. Please try after a little.'});
      return;
    }

    processing.push(sourceCode);

    const generator = new ESDocGenerator({sourceCode, testCode, manualCode}, this._destinationDirPath);
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

export default new API();
