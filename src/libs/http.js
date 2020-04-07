import axios from "axios"
import utils from './utils'

export default {
  async pegaProcessosParaAtualizar () {
    var token  = await utils.authenticate();
    return axios({
      method: 'get',
      url: 'http://localhost:59420/api/Processo/ListarAtualizar',
      headers: { Authorization: 'Bearer ' + token }
    }).then(response => {return response.data})
  },
  async fasesPorNome (nome) {
    var token  = await utils.authenticate();
    return axios({
      method: 'get',
      url: 'http://localhost:59420/api/Fase/BuscarPorNome',
      params: {nome},
      headers: { Authorization: 'Bearer ' + token }
    }).then(response => {return response.data})
  },
  async tipoEventoPorCodEvento (codigo) {
    var token  = await utils.authenticate();
    return axios({
      method: 'get',
      url: 'http://localhost:59420/api/TipoEvento/BuscarPorCodEvento',
      params: {codigo: codigo},
      headers: { Authorization: 'Bearer ' + token }
    }).then(response => {return response.data})
  },
  async atualizarBanco (atualizacao) {
    var token  = await utils.authenticate();
    return axios({
      method: 'put',
      url: 'http://localhost:59420/api/Processo/Alterar',
      data: atualizacao,
      headers: { Authorization: 'Bearer ' + token }
    }).then(response => {return response.data})
  }
}