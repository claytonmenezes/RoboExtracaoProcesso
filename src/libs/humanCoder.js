import axios from "axios"
import qs from "querystring"

export default {
  base64ToCaptcha (base64) {
    return axios({
      method: 'post',
      url: 'http://api.captchacoder.com/Imagepost.ashx',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        action: 'upload',
        vendorkey: '',
        key: 'M2FEK8W1HFQF26STVSIYFJLM8L6JFG2HQC876OE6',
        file: base64,
        gen_task_id: 42
      })
    }).then(response => {
      return response.data
    })
  }
}