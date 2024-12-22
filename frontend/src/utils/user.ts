import $fetch from "./fetch.ts";
import {getAuthToken} from "./auth.ts";

export type User = {
    email: string,
    dob?: string,
    token: string,
    gender?: string,
    phone?: string,
}

export async function fetchUser(userId?: string): Promise<User | null> {
    if (!userId) {
        return await $fetch<User | null>('/api/user/refresh', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        }).then(user => {
            if (user) storeUser(user)
            return user
        }).catch(() => {
            return null
        })
    } else {
        return await $fetch<User | null>(`/api/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        }).catch(() => {
            return null
        })
    }
}

export function storeUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user))
}

export function getUser(): User | null {
    const storage = localStorage.getItem('user')
    if (storage) return JSON.parse(storage)
    return null
}