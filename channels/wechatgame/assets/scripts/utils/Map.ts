/**
 * Author:  吴旺
 * Version: 1.0
 * Description: 使用索引封装一个Map
 * History:
 */

export class Map<T extends string, U> {
    private mMap: { [key: string]: U } = {};
    private mCount: number = 0;

    constructor(data: { [key: string]: U } = {}) {
        const keys = Object.keys(data);
        for (const key of keys) {
            this.add(<T>key, data[key]);
        }
    }

    public add(key: T, value: U): void {
        if (this.containsKey(key)) {
            throw new Error("An element with the same key already exists in the Map.");
        }

        this.mMap[<string>key] = value;
        this.mCount++;
    }

    public remove(key: T): boolean {
        if (!this.containsKey(key)) {
            return false;
        }

        delete this.mMap[key];

        this.mCount--;

        return true;
    }

    public getValue(key: T): U {
        if (!this.containsKey(key)) {
            return undefined;
        }

        return this.mMap[<string>key];
    }

    public containsKey(key: T): boolean {
        if ((typeof key) === "undefined" || key === null || key.toString() === "") {
            throw new Error("Key is either undefined, null or an empty string.");
        }

        if (this.mMap[key] !== undefined) {
            return true;
        } else {
            return false;
        }
    }

    public changeValueForKey(key: T, newValue: U): void {
        if (!this.containsKey(key)) {
            throw new Error("In the Map there is no element with the given key.");
        }

        this.mMap[key] = newValue;
    }

    public values(): {} {
        return this.mMap;
    }

    public toArray(): U[] {
        const arr: U[] = [];

        Object.keys(this.mMap).forEach((key: string) => {
            arr.push(this.mMap[key]);
        });

        return arr;
    }

    public count(): number {
        return this.mCount;
    }

    public clear(): void {
        this.mMap = {};
        this.mCount = 0;
    }
}
