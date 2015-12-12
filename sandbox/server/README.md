
# Test Auth
## signup  
 curl -v -d "username=demo&password=demo"  http://127.0.0.1:8000/api/signup
## Login  
curl -v -d "username=demo&password=demo"  http://127.0.0.1:8000/api/login

## Verify
curl -v  http://127.0.0.1:8000/api/verify
"
curl -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImRlbW8iLCJpYXQiOjE0MjkxOTU5NDQsImV4cCI6MTQyOTIxMzk0NH0.vBARS3jFJv0lxOHMoAoKwRxlO0yOqHXqKhGSdXN4K1s" -v  http://127.0.0.1:8000/api/verify


curl -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImRlbW8iLCJpYXQiOjE0MjkwMDI1MDcsImV4cCI6MTQyOTAyMDUwN30.Gl4w3oJ9A_ea1k6IbtiGni8OicuzdnS3GQPosKabEZY" -v  http://127.0.0.1:8000/api/logout
