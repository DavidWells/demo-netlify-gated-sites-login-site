import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import util from 'util'

exports.handler = (event, context, callback) => {

  const deleteNetlifyCookie = cookie.serialize('nf_jwt', null, {
    secure: true,
    httpOnly: true,
    path: "/",
    maxAge: -1,
  })

  const html = `
  <html lang="en">
    <head>
      <meta charset="utf-8">
    </head>
    <body>
      <noscript>
        <meta http-equiv="refresh" content="0; url=${process.env.URL}" />
      </noscript>
    </body>
    <script>
      setTimeout(function(){
        window.location.href = ${JSON.stringify(process.env.URL)}
      }, 0)
    </script>
  </html>`;

  const cookieResponse = {
    "statusCode": 200,
    "headers": {
      "Set-Cookie": deleteNetlifyCookie,
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/html',
    },
    "body": html
  }

  console.log(`${process.env.URL} Delete`, cookieResponse)

  // set cookie and redirect
  return callback(null, cookieResponse)
}
