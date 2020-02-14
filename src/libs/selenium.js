import {Builder, By, Key, util} from 'selenium-webdriver'
import utils from './utils.js'

export default {
  async start () {
    let driver = await new Builder().forBrowser('chrome').build()
    await driver.get('https://sistemas.anm.gov.br/SCM/site/admin/dadosProcesso.aspx')
    await utils.pegaCaptcha(driver, By, '//*[@id="ctl00_conteudo_trCaptcha"]/td[2]/div[1]/span[1]/img')
    // .then(resolve => {
    //     console.log(resolve)
    //     // driver.findElement(By.name('q')).sendKeys(resolve, Key.RETURN)
    // })
  }
}