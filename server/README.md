
# Test Auth

## Login 
 curl -v -d "username=demo&password=demo"  http://127.0.0.1:8000/api/login

## Login
curl -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImRlbW8iLCJpYXQiOjE0Mjg5NTQzMTcsImV4cCI6MTQyODk3MjMxN30.qNhd3OWnGm0TTJdWbMizs7Ec0LFDRGs_7TcslgFyY1M" -v  http://127.0.0.1:8000/api/verify
