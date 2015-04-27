



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

curl -v -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI3MDEyZjcxYy05MmVhLTQ2ZDYtYmQ2OC01ODkyNjNlN2IzZTQiLCJpYXQiOjE0MzAxNDg1NDczMDgsImV4cCI6MTQzMDc1MzM0NzMwOCwiYWdlbnQiOiJjdXJsLzcuMzUuMCJ9.6B4kR9ImWW_87h0Shl5G0ebVQ2P7nSsbLxHpayejt-Q" \
  http://127.0.0.1:8000/login/jwt



changePassword
# Authorization
https://github.com/mark-bradshaw/mrhorse
https://github.com/toymachiner62/hapi-authorization

# Crypto
https://code.google.com/p/crypto-js/


# Test Analyser 
curl -XGET 'localhost:9200/_analyze?pretty&analyzer=standard' -d 'jmorille@gmail.com'
curl -XGET 'localhost:9200/_analyze?pretty&analyzer=uax_url_email' -d 'jmorille@gmail.com'
