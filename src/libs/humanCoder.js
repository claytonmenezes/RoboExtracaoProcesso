import axios from "axios"
import qs from "querystring"

export default {
  base64ToCaptchaAntigo (base64) {
    return axios({
      method: 'post',
      url: 'http://api.captchaboss.com/Imagepost.ashx',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        action: 'upload',
        vendorkey: '',
        key: '2HUGEOST8697U7MKMSJ8A8PFR33OEYWLQ2GPOLCK',
        file: base64.substring(base64.indexOf(',', 0) + 1),
        gen_task_id: 42
      })
    }).then(response => {
      return response.data
    })
  },
  base64ToCaptchaNovo (base64) {
    return axios({
      method: 'post',
      url: 'http://api.captchacoder.com/Imagepost.ashx',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        action: 'upload',
        vendorkey: '',
        key: 'M2FEK8W1HFQF26STVSIYFJLM8L6JFG2HQC876OE6',
        file: base64.substring(base64.indexOf(',', 0) + 1),
        gen_task_id: 42
      })
    }).then(response => {
      return response.data
    })
  }
}