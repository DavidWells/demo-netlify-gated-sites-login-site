import fetch from 'node-fetch'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import parseURL from 'url-parse'
// https://stackoverflow.com/questions/46333510/okta-sign-in-widget-mfa

// Then create API token https://dev-652264-admin.oktapreview.com/admin/access/api/tokens

// Then add netlify env vars

exports.handler = (event, context, callback) => {
  const body = JSON.parse(event.body)
  const urlData = parseURL(process.env.URL)
  console.log('urlData', urlData)
  console.log('Verify okta and set cookie')
  const baseURL = process.env.OKTA_BASE_URL

  const options = {
    'headers': {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `SSWS ${process.env.OKTA_API_TOKEN}`
    }
  }

  fetch(`${baseURL}/api/v1/sessions/${body.okta_id}`, options)
  .then(res => res.json())
  .then(data => {
    console.log('okta data', data)
    if (data.status !== "ACTIVE") {
      return callback(null, {
        statusCode: 500,
        body: JSON.stringify({
        	error: 'Session status was not active'
        })
      })
	  }

    // Okta session active. Make them a netlify nf_jwt Token
    var date = new Date(data.expiresAt);

    var calculatedExpiresIn = (date.getTime() / 1000)
    console.log('calculatedExpiresIn', calculatedExpiresIn)
    // Make new netlify token
    const netlifyTokenData = {
      exp: calculatedExpiresIn,
      sub: data.userId,
      email: data.login,
      "app_metadata": {
        "authorization": {
          "roles": ["admin", "editor"]
        },
        "provider": "email",
        "roles": [
          "admin"
        ]
      }
    }
    // 1529998766307
    // 1531523583

    console.log('process.env.JWT_SECRET', process.env.JWT_SECRET)

    const netlifyToken = jwt.sign(netlifyTokenData, process.env.JWT_SECRET)

    const nf_jwtCookie = cookie.serialize('nf_jwt', netlifyToken, {
      secure: true,
      httpOnly: true,
      path: "/",
      expires: date,
      // domain: urlData.hostname
    })

    console.log('nf_jwtCookie', nf_jwtCookie)

    return callback(null, {
      statusCode: 200,
      headers: {
        'Set-Cookie': nf_jwtCookie
      },
      body: JSON.stringify({
      	data: data
      })
    })
  }).catch((e) => {
    console.log('promise error', e)
  })

  // do redirect & set cookie
  // return callback(null, {
  //   statusCode: 302,
  //   headers: {
  //     Location: process.env.URL,
  //     'Set-Cookie': myCookie,
  //     'Cache-Control': 'no-cache'
  //   }
  // })
}
