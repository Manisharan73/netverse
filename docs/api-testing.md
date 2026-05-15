# Auth API Testing

## Register

POST /api/auth/register

{
  "username": "manish",
  "email": "manish@example.com",
  "password": "123456"
}

---

## Login

POST /api/auth/login

{
  "email": "manish@example.com",
  "password": "123456"
}