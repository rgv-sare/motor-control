const fs = require('fs');
const path = require('path');

const toolsInfo = require(`./tools-config.json`);

let readmeFile = fs.readFileSync(toolsInfo.readme_file, "utf8");
let readme = readmeFile;

function needHelp(args) {
  return args.some(arg => arg === "-h" || arg === "--help");
}

function getToolName(file) {
  file = path.basename(file);
  let toolName = "unknown";
  try {
    toolName = toolsInfo.scripts[file]["name"];
  } catch (error) {
    console.log(`Script "${file}" is not known in tools-config.json`);
  }
  return toolName;
}

function getToolHelp(file) {
  file = path.basename(file);
  let toolHelp = "not available";
  let copy = false;
  let lines = readme.split('\n');
  for (let line of lines) {
    if (line.startsWith(`Script: ${file}`)) {
      toolHelp = "";
      copy = true;
    } else if (line.startsWith("EndScript") && copy) {
      break;
    }
    if (copy) {
      toolHelp += line + '\n';
    }
  }
  return toolHelp;
}

function getToolOptions(file) {
  file = path.basename(file);
  let toolParameters = null;
  try {
    toolParameters = toolsInfo.scripts[file]["options"];
  } catch (error) {
    console.log(`Script "${file}" appears to not have any options stored in tools-config.json`);
  }
  return toolParameters;
}

function main() {
  console.log("This is a module to manage the tools. Run other scripts instead:\n");
  console.log("Add the flag -h or --help to receive help information for that script\n");
  const scripts = toolsInfo.scripts;
  for (let script in scripts) {
    if (script === "mod_tools.py") {
      continue;
    }
    let toolName = scripts[script]["name"];
    let toolSummary = scripts[script]["summary"];
    console.log(`[${script}] ${toolName}: ${toolSummary}\n`);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  needHelp,
  getToolName,
  getToolHelp,
  getToolOptions
};