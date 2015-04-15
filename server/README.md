
# Test Auth
## signup  
 curl -v -d "username=demo&password=demo"  http://127.0.0.1:8000/api/signup
## Login  
curl -v -d "username=demo&password=demo"  http://127.0.0.1:8000/api/login

## Verify
curl -v  http://127.0.0.1:8000/api/verify
"
curl -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImRlbW8iLCJpYXQiOjE0MjkwOTcxODgsImV4cCI6MTQyOTExNTE4OH0.5cNnjChGfnpqk3Xl_StAw51DBw96TMkrsUdBWfhmEY4" -v  http://127.0.0.1:8000/api/verify


curl -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImRlbW8iLCJpYXQiOjE0MjkwMDI1MDcsImV4cCI6MTQyOTAyMDUwN30.Gl4w3oJ9A_ea1k6IbtiGni8OicuzdnS3GQPosKabEZY" -v  http://127.0.0.1:8000/api/logout
