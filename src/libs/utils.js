import Jimp from 'jimp'
import imgConvert from 'image-convert'
import {createCanvas} from 'canvas'

export default {
  pegaCaptcha (driver, By, locator) {
    return new Promise(async (resolve, reject) => {
      try {
        let base64Image = await driver.takeScreenshot();
        let decodedImage = new Buffer.from(base64Image, "base64");
        let dimensions = await driver.findElement(By.xpath(locator)).getRect();
        let image = await Jimp.read(decodedImage);
        image.crop(dimensions.x, dimensions.y, dimensions.width, dimensions.height).getBase64(Jimp.AUTO, (err, data) => {
          if (err) {
            console.error(err)
            reject(err)
          }
          imgConvert.fromBuffer({
            buffer: data,
            output_format: "jpg"
          }, (err, buffer, file) => {
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
  },
  getMaxSize(srcWidth, srcHeight, maxWidth, maxHeight) {
    var widthScale = null;
    var heightScale = null;
    if (maxWidth != null)
    {
      widthScale = maxWidth / srcWidth;
    }
    if (maxHeight != null)
    {
      heightScale = maxHeight / srcHeight;
    }
    var ratio = Math.min(widthScale || heightScale, heightScale || widthScale);
    return {
      width: Math.round(srcWidth * ratio),
      height: Math.round(srcHeight * ratio)
    };
  },
  getBase64FromImage(img, dimensions) {
    let canvas = createCanvas(dimensions.width, dimensions.height)
    let ctx = canvas.getContext('2d');
    var size = this.getMaxSize(dimensions.width, dimensions.height, 600, 600)
    canvas.width = size.width;
    canvas.height = size.height;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size.width, size.height);
    ctx.drawImage(img, dimensions.x, dimensions.y, size.width, size.height);
    return canvas.toDataURL('image/jpeg', 0.9);
  }
}