const fs = require('fs');
const path = require('path');
const modTools = require('./tools');

let files = [];
let appVersion = "";

class Entry {
  constructor(start = "", end = "", format = "", formatParameters = []) {
    this.start = start;
    this.end = end;
    this.format = format;
    this.formatParameters = formatParameters;
  }

  updateParams() {
    let params = [];
    for (let param of this.formatParameters) {
      if (param === "app-version") {
        params.push(appVersion);
      }
    }
    this.formatParameters = params;
  }
}

class FileEntry {
  constructor() {
    this.file = "";
    this.entries = [];
  }

  appendEntry(entry) {
    this.entries.push(entry);
  }

  toString() {
    return `[${this.file}] ${this.entries}`;
  }
}

function readParams() {
  if (process.argv.length == 3) {
    appVersion = process.argv[2];
  } else if (process.argv.length == 2) {
    const packageJson = require('../package.json');
    appVersion = packageJson.version;
    console.log(appVersion);
  } else {
    console.log("usage: [app-version]");
    process.exit();
  }
}

function loadOptions() {
  let options = modTools.getToolOptions(__filename);
  for (let file of options.files) {
    let fileEntry = new FileEntry();
    fileEntry.file = file.file;
    for (let entry of file.entries) {
      let entryEntry = new Entry(entry.start, entry.end, entry.format, entry.formatParameters);
      entryEntry.updateParams();
      fileEntry.appendEntry(entryEntry);
    }
    files.push(fileEntry);
  }
}

function replaceEntries() {
  for (let file of files) {
    let fileContent = "";
    try {
      fileContent = fs.readFileSync(file.file, { encoding: 'utf8' });
    } catch (e) {
      console.log(`Unable to open file "${path.basename(file.file)}", skipping`);
      continue;
    }
    for (let entry of file.entries) {
      let start = 0;
      let end = 0;
      try {
        start = fileContent.indexOf(entry.start);
        end = fileContent.indexOf(entry.end, start) + entry.end.length;
      } catch (e) {
        console.log(`Cannot find entry (${entry.start}), skipping`);
        continue;
      }
      let newContent = "";
      try {
        newContent = entry.format.replace(/%s/g, () => entry.formatParameters.shift());
      } catch (e) {
        console.log(`Syntax error with format (${entry.format}) with params ${entry.formatParameters}, skipping`);
        continue;
      }
      fileContent = fileContent.substring(0, start) + newContent + fileContent.substring(end);
    }
    try {
      fs.writeFileSync(file.file, fileContent);
    } catch (e) {
      console.log(`Unable to modify file "${path.basename(file.file)}", skipping`);
      continue;
    }
    console.log(`Successfully modified file "${path.basename(file.file)}"`);
  }
}

function main() {
  if (modTools.needHelp(process.argv)) {
    console.log(modTools.getToolHelp(__filename));
    return;
  }
  readParams();
  loadOptions();
  replaceEntries();
}

if (require.main === module) {
  main();
}
