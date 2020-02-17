import axios from "axios"
import qs from "querystring"

export default {
  base64ToCaptcha (base64) {
    return axios({
      method: 'post',
      url: 'http://api.captchaboss.com/Imagepost.ashx',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        action: 'upload',
        vendorkey: '',
        key: '2HUGEOST8697U7MKMSJ8A8PFR33OEYWLQ2GPOLCK',
        file: base64,
        gen_task_id: 42
      })
    }).then(response => {
      return response.data
    })
  }
}