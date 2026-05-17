import API from './auth.service'

export async function createNetwork(data) {
    const res = await API.post('/networks', data)
    return res.data
}

export async function getNetwork() {
    const res = await API.get('/networks')
    return res.data
}