import API from './auth.service'

export async function createNetwork(data) {
    const res = await API.post('/networks', data)
    return res.data
}

export async function getNetwork() {
    const res = await API.get('/networks')
    return res.data
}

export async function getNetworkById(id) {
    const res = await API.get(`/networks/${id}`)
    return res.data
}

export async function updateNetwork(id, data) {
    const res = await API.put(`/networks/${id}`, data)
    return res.data
}