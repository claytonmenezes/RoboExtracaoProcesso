import {Builder, By, Key, util} from 'selenium-webdriver'
import utils from './utils.js'

export default {
  async start () {
    let driver = await new Builder().forBrowser('chrome').build()
    await driver.get('https://sistemas.anm.gov.br/SCM/site/admin/dadosProcesso.aspx')
    var img = await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_trCaptcha"]/td[2]/div[1]/span[1]/img'))
    var dimensions = await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_trCaptcha"]/td[2]/div[1]/span[1]/img')).getRect();
    return utils.getBase64FromImage(img, dimensions);
    // return await utils.pegaCaptcha(driver, By, '//*[@id="ctl00_conteudo_trCaptcha"]/td[2]/div[1]/span[1]/img')
  }
}