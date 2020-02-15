import axios from "axios"
import utils from "./utils"

export default {
  base64ToCaptcha (base64) {
    axios({
      method: 'post',
      url: 'http://fasttypers.org/imagepost.ashx',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: 'action=upload&vendorkey=&key=2HUGEOST8697U7MKMSJ8A8PFR33OEYWLQ2GPOLCK&file='+base64+'&gen_task_id=' + utils.random()
    }).then(response => {
      console.log(response)
    })
    return
  }
}