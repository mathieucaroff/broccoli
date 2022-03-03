import { Reader, Writer } from "./type"

export let createStringReader = (text: string): Reader => {
    let index = 0
    return {
        read(count) {
            index += count
            return text.slice(index - count, index)
        },
    }
}

export let createStringWriter = (): Writer => {
    let hunkArray: string[] = []
    return {
        write(text) {
            hunkArray.push(text)
        },
        get() {
            return hunkArray.join("")
        },
    }
}
