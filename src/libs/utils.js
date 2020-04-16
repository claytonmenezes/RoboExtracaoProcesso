import axios from 'axios'

export default {
  async formataData (data) {
    return new Promise((resolve, reject) => {
      if (data) {
        resolve(data.substring(6, 10) + '-' + data.substring(3, 5) + '-' + data.substring(0, 2) + ' ' + data.substring(11))
      }
      else {
        resolve(null)
      }
    })
  },
  authenticate () {
    let user = 'robo1@teste.com'
    let password = '123456'
    const sha = require('sha.js')
    let details = {
      grant_type: 'password',
      username: user,
      password: sha('sha256').update(password).digest('hex')
    }

    var formBody = []
    for (var property in details) {
      var encodedKey = encodeURIComponent(property)
      var encodedValue = encodeURIComponent(details[property])
      formBody.push(encodedKey + '=' + encodedValue)
    }
    formBody = formBody.join('&')

    return axios({
      method: 'POST',
      url: 'http://localhost:59420/api/security/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: formBody
    }).then(response => {
      return response.data.access_token
    }).catch(error => {
      if (error.response && error.response.data.error_description) {
        throw new Error(error.response.data.error_description)
      } else {
        throw new Error(error.message)
      }
    })
  }
}