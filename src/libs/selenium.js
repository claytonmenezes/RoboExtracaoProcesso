import {Builder, By, Key, until} from 'selenium-webdriver'
import humanCoder from "./humanCoder"
import http from "./http"
let driver = null

export default {
  async start () {
    console.log(await this.trataEventos('Descrição Data\n922 - REG EXT/REGISTRO DE EXTRAÇÃO 03 ANOS PUBLICADO 26/07/2016\n829 - REQ EXT/CUMPRIMENTO DE EXIGÊNCIA PROTOCOLIZADA 14/06/2016\n825 - REQ EXT/EXIGÊNCIA COM PRAZO DE 30 DIAS PUBLICADA 03/06/2016\n1404 - REQ EXT/LICENÇA AMBIENTAL PROTOCOLIZADA 11/03/2016\n1881 - REQ EXT/DOCUMENTO DIVERSO PROTOCOLIZADO 29/09/2015\n820 - REQ EXT/REQUERIMENTO PROTOCOLIZADO 29/09/2015'))
    // let atualizacoes = []
    // driver = new Builder().forBrowser('chrome').build()
    // try {
    //   await driver.get('https://sistemas.anm.gov.br/SCM/site/admin/dadosProcesso.aspx')
    //   let processosAtualizar = await http.pegaProcessosParaAtualizar().then(response => {return response.data})
    //   atualizacoes.push(await this.pegaAtualizacao(processosAtualizar[1].NumeroProcesso))
    //   // processosAtualizar.forEach(async processo => {
    //   //   atualizacoes.push(await this.pegaAtualizacao(processo.NumeroProcesso))
    //   // })
    //   console.log(atualizacoes)
    // }
    // finally {
    //   await driver.quit();
    //   driver = null
    // }
  },
  async pegaAtualizacao (numeroProcesso) {
    let atualizacao
    let base64 = await driver.executeScript(script)
    let captcha = await humanCoder.base64ToCaptcha(base64)
    await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_txtNumeroProcesso"]')).sendKeys(numeroProcesso)
    await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_trCaptcha"]/td[2]/div[1]/span[2]/input')).sendKeys(captcha)
    await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_btnConsultarProcesso"]')).click()
    let spinner = await driver.findElement(By.xpath('//*[@id="ctl00_upCarregando"]'))
    await driver.wait(until.elementIsVisible(spinner))
    await driver.wait(until.elementIsNotVisible(spinner))
    atualizacao = {
      NumeroCadastroEmpresa: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblNumeroProcessoCadastroEmpresa"]')).getText(),
      Nup: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblNup"]')).getText(),
      Area: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblArea"]')).getText(),
      TipoRequerimento: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblTipoRequerimento"]')).getText(),
      Ativo: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblAtivo"]')).getText(),
      Superintendencia: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblDistrito"]')).getText(),
      UF: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblUF"]')).getText(),
      UnidadeProtocolizadora: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblUnidadeProtocolizadora"]')).getText(),
      DataProtocolo: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblDataProtocolo"]')).getText(),
      DataPrioridade: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblDataPrioridade"]')).getText(),
      FaseId: await this.pegaIdFaseAtual(await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblTipoFase"]')).getText()),
      Eventos: await this.trataEventos(await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_gridEventos"]')).getText()),
      Atualizar: false
    }
    return atualizacao
  },
  async pegaIdFaseAtual (faseAtual) {
    let fases = await http.listarFases().then(response => {return response.data})
    return fases.find(fase => fase.Nome.toLowerCase() === faseAtual.toLowerCase()).Id
  },
  async trataEventos (elEventos) {
    let eventos = []
    for(let i = 0; i <= elEventos.length; i++) {
      console.log(elEventos[i])
    }
    // return elEventos.substring(elEventos.indexOf('\n', 0) + 1, elEventos.indexOf('-', 0) - 1)
  }
}
const script = "var canvas = document.createElement('canvas'); "+
"var ctx = canvas.getContext('2d'); "+
"document.getElementByXPath = function(sValue) { "+
  "var a = this.evaluate(sValue, this, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); "+
  "if (a.snapshotLength > 0) "+
  "{ "+
    "return a.snapshotItem(0); "+
  "}; "+
"}; "+
"function getMaxSize(srcWidth, srcHeight, maxWidth, maxHeight) { "+
    "var widthScale = null; "+
    "var heightScale = null; "+

    "if (maxWidth != null) "+
    "{ "+
        "widthScale = maxWidth / srcWidth; "+
    "}; "+
    "if (maxHeight != null) "+
    "{ "+
        "heightScale = maxHeight / srcHeight; "+
    "}; "+

    "var ratio = Math.min(widthScale || heightScale, heightScale || widthScale); "+
    "return { "+
        "width: Math.round(srcWidth * ratio), "+
        "height: Math.round(srcHeight * ratio) "+
    "}; "+
"}; "+

"function getBase64FromImage(img, width, height) { "+
    "var size = getMaxSize(width, height, 600, 600); "+
    "canvas.width = size.width; "+
    "canvas.height = size.height; "+
    "ctx.fillStyle = 'white'; "+
    "ctx.fillRect(0, 0, size.width, size.height); "+
    "ctx.drawImage(img, 0, 0, size.width, size.height); "+
    "return canvas.toDataURL('image/jpeg', 0.9); "+
"}; "+

"var img = document.getElementByXPath('//*[@id="+'"'+"ctl00_conteudo_trCaptcha"+'"'+"]/td[2]/div[1]/span[1]/img'); "+
    "return getBase64FromImage(img, img.width, img.height);"