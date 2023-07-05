const fs = require("fs");

function _getImage(directory, imageName) {
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

function getImageList(category) {
  return new Promise((resolve, reject) => {
    const files = fs.readdirSync(`../${category}`);
    const fileStats = files.map(fileName => {
      const stats = fs.statSync(`../${category}/${fileName}`);
      return ({'fileName':fileName,size:stats.size,createdAt:stats.birthtime})
    }) 
    resolve(fileStats);
    });
};
function getImage(data) {
  return new Promise((resolve,reject) => {
    let dirExists = fs.existsSync(`../${data.category}/${data.imageName}`);
    if (dirExists) {
      const base64 = fs.readFileSync(`../${data.category}/${data.imageName}`, "base64");
      resolve({imageData:base64});
    }
    if (!dirExists) {
      const base64 = fs.readFileSync(`../${data.category}/default.jpg`, "base64");
      resolve({imageData:base64});
    }
    else {reject({code:500})}
  });
}

module.exports = {
  _getImage,
  getImage,
  getImageList
};