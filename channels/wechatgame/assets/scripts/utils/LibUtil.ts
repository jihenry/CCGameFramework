/**
 * Author:  王冬春
 * Version: 1.0
 * Description: 一些语言层面基础方法
 * History:无
 */

export namespace LibUtil {
    //合并src索引对象到dst对象
    export const merge = (dst: { [key: string]: Object }, src: { [key: string]: Object }): { [key: string]: Object } => {
        const srcKeys = Object.keys(src);
        for (const key of srcKeys) {
            dst[key] = src[key];
        }

        return dst;
    };

    //同步src索引对象数据到dst对象
    export const sync = (dst: { [key: string]: Object }, src: { [key: string]: Object }): { [key: string]: Object } => {
        const srcKeys = Object.keys(src);
        for (const key of srcKeys) {
            if (key in dst) {
                dst[key] = src[key];
            }
        }

        return dst;
    };

    //转换特定类型值，可以避免undefine和null这些判断

    export const checkType = <T>(o: Object, d: T): T => {
        if (o === undefined || o === null) {
            return d;
        }

        return <T>o;
    };

    export const checkNumber = (o: Object, d: number = 0): number => {
        if (typeof (o) === "string") {
            return parseInt(o, 10);
        } else if (typeof (o) === "number") {
            return o;
        } else {
            return checkType<number>(o, d);
        }
    };

    export const checkBoolean = (o: Object, d: boolean = false): boolean => {
        if (typeof (o) === "boolean") {
            return o;
        } else {
            if (typeof (o) === "string") {
                if (o === "true") {
                    return true;
                } else if (o === "false") {
                    return false;
                }
            }

            return checkType<boolean>(o, d);
        }
    };

    export const checkString = (o: Object, d: string = ""): string => {
        if (o === undefined || o === null) {
            return d;
        }

        return o.toString();
    };

    export const isNull = (o: Object): boolean => {
        if (o === undefined || o === null) {
            return true;
        }

        return false;
    };

    export const isEmpty = (o: string): boolean => {
        if (isNull(o)) {
            return true;
        }

        return o === "";
    };
}
