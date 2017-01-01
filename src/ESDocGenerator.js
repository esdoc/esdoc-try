const Process = require('./Util/Process.js');
const fs = require('fs-extra');
const path = require('path');
const co = require('co');
const moment = require('moment');
const Logger = require('./Util/Logger.js');

class ESDocGenerator {
  constructor({indexCode, sourceCode, testCode, manualCode, configCode, sessionId}, destinationDirPath) {
    this._indexCode = indexCode;
    this._sourceCode = sourceCode;
    this._testCode = testCode;
    this._manualCode = manualCode;
    this._configCode = configCode;
    this._destinationDirPath = path.resolve(destinationDirPath);
    this._inputDirPath = `${sessionId}/source`;
    this._outputDirPath = `${sessionId}/out`;
  }

  get outDirPath() {
    return this._outputDirPath;
  }

  get outDirFullPath() {
    return `${this._destinationDirPath}/${this._outputDirPath}`;
  }

  exec() {
    const inputDirPath = `${this._destinationDirPath}/${this._inputDirPath}`;
    const outputDirPath = `${this._destinationDirPath}/${this._outputDirPath}`;
    const esdocConfigPath = `${inputDirPath}/esdoc.json`;
    const esdocConfig = this._buildESDocConfig(inputDirPath, outputDirPath, this._configCode);

    // clean up
    fs.removeSync(inputDirPath);
    fs.removeSync(outputDirPath);

    // write files
    this._writeESDocConfig(esdocConfigPath, esdocConfig);
    this._writePackageJSON(esdocConfig);
    this._writeIndexCode(esdocConfig, this._indexCode);
    this._writeSourceCode(esdocConfig, this._sourceCode);
    this._writeTestCode(esdocConfig, this._testCode);
    this._writeManualCode(esdocConfig, this._manualCode);

    return co(function*() {
      // exec esdoc
      try {
        const cmd = `esdoc -c ${esdocConfigPath}`;
        Logger.d(cmd);
        yield Process.exec(cmd);
      } catch(e) {
        throw new Error('Fail esdoc. Please check your codes');
      }

      // clean up
      // fs.removeSync(inputDirPath);

      Logger.d(`finish: ${outputDirPath}`);
    });
  }

  _buildESDocConfig(inputDirPath, outputDirPath, userConfigCode) {
    const sourceDirPath = `${inputDirPath}/src`;
    const testDirPath = `${inputDirPath}/test`;
    const manualDirPath = `${inputDirPath}/manual`;

    let userConfig = {};
    try {
      userConfig = JSON.parse(userConfigCode);
    } catch(e) {
      // do nothing
    }

    userConfig.source = sourceDirPath;
    userConfig.destination = outputDirPath;
    userConfig.index = `${inputDirPath}/README.md`;
    userConfig.package = `${inputDirPath}/package.json`;

    if (this._testCode) {
     userConfig.test = {
        type: 'mocha',
        source: testDirPath,
      }
    }

    if (this._manualCode) {
      userConfig.manual = {
        // index: `${manualDirPath}/index.md`,
        usage: [`${manualDirPath}/usage.md`]
      }
    }

    return userConfig;
  }

  _writeESDocConfig(configPath, esdocConfig) {
    fs.outputFileSync(configPath, JSON.stringify(esdocConfig, null, 2));
  }

  _writePackageJSON(esdocConfig) {
    fs.copySync('./src/template/package.json', esdocConfig.package);
  }

  _writeIndexCode(esdocConfig, indexCode) {
    fs.outputFileSync(esdocConfig.index, indexCode);
  }

  _writeSourceCode(esdocConfig, sourceCode) {
    const filePath = `${esdocConfig.source}/index.js`;
    fs.outputFileSync(filePath, sourceCode);
  }

  _writeTestCode(esdocConfig, testCode) {
    if (!testCode) return;

    const filePath = `${esdocConfig.test.source}/indexTest.js`;
    fs.outputFileSync(filePath, testCode);
  }

  _writeManualCode(esdocConfig, manualCode) {
    if (!manualCode) return;

    const filePath = esdocConfig.manual.usage[0];
    fs.outputFileSync(filePath, manualCode);

    // fs.ensureFileSync(esdocConfig.manual.index);
    // fs.copySync('./src/template/MANUAL_INDEX.md', esdocConfig.manual.index);
  }
}

module.exports = ESDocGenerator;
