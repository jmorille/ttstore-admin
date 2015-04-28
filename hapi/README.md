



# Sample Apps With es
https://github.com/ideaq/time/blob/0a5ec8711840528a4960c388825fb883fabddd76/app.js

# Good Api
https://github.com/docdis/learn-api-design

- Api Exemple : https://www.parse.com/docs/rest#general


# Tutorial Rest 
https://gist.github.com/agendor/9922151

   


# Authentification
## Google Auth
https://github.com/santbob/hapi-auth-example

## Test Method
curl -v -d "password=admin"   http://127.0.0.1:8000/changePassword/admin
curl -v  -XPOST  --user jmorille@gmail.com:admin  http://127.0.0.1:8000/login

curl -v -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIxZDFkYmFkZi02NjBkLTQ1NWMtODIyZi05NjBhYmJhZDc2NWQiLCJpYXQiOjE0MzAyMTczNzY3NjMsImV4cCI6MTQzMDgyMjE3Njc2MywiYWdlbnQiOiJjdXJsLzcuMzUuMCJ9.vO_AeAo8pZL_FFquo-u2_bL2gJNbcyx4N7kXBj4W7W8" \
  http://127.0.0.1:8000/hello


# Google Token
https://developers.google.com/identity/protocols/OAuth2UserAgent#validatetoken
==> JWT https://developers.google.com/identity/protocols/OAuth2?hl=fr#serviceaccount


# Google Open ID
https://developers.google.com/identity/protocols/OpenIDConnect
==>  scope ="openid"
https://developers.google.com/+/api/openidconnect/getOpenIdConnect

# Google Identity Toolkit 
https://developers.google.com/identity/toolkit/web/quickstart/nodejs

# Authorization
https://github.com/mark-bradshaw/mrhorse
https://github.com/toymachiner62/hapi-authorization

# Crypto
https://code.google.com/p/crypto-js/


# Test Analyser 
curl -XGET 'localhost:9200/_analyze?pretty&analyzer=standard' -d 'jmorille@gmail.com'
curl -XGET 'localhost:9200/_analyze?pretty&analyzer=uax_url_email' -d 'jmorille@gmail.com'
