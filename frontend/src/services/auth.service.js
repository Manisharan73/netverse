import axios from 'axios'

const API = axios.create({
    baseURL: 'http://localhost:5000/api/auth'
})

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')

    if(token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

export async function registerUser(data) {
    const res = await API.post('/register', data)
    return res.data
}

export async function loginUser(data) {
    const res = await API.post('/login', data)
    return res.data
}