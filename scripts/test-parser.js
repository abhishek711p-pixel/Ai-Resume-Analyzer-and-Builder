const fs = require('fs');
const pdf = require('pdf-parse');

// The code you want to execute to test the parser:
const { parseResumeText } = require('./client/src/utils/resumeParser.ts'); 
// wait, resumeParser.ts is a TS file, we can't easily require it directly in Node without ts-node.
