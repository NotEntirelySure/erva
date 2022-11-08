const fs = require("fs");

const getImage = (directory, imageName) => {
  let dirExists = fs.existsSync(`../${directory}/${imageName}`);
  if (dirExists) {
    const base64 = fs.readFileSync(`../${directory}/${imageName}`, "base64");
    return base64;
  }
  if (!dirExists) {
    const base64 = fs.readFileSync(`../${directory}/default.jpg`, "base64");
    return base64;
  }
}

module.exports = {getImage};