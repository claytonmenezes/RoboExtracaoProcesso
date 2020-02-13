export default {
  pegaCaptcha (driver, By, locator) {
    return new Promise(async (resolve, reject) => {
      try {
        let base64Image = await driver.takeScreenshot();
        let decodedImage = new Buffer.from(base64Image, "base64");
        let dimensions = await driver.findElement(By.xpath(locator)).getRect();
        console.log('Passei')
        let xLoc = dimensions.x;
        let yLoc = dimensions.y;
        let eWidth = (xLoc * 2 - 300);
        let eHeight = yLoc;
        let image = await Jimp.read(decodedImage);
        image.crop(xLoc, yLoc, eWidth, eHeight).getBase64(Jimp.AUTO, (err, data) => {
          if (err) {
            console.error(err)
            reject(err)
          }
          imgConvert.fromBuffer({
            buffer: data,
            output_format: "jpg"
          }, function (err, buffer, file) {
            if (!err) {
              let croppedImageDataBase64 = buffer.toString('base64')
              resolve(croppedImageDataBase64)
            }
            else {
              console.error(err.message);
              reject(err)
            }
          })
        });
      } catch (err) {
        console.error(err.message);
        reject(err)
      }
    })
  }
}