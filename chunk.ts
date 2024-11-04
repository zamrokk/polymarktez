// SCRIPT CHUNKING A FILE IN X FILE < Ko

import fs from "fs";
import path from "path";
import base64 from "@juanelas/base64"

const MAX_FILE_SIZE = 3915 - 150; // 3915octet is the MAX

function splitFile(inputPath: string, outputDir: string): void {
  const fileData = base64.encode(
    //JSON.stringify(
      fs
        .readFileSync(inputPath)
        .subarray(25, fs.readFileSync(inputPath).length - 2)
        .toString()
    //)
  ,true,true); // removing first 25 char and 2 last char semi colon + eof
  console.log(fileData);

  //console.log(atob(fileData))

  //2. get total size

  const fileSize = fileData.length;
  const numFiles = Math.ceil(fileSize / MAX_FILE_SIZE); //base 64 is bigger
  //3. loop x times to create x files <4ko

  for (let i = 0; i < numFiles; i++) {
    const start = i * MAX_FILE_SIZE;
    const end = Math.min((i + 1) * MAX_FILE_SIZE, fileSize);
    const chunk = fileData.slice(start, end);
    const outputPath = path.join(outputDir, `part-${i + 1}.txt`);
    fs.writeFileSync(outputPath, chunk);
    console.log(`Saved file chunk to ${outputPath}`);
  }

  console.log(`Successfully split file into ${numFiles} parts.`);
}

const [, , inputPath, outputDir] = process.argv;
splitFile(inputPath, outputDir);
