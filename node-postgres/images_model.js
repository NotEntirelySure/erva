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
function getImage(data) {
  return new Promise((resolve,reject) => {
    let dirExists = fs.existsSync(`../${data.category}/${data.imageName}`);
    if (dirExists) {
      const base64 = fs.readFileSync(`../${data.category}/${data.imageName}`, "base64");
      resolve({code:200,imageData:base64});
    };
    if (!dirExists) {
      const base64 = fs.readFileSync(`../${data.category}/default.jpg`, "base64");
      resolve({
        code:404,
        message:'The requested image was not found.',
        imageData:base64
      });
    }
    else {reject({code:500})};
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