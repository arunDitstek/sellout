import * as fs from 'fs'
const saveLogs = async (location, info) => {
    info = info.toString()
    const content = `Date: ${new Date()} | Error on ${location} |  ${info} \r\n`
    
    await fs.appendFile('./../debug.log', content, err => {
        if (err) { 
            console.error("err===", err)
            return
        }
    }) 
}
export default saveLogs;