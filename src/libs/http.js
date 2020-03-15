import axios from "axios"

export default {
  pegaProcessosParaAtualizar () {
    return axios({
      method: 'get',
      url: 'http://localhost:59420/api/Processo/ListarAtualizar',
    }).then(response => {return response.data})
  },
  fasesPorNome (nome) {
    return axios({
      method: 'get',
      url: 'http://localhost:59420/api/Fase/BuscarPorNome',
      params: {nome}
    }).then(response => {return response.data})
  },
  tipoEventoPorCodEvento (codigo) {
    return axios({
      method: 'get',
      url: 'http://localhost:59420/api/TipoEvento/BuscarPorCodEvento',
      params: {codigo: codigo}
    }).then(response => {return response.data})
  },
  atualizarBanco (atualizacao) {
    return axios({
      method: 'put',
      url: 'http://localhost:59420/api/Processo/Alterar',
      data: atualizacao
    }).then(response => {return response.data})
  }
}