import {Builder, By, Key, until} from 'selenium-webdriver'
import humanCoder from "./humanCoder"
import http from "./http"
import utils from './utils'

let driver = null
let atualizacoes = []
let tentativas = 0
let parametro = {}
export default {
  async start () {
    await this.CarregaDependencias()
    if (await this.abrePagina()) {
      console.log('Página carregada')
      let processosAtualizar = await http.pegaProcessosParaAtualizar()
      if (processosAtualizar.length) {
        console.log('Foram encontrados ' + processosAtualizar.length + ' processos para atualização')
        console.log('------------------------------------------------------------------------------------------------------')
        for (let processo of processosAtualizar) {
          tentativas = 0
          try {
            await this.abrirProcesso(processo)
            await this.atualizarProcesso(processo)
            await this.atualizarPagina()
            console.log('------------------------------------------------------------------------------------------------------')
          } catch {
            console.log('Resetando o WebDriver')
            await this.fechaPagina()
            if (await this.abrePagina()) {
              console.log('Página carregada')
            } else {
              console.log('Erro ao carregar o WebDriver')
              throw new 'Erro nos outros metodos'
            }
          }
        }
      } else {
        console.log('Não foram encontrados processos para atualização')
      }
      console.log(atualizacoes.length + ' atualizado(s)')
      await this.fechaPagina()
      atualizacoes = []
      console.log('Atualizações finalizadas')
      return atualizacoes
    }
  },
  async abrePagina () {
    console.log('Carregando o WebDriver e carregando a página')
    try {
      driver = await new Builder().forBrowser('chrome').usingServer('http://localhost:8090/wd/hub').build()
      await driver.get('https://sistemas.anm.gov.br/SCM/site/admin/dadosProcesso.aspx')
      return true
    } catch {
      console.log('Erro ao abrir o navegador e carregar a página verificar o Server Selenium')
      return false
    }
  },
  async fechaPagina () {
    console.log('Fechando a Pagina e zerando o WebDriver')
    await driver.quit();
    driver = null
  },
  async CarregaDependencias () {
    parametro = await http.pegaParametrosUsuario()
  },
  async atualizarProcesso (processo) {
    try {
      console.log('Iniciando a atualização do processo ' + processo.NumeroProcesso)
      console.log('pegando atualização')
      let atualizacao = await this.pegaAtualizacao(processo)
      console.log('Atualizando no banco de dados')
      let processoAtualizado = await http.atualizarBanco(atualizacao)
      atualizacoes.push(processoAtualizado)
      console.log('Processo N° ' + processo.NumeroProcesso + ' foi atualizado')
    } catch {
      tentativas++
      if (tentativas <= 3) {
        console.log('Tentativa: ' + tentativas)
        console.log('Erro na atualização do processo N° ' + processo.NumeroProcesso)
        console.log('Tentando Novamente')
        await this.atualizarProcesso(processo)
      } else {
        console.log('Tentativas excedidas, pulando o processo')
        throw new 'Tentativas excedidas no metodo atualizarProcesso'
      }
    }
  },
  async pegaCaptcha () {
    try {
      let base64 = await driver.executeScript(script)
      if (parametro.ApiCaptcha == 0) return await driver.wait(humanCoder.base64ToCaptchaAntigo(base64), 15000)
      else if (parametro.ApiCaptcha == 1) return await driver.wait(humanCoder.base64ToCaptchaNovo(base64), 15000)
    } catch {
      console.log('Algo Errado no metodo pegaCaptcha')
      throw new 'Erro no metodo pegaCaptcha'
    }
  },
  async abrirProcesso (processo) {
    if (await this.verificaPaginaOk()) {
      try {
        console.log('Abrindo o processo ' + processo.NumeroProcesso)
        await this.limpaInput('//*[@id="ctl00_conteudo_txtNumeroProcesso"]')
        await this.limpaInput('//*[@id="ctl00_conteudo_trCaptcha"]/td[2]/div[1]/span[2]/input')
        console.log('pegando o captcha')
        let captcha = await this.pegaCaptcha()
        console.log('Captcha: ' + captcha)
        console.log('inserindo valor no input de processo')
        await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_txtNumeroProcesso"]')).sendKeys(processo.NumeroProcesso)
        console.log('inserindo valor no input de captcha')
        await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_trCaptcha"]/td[2]/div[1]/span[2]/input')).sendKeys(captcha)
        await driver.sleep(1000)
        console.log('Clicando na consulta')
        await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_btnConsultarProcesso"]')).click()
        await driver.sleep(1000)
        await driver.wait(this.esperaAbrirProcesso(), 30000)
      } catch {
        tentativas++
        if (tentativas <= 3) {
          console.log('Tentativa: ' + tentativas)
          await this.atualizarPagina()
          await this.abrirProcesso(processo)
        } else {
          console.log('Tentativas excedidas, pulando o processo')
          throw new 'Erro no metodo abrirProcesso'
        }
      }
    } else {
      tentativas++
      if (tentativas <= 3) {
        console.log('Tentativa: ' + tentativas)
        await this.atualizarPagina()
        await this.abrirProcesso(processo)
      } else {
        console.log('Tentativas excedidas, pulando o processo')
        throw new 'Erro no metodo abrirProcesso'
      }
    }
  },
  async verificaPaginaOk () {
    if(
      await this.verificaElementoExiste('//*[@id="ctl00_conteudo_trCaptcha"]/td[2]/div[1]/span[1]/img') &&
      await this.verificaElementoExiste('//*[@id="ctl00_conteudo_txtNumeroProcesso"]') &&
      await this.verificaElementoExiste('//*[@id="ctl00_conteudo_trCaptcha"]/td[2]/div[1]/span[2]/input') &&
      await this.verificaElementoExiste('//*[@id="ctl00_conteudo_btnConsultarProcesso"]')
    ) {
      return true
    } else {
      return false
    }
  },
  async limpaInput (xpath) {
    await driver.findElement(By.xpath(xpath)).clear()
  },
  async atualizarPagina () {
    await driver.navigate().refresh()
  },
  async pegaAtualizacao (processo) {
    let retorno = {}
    try {
      retorno = {
        Id: processo.Id,
        NumeroProcesso: processo.NumeroProcesso,
        Atualizar: 0,
        UF: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblUF"]')).getText() || null,
        Nup: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblNup"]')).getText() || null,
        Area: await (await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblArea"]')).getText()).replace(',', '.') || null,
        Ativo: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblAtivo"]')).getText() === 'Sim' ? true : false,
        FaseId: await this.fasesPorNome(await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblTipoFase"]')).getText()),
        Eventos: await this.trataEventos(await driver.findElements(By.xpath('//*[@id="ctl00_conteudo_gridEventos"]/tbody/tr')), processo),
        PessoasRelacionadas: await this.tratarPessoasRelacionadas(await driver.findElements(By.xpath('//*[@id="ctl00_conteudo_gridPessoas"]/tbody/tr')), processo),
        Titulos: await this.tratarTitulos(await driver.findElements(By.xpath('//*[@id="ctl00_conteudo_gridTitulos"]/tbody/tr')), processo),
        Substancias: await this.tratarSubstancias(await driver.findElements(By.xpath('//*[@id="ctl00_conteudo_gridSubstancias"]/tbody/tr')), processo),
        Municipios: await this.tratarMunicipios(await driver.findElements(By.xpath('//*[@id="ctl00_conteudo_gridMunicipios"]/tbody/tr')), processo),
        CondicoesPropriedadeSolo: await this.tratarCondicoesPropriedadeSolo(await driver.findElements(By.xpath('//*[@id="ctl00_conteudo_gridHistoricoPropriedadeSolo"]/tbody/tr')), processo),
        ProcessosAssociados: await this.tratarProcessosAssociados(await driver.findElements(By.xpath('//*[@id="ctl00_conteudo_gridProcessosAssociados"]/tbody/tr')), processo),
        DocumentosProcesso: await this.tratarDocumentosProcesso(await driver.findElements(By.xpath('//*[@id="ctl00_conteudo_gridDocumentos"]/tbody/tr')), processo),
        DataProtocolo: await utils.formataData(await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblDataProtocolo"]')).getText()),
        DataPrioridade: await utils.formataData(await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblDataPrioridade"]')).getText()),
        Superintendencia: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblDistrito"]')).getText() || null,
        TipoRequerimento: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblTipoRequerimento"]')).getText() || null,
        NumeroCadastroEmpresa: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblNumeroProcessoCadastroEmpresa"]')).getText() || null,
        UnidadeProtocolizadora: await driver.findElement(By.xpath('//*[@id="ctl00_conteudo_lblUnidadeProtocolizadora"]')).getText() || null
      }
    } catch {
      tentativas++
      if (tentativas <= 3) {
        console.log('Tentativa: ' + tentativas)
        await this.pegaAtualizacao()
      } else {
        console.log('Tentativas excedidas, pulando o processo')
        throw new 'Erro no metodo pegaAtualizacao'
      }
    }
    return retorno
  },
  async fasesPorNome (faseAtual) {
    let fase = await http.fasesPorNome(faseAtual)
    return fase.Id
  },
  async trataEventos (elsEventos, processo) {
    let retorno = []
    let ths = await elsEventos[0].findElements(By.tagName('TH'))
    if (ths.length) {
      for (let el of elsEventos) {
        let tds = await el.findElements(By.tagName('TD'))
        if (tds.length) {
          let descricao = await tds[0]?.getText()
          let codigo = descricao.substring(0, descricao.indexOf(' - ', 0))
          let data = await tds[1]?.getText()
          let tipoEvento = await http.tipoEventoPorCodEvento(codigo)
          if (tipoEvento) {
            retorno.push({
              ProcessoId: processo.Id,
              TipoEventoId: tipoEvento ? tipoEvento.Id : null,
              Data: await utils.formataData(data)
            })
          }
        }
      }
    }
    return retorno
  },
  async tratarDocumentosProcesso (elsDocumentosProcesso, processo) {
    let retorno = []
    let ths = await elsDocumentosProcesso[0].findElements(By.tagName('TH'))
    if (ths.length) {
      for (let el of elsDocumentosProcesso) {
        let tds = await el.findElements(By.tagName('TD'))
        if (tds.length) {
          retorno.push({
            ProcessoId: processo.Id,
            Descricao: await tds[0]?.getText() || null,
            DataProtocolo: await utils.formataData(await tds[1]?.getText() || null)
          })
        }
      }
    }
    return retorno
  },
  async tratarProcessosAssociados (elsProcessosAssociados, processo) {
    let retorno = []
    let ths = await elsProcessosAssociados[0].findElements(By.tagName('TH'))
    if (ths.length) {
      for (let el of elsProcessosAssociados) {
        let tds = await el.findElements(By.tagName('TD'))
        if (tds.length) {
          retorno.push({
            ProcessoId: processo.Id,
            NumeroProcesso: await tds[0]?.getText() || null,
            Titular: await tds[1]?.getText() || null,
            TipoAssociacao: await tds[2]?.getText() || null,
            DataAssociacao: await utils.formataData(await tds[3]?.getText() || null),
            DataDesassociacao: await utils.formataData(await tds[4]?.getText() || null)
          })
        }
      }
    }
    return retorno
  },
  async tratarCondicoesPropriedadeSolo (elsCondicoesPropriedadeSolo, processo) {
    let retorno = []
    let ths = await elsCondicoesPropriedadeSolo[0].findElements(By.tagName('TH'))
    if (ths.length) {
      for (let el of elsCondicoesPropriedadeSolo) {
        let tds = await el.findElements(By.tagName('TD'))
        if (tds.length) {
          retorno.push({
            ProcessoId: processo.Id,
            Tipo: await tds[0]?.getText() || null,
          })
        }
      }
    }
    return retorno
  },
  async tratarMunicipios (elsMunicipios, processo) {
    let retorno = []
    let ths = await elsMunicipios[0].findElements(By.tagName('TH'))
    if (ths.length) {
      for (let el of elsMunicipios) {
        let tds = await el.findElements(By.tagName('TD'))
        if (tds.length) {
          retorno.push({
            ProcessoId: processo.Id,
            Nome: await tds[0]?.getText() || null,
          })
        }
      }
    }
    return retorno
  },
  async tratarSubstancias (elsSubstancias, processo) {
    let retorno = []
    let ths = await elsSubstancias[0].findElements(By.tagName('TH'))
    if (ths.length) {
      for (let el of elsSubstancias) {
        let tds = await el.findElements(By.tagName('TD'))
        if (tds.length) {
          retorno.push({
            ProcessoId: processo.Id,
            Nome: await tds[0]?.getText() || null,
            TipoUso: await tds[1]?.getText() || null,
            DataInicio: await utils.formataData(await tds[2]?.getText() || null),
            DataFinal: await utils.formataData(await tds[3]?.getText() || null),
            MotivoEncerramento: await tds[4]?.getText() || null
          })
        }
      }
    }
    return retorno
  },
  async tratarTitulos (elsTitulos, processo) {
    let retorno = []
    let ths = await elsTitulos[0].findElements(By.tagName('TH'))
    if (ths.length) {
      for (let el of elsTitulos) {
        let tds = await el.findElements(By.tagName('TD'))
        if (tds.length) {
          retorno.push({
            ProcessoId: processo.Id,
            Numero: await tds[0]?.getText() || null,
            Descricao: await tds[1]?.getText() || null,
            TipoTitulo: await tds[2]?.getText() || null,
            SituacaoTitulo: await tds[3]?.getText() || null,
            DataPublicacao: await utils.formataData(await tds[4]?.getText() || null),
            DataVencimento: await utils.formataData(await tds[5]?.getText() || null)
          })
        }
      }
    }
    return retorno
  },
  async tratarPessoasRelacionadas (elsPessoasRelacionadas, processo) {
    let retorno = []
    let ths = await elsPessoasRelacionadas[0].findElements(By.tagName('TH'))
    if (ths.length) {
      for (let el of elsPessoasRelacionadas) {
        let tds = await el.findElements(By.tagName('TD'))
        if (tds.length) {
          retorno.push({
            ProcessoId: processo.Id,
            TipoRelacao: await tds[0]?.getText() || null,
            CpfCnpj: await tds[1]?.getText() || null,
            Nome: await tds[2]?.getText() || null,
            ResponsabilidadeRepresentação: await tds[3]?.getText() || null,
            PrazoArrendamento: await tds[4]?.getText() || null,
            DataInicio: await utils.formataData(await tds[5]?.getText() || null),
            DataFinal: await utils.formataData(await tds[6]?.getText() || null)
          })
        }
      }
    }
    return retorno
  },
  async esperaAbrirProcesso () {
    if (await this.verificaElementoExiste('//*[@id="ctl00_conteudo_trCaptcha"]/td[2]/div[1]/span[2]/input')) {
      await this.esperaAbrirProcesso()
    }
  },
  async esperaSpinner () {
    let spinner = await driver.findElement(By.xpath('//*[@id="ctl00_upCarregando"]'))
    if (await spinner.isDisplayed()) {
      console.log('Spinner visivel, esperando o spinner')
      await driver.wait(until.elementIsNotVisible(spinner))
      return true
    } else {
      return false
    }
  },
  async verificaElementoExiste (xpath) {
    return driver.findElements(By.xpath(xpath)).then((els) => {
      if (els.length > 0) {
        return true
      }
      return false
    })
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