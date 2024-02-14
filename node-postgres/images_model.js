const fs = require("fs");

function _getImage(directory, imageName) {
  const dirExists = fs.existsSync(`../${directory}/${imageName}`);
  if (dirExists) {
    const imageData = fs.readFileSync(`../${directory}/${imageName}`);
    return imageData;
  }
  if (!dirExists) {
    const imageData = fs.readFileSync(`../${directory}/default.jpg`);
    return imageData;
  }
};

function getImageList(directory) {
  return new Promise((resolve, reject) => {
    const files = fs.readdirSync(`../${directory}`);
    const fileStats = files.map(fileName => {
      const stats = fs.statSync(`../${directory}/${fileName}`);
      return ({'fileName':fileName,size:stats.size,createdAt:stats.birthtime})
    }) 
    resolve(fileStats);
    });
};
function getImage(category, imageName) {
  return new Promise((resolve,reject) => {
    let dirExists = fs.existsSync(`../${category}/${imageName}`);
    if (dirExists) {
      const base64 = fs.readFileSync(`../${category}/${imageName}`, "base64");
      resolve(base64);
    };
    if (!dirExists) resolve('The requested image was not found.');
    else {reject("the function encountered an unknown error.")};
  });
}

function uploadImage(data) {
  return new Promise ((resolve, reject) => {
    try {
      let searchValue = '';
      switch (data.fileName.split('.')[1]) {
        case 'png':
          searchValue = 'data:image/png;base64,';
          break;
        case 'jpg':
        case 'jpeg':
          searchValue = 'data:image/jpeg;base64,';
          break;
      }
      const imageBuffer = Buffer.from(data.imageData.replace(searchValue,''), 'base64');
      fs.writeFileSync(`../facilities/${data.fileName}`, imageBuffer, {encoding: 'binary'});
      resolve({code:200});
    }
    catch (error) {resolve({code:500, message:error});}
  })
}

function deleteImage(directory, data) {
  return new Promise ((resolve, reject) => {
    fs.unlink(`../${directory}/${data.name}`, (error) => {
      if (error) {
        if (error.errno === -4058) resolve({error:500, message:`Error: the file ${data.name} does not exist or cannot be found.`})
        resolve({code:500,message:error});
      }
      resolve({code:200});
    });
  });
};

module.exports = {
  _getImage,
  getImage,
  getImageList,
  uploadImage,
  deleteImage
};