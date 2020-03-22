export default {
  async formataData (data) {
    return new Promise((resolve, reject) => {
      resolve(data.substring(6, 10) + '-' + data.substring(3, 5) + '-' + data.substring(0, 2) + ' ' + data.substring(11))
    })
  }
}