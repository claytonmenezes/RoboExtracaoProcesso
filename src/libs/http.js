import axios from "axios"

export default {
  pegaProcessosParaAtualizar () {
    return axios({
      method: 'get',
      url: 'http://localhost:59420/api/Processo/ListarAtualizar',
    })
  },
  listarFases () {
    return axios({
      method: 'get',
      url: 'http://localhost:59420/api/Fase/Listar',
    })
  }
}