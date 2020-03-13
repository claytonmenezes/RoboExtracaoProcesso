import {Builder, By, Key, until} from 'selenium-webdriver'
import humanCoder from "./humanCoder"
import http from "./http"
import utils from './utils'

let driver = null
let atualizacoes = []

export default {
  async start () {
    driver = new Builder().forBrowser('chrome').build()
    try {
      await driver.get('https://sistemas.anm.gov.br/SCM/site/admin/dadosProcesso.aspx')
      let processosAtualizar = await http.pegaProcessosParaAtualizar()
      if (processosAtualizar.length) {
        console.log('Foram encontrados ' + processosAtualizar.length + ' para atualização')
        console.log('------------------------------------------------------------------------------------------------------')
        for (let processo of processosAtualizar) {
          console.log('Iniciando a atualização do processo ' + processo.NumeroProcesso)
          let captcha = await this.pegaCaptcha()
          await this.abrirProcesso(processo.NumeroProcesso, captcha)
          try {
            let atualizacao = await this.pegaAtualizacao(processo)
            let processoAtualizado = await http.atualizar(atualizacao)
            atualizacoes.push(processoAtualizado)
            console.log('Processo N° ' + processo.NumeroProcesso + ' foi atualizado')
            console.log('------------------------------------------------------------------------------------------------------')
          } catch (error) {
            if (error === "TypeError: Cannot read property 'Id' of null") {
              console.log('Erro na atualização do processo N° ' + processo.NumeroProcesso)
              console.log('Erro ' + error)
              console.log('Tentando Reprocessar')
              let atualizacao = await this.pegaAtualizacao(processo)
              let processoAtualizado = await http.atualizar(atualizacao)
              atualizacoes.push(processoAtualizado)
              console.log('Processo N° ' + processo.NumeroProcesso + ' foi atualizado')
              console.log('------------------------------------------------------------------------------------------------------')
            } else {
              console.log('Erro na atualização do processo N° ' + processo.NumeroProcesso)
              console.log('Erro ' + error)
              console.log('------------------------------------------------------------------------------------------------------')
            }
          }
          await this.fecharProcesso()
        }
      } else {
        console.log('Não foram encontrados processos para atualização')
      }
      console.log(atualizacoes.length + ' atualizado(s)')
      return atualizacoes
    }
    finally {
      await driver.quit();
      driver = null
      atualizacoes = []
      console.log('Atualizações finalizadas')
    }
  },
  async pegaCaptcha () {
    let base64 = await driver.executeScript(script)
    return await humanCoder.base64ToCaptcha(base64)
  },
  async abrirProcesso (numeroProcesso, captcha) {
    await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_txtNumeroProcesso"]')).sendKeys(numeroProcesso)
    await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_trCaptcha"]/td[2]/div[1]/span[2]/input')).sendKeys(captcha)
    await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_btnConsultarProcesso"]')).click()
    await this.esperaSpinner()
  },
  async fecharProcesso () {
    await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_btnConsultarProcesso"]')).click()
    await this.esperaSpinner()
  },
  async pegaAtualizacao (processo) {
    return {
      Id: processo.Id,
      NumeroProcesso: processo.NumeroProcesso,
      Atualizar: false,
      UF: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblUF"]')).getText(),
      Nup: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblNup"]')).getText(),
      Area: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblArea"]')).getText(),
      Ativo: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblAtivo"]')).getText() === 'Sim' ? true : false,
      FaseId: await this.fasesPorNome(await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblTipoFase"]')).getText()),
      Eventos: await this.trataEventos(await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_gridEventos"]')).getText(), processo),
      DataProtocolo: await utils.formataData(await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblDataProtocolo"]')).getText()),
      DataPrioridade: await utils.formataData(await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblDataPrioridade"]')).getText()),
      Superintendencia: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblDistrito"]')).getText(),
      TipoRequerimento: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblTipoRequerimento"]')).getText(),
      NumeroCadastroEmpresa: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblNumeroProcessoCadastroEmpresa"]')).getText(),
      UnidadeProtocolizadora: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblUnidadeProtocolizadora"]')).getText()
    }
  },
  async fasesPorNome (faseAtual) {
    let fase = await http.fasesPorNome(faseAtual)
    return fase.Id
  },
  async tipoEventoPorCodEvento (codigo) {
    return await http.tipoEventoPorCodEvento(codigo)
  },
  async trataEventos (elEventos, processo) {
    let eventos = []
    let retorno = []
    let stringEventos = elEventos.substring(elEventos.indexOf('\n') + '\n'.length)
    while (stringEventos.length > 0) {
      let codigo
      let descricao
      let data
      codigo = stringEventos.substring(0, stringEventos.indexOf(' - ', 0))
      stringEventos = stringEventos.substring(codigo.length + stringEventos.indexOf(' - ', 0))
      if (stringEventos.indexOf('\n') > 0) {
        descricao = stringEventos.substring(0, stringEventos.indexOf('\n') - 11)
        stringEventos = stringEventos.substring(descricao.length + 1)
        data = stringEventos.substring(0, stringEventos.indexOf('\n'))
        stringEventos = stringEventos.substring(stringEventos.indexOf('\n')  + '\n'.length)
      } else {
        descricao = stringEventos.substring(0, stringEventos.length - 11)
        stringEventos = stringEventos.substring(descricao.length + 1)
        data = stringEventos.substring(0, stringEventos.length)
        stringEventos = stringEventos.substring(stringEventos.length  + '\n'.length)
      }
      eventos.push({
        codigo,
        descricao,
        data
      })
    }
    for (let evento of eventos) {
      let tipoEvento = await this.tipoEventoPorCodEvento(evento.codigo)
      if (tipoEvento) {
        retorno.push({
          ProcessoId: processo.Id,
          TipoEventoId: tipoEvento ? tipoEvento.Id : null,
          Data: await utils.formataData(evento.data)
        })
      }
    }
    return retorno
  },
  async esperaSpinner () {
    let spinner = await driver.findElement(By.xpath('//*[@id="ctl00_upCarregando"]'))
    await driver.wait(until.elementIsVisible(spinner))
    await driver.wait(until.elementIsNotVisible(spinner))
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