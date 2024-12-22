import {getUser} from "./user.ts";

function getCookies(): Array<{ name: string, value: string }> {
    return document.cookie.split(";").map(cookie => cookie.trim()).map(cookie => {
        const [name, value] = cookie.split("=")
        return {name, value}
    })
}

function getCookie<T>(name: string): T {
    return getCookies().find(cookie => cookie.name === name)?.value as unknown as T
}

function setCookie<T>(name: string, value: T, options?: { expires?: Date }) {
    let cookie = `${name}=${value}`
    if (options?.expires) cookie += `; expires=${options.expires.toUTCString()}`
    document.cookie = cookie
}

export function setAuthCookie(token: string, expiry?: number) {
    const expires = expiry ? new Date(Date.now() + expiry * 1000) : undefined
    setCookie<string>("auth", token, {expires})
}


export function getAuthCookie(): string | null {
    const cookie = getCookie<string>("auth")?.trim()
    if (
        !cookie ||
        cookie === "undefined" ||
        cookie === "null" ||
        cookie === "false" ||
        cookie === ""
    ) return null

    return getCookie<string>("auth")
}

export function getAuthToken() {
    const state = getUser()?.token?.trim()
    const cookie = getAuthCookie()

    if (
        !state ||
        state === "undefined" ||
        state === "null" ||
        state === "false" ||
        state === ""
    ) return cookie
    return state
}

export function deleteAuthCookie() {
    setCookie("auth", "", {expires: new Date(0)})
}

export function userIsAuthenticated() {
    return !!getAuthToken()
}

export function clearUser() {
    localStorage.removeItem("user")
    deleteAuthCookie()
}