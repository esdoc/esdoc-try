// init code mirror
const sourceCodeCM = CodeMirror(function(elt) {
  const textarea = document.querySelector('#source');
  textarea.parentNode.replaceChild(elt, textarea);
}, {mode: 'javascript', lineNumbers: true, value: 'export default class Foo{}'});

const testCodeCM = CodeMirror(function(elt) {
  const textarea = document.querySelector('#test');
  textarea.parentNode.replaceChild(elt, textarea);
}, {mode: 'javascript', lineNumbers: true, value: 'describe("foo", ()=>{})'});

const manualCM = CodeMirror(function(elt) {
  const textarea = document.querySelector('#manual');
  textarea.parentNode.replaceChild(elt, textarea);
}, {mode: 'markdown', lineNumbers: true, value: '# Foo'});

// handle tab buttons
const tabs = document.querySelectorAll('.tab-container > div');
const tabButtons = document.querySelectorAll('.tab-buttons [data-target]');
for (const tabButton of Array.from(tabButtons)) {
  tabButton.addEventListener('click', (ev)=>{
    const targetId = ev.target.dataset.target;
    for (const tab of Array.from(tabs)) {
      if (tab.id === targetId) {
        tab.style.zIndex = 100;
      } else {
        tab.style.zIndex = 0;
      }
    }
  });
}

// handle try button
const tryEl = document.querySelector('#tryButton');
const inputErrorMessageEl = document.querySelector('#inputErrorMessage');
const outputErrorMessageEl = document.querySelector('#outputErrorMessage');

function showInputError(message) {
  inputErrorMessageEl.style.display = null;
  inputErrorMessageEl.textContent = message;
}

function showOutputError(message) {
  outputErrorMessageEl.style.display = null;
  outputErrorMessageEl.textContent = message;
}

tryEl.addEventListener('click', ()=>{
  const sourceCode = sourceCodeCM.getValue();
  const testCode = testCodeCM.getValue();
  const manual = manualCM.getValue();

  inputErrorMessageEl.style.display = 'none';
  outputErrorMessageEl.style.display = 'none';

  // check syntax: source code
  {
    const [error, errorMessage] = checkSyntax(sourceCode);
    if (error) {
      showInputError(errorMessage);
      return;
    }
  }

  // check syntax: test code
  {
    const [error, errorMessage] = checkSyntax(testCode);
    if (error) {
      showInputError(errorMessage);
      return;
    }
  }

  // generate
  window.ESDoc.post(sourceCode, testCode, manual, (error, res)=>{
    if (error) {
      showOutputError(res);
      return;
    }

    let destURL;
    try {
      destURL = JSON.parse(res).path;
    } catch (e) {
      showOutputError(e.message);
      return;
    }

    // polling
    const outputPath = JSON.parse(res).path;
    window.ESDoc.polling(outputPath + '/.finish.json', 10000, (error, resText)=>{
      if (error) {
        showOutputError(error.message);
        return;
      }

      try {
        const res = JSON.parse(resText);
        if (res.success) {
          console.log(destURL);
        } else {
          showOutputError(res.message);
        }
      } catch (e) {
        showOutputError(e.message);
      }
    });
  });
});

// check syntax of codes
function checkSyntax(code) {
  const babylon = window.exports.parse;
  const option = {
    sourceType: 'module',
    plugins: [
      'jsx',
      'flow',
      'doExpressions',
      'objectRestSpread',
      'decorators',
      'classProperties',
      'exportExtensions',
      'asyncGenerators',
      'functionBind',
      'functionSent',
      'dynamicImport'
    ]
  };

  try {
    babylon(code, option);
    return [null, null];
  } catch (e) {
    const lineNumber = e.loc.line - 1;
    const columnNumber = e.loc.column;
    const codeLines = code.split('\n');
    const errorMessages = [e.message];
    for (let i = lineNumber, counter = 0; counter < 5 && i < codeLines.length; i++, counter++) {
      const l = (i + 1) < 10 ? ` ${i + 1}` : `${i + 1}`;
      if (counter === 0) {
        errorMessages.push(`> ${l} | ${codeLines[i]}`);
        errorMessages.push('       ' + ' '.repeat(columnNumber) + '^');
      } else {
        errorMessages.push(`  ${l} | ${codeLines[i]}`);
      }
    }
    return [e, errorMessages.join('\n')];
  }
}

function post(sourceCode, testCode, manual) {
}
