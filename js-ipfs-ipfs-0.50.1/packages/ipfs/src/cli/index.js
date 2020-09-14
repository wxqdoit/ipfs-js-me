'use strict'

const parser = require('./parser')
const commandAlias = require('./command-alias')
const errCode = require('err-code')

module.exports = (command, ctxMiddleware) => {
  // Apply command aliasing (eg `refs local` -> `refs-local`)
  command = commandAlias(command)

  return new Promise((resolve, reject) => {
    try {

      console.log("::::::parser start",command)
      parser
        .middleware(ctxMiddleware)
        .onFinishCommand((data) => {
          console.log("::::::parser onFinishCommand")
          resolve(data)
        })
        .fail((msg, err, yargs) => {
          console.log("::::::parser fail")

          // Handle yargs errors
          if (msg) {
            // if the error was caused by an unknown command, the use of `.parse(command)`
            // below causes printing help to fail: https://github.com/yargs/yargs/issues/1419#issuecomment-527234789
            // so pass the unadulterated parser in as `yargs` in order to print help successfully
            if (msg.includes('Unknown argument') || msg.includes('Please specify a command')) {
              yargs = parser
            }

            return reject(errCode(new Error(msg), 'ERR_YARGS', { yargs }))
          }

          reject(err)
        })
        .parse(command)

    } catch (err) {
      return reject(err)
    }
  })
}
