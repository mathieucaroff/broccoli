export interface Reader {
    read(count: number): string
}

export let createStringReader = (text: string): Reader => {
    let index = 0
    return {
        read(count) {
            index += count
            return text.slice(index - count, index)
        },
    }
}
