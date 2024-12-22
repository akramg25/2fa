import {ofetch} from 'ofetch'

export default ofetch.create({
    baseURL: 'http://127.0.0.1:5000',
    headers: {
        'Content-Type': 'application/json'
    }
})