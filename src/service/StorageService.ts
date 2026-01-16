export class StorageService<T> {

    constructor(private readonly key: string) {}

    load(): T | undefined {
        try {
            const raw = localStorage.getItem(this.key)
            return raw ? JSON.parse(raw) as T : undefined
        } catch {
            return
        }
    }

    save(value: T): void {
        localStorage.setItem(this.key, JSON.stringify(value))
    }

    clear(): void {
        localStorage.removeItem(this.key)
    }
}
