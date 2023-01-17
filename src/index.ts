import config from './config'
import run from './server'

(async () => {
  await config()
  run()
})()