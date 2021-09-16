/**
 * 转换对象为路由参数
 * @param Obj json对象
 */
export const ObjectToStrquery = (Obj: { [x: string]: any }) => {
  const objArr = Object.keys(Obj).map(el => `${el}=${String(Obj[el])}`)
  return "?" + objArr.join("&")
}

/**
 * 验证tel是否合规
 * @param tel 
 */
export const RgexpTel = (tel: string) => {
  return /^(13[0-9]|14[5-9]|15[0-35-9]|166|17[0-8]|18[0-9]|19[89])[0-9]{8}$/.test(tel)
}
/**
 * 验证邮箱是否合规
 * @param mail 
 */
export const RgexpMail = (mail: string) => {
  return /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/.test(mail)
}

/**
 * 转换Date标准时间为易读的24小时时间
 * @param time 
 * @returns like 2021/3/6 09:18:33
 */
export const parseTime = (time?: string | number | Date) => {
  if (time) {
    const date = new Date(time)
    const h = date.getHours()
    const m = date.getMinutes()
    const s = date.getSeconds()
    return `${date.toLocaleDateString()} ${h}:${m}:${s}`
  }
  else return ''
}

/**
 * @method await等待
 * @param time 等待时间,ms
 */
export const sleep = (time: number = 1000) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(0)
    }, time);
  })
}
