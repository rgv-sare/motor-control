This directory contains Javascript tools that can be utilized to aid with development/building.

This readme me file contains all the help information for each script. You may refer
to this file for help information or pass the -h, --help flag when executing a script
to print out help information for that script.

If adding help information for a new script, you must use the following format:
  
  Script: <script_name>
    <help_info>
  EndScript

or else the -h, --help functionality for that script may not work.

Script: save-version.js
  Usage: [app-version]

  Description: Saves the specified version semantic to all files that stores
  the app's version automatically. If [app-version] is not specified, then
  the script will get it from package.json at the root of the repository.

  How to Use: This script will open the following files:
    -client/src/components/Footer.jsx

  These files will be modified to replace the version semantics they store.
  The user may pass no more than one parameter to the script. The parameter
  [app-version] accepts the app version if specified. Otherwise, it will
  be replaced with the version number defined in package.json.

  Example: :$node save_version.js 1.2.3
EndScript