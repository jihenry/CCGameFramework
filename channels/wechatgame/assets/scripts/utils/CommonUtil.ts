import { GameEnv } from "../genv/GameEnv";
import { Constant } from "./Constant";
import { LibUtil } from "./LibUtil";

/**
 * Author:  zousheng
 * Version: 1.0
 * Description: 通用函数
 * History: no
 */

export namespace CommonUtil {
    //获取品阶精灵名字
    export const getQualitySpriteName = (quality: number, isHeroT: boolean = true): string => {
        return isHeroT ? `ty_txk_yx${quality}` : `ty_txk_gw${quality}`;
    };

    //转换指定长度字符串，类似nick...
    export const pointNumStr = (str: string, count: number): string => {
        const pstr = LibUtil.checkString(str, "");
        if (pstr.length > count) {
            return `${str.substring(0, count)}...`;
        }

        return str;
    };

    /**
     * 英雄品阶 颜色 小品阶数字 大品阶段 对照类
     */
    export class QualityColorAndNumber {
        /**
         * 颜色
         */
        public color: cc.Color;

        /**
         * 颜色的string
         */
        public colorStr: string;
        /**
         * 显示加多少
         */
        public mQualityNumber: number;
        /**
         * 品阶等级 1 - 5 (主要用来 获取品阶框图片用的)
         */
        public mQualityLevel: number;
        constructor(color: cc.Color, num: number, quality: number, colorStr: string) {
            this.color = color;
            this.mQualityNumber = num;
            this.mQualityLevel = quality;
            this.colorStr = colorStr;
        }
    }
    /**
     * 根据英雄星阶 获取英雄当前可以达到的最高等级
     * @param starLevel 星阶
     */
    export const getHeroLevelFormStar
        = (starLevel: number): number => {
            let n: number = 40;
            switch (starLevel) {
                case 6:
                    n = 150;
                    break;
                case 5:
                    n = 140;
                    break;
                case 4:
                    n = 120;
                    break;
                case 3:
                    n = 100;
                    break;
                case 2:
                    n = 70;
                    break;
                default:
            }

            return n;
        };
    /**
     * 根据英雄品级获取对应颜色小品阶 大品阶
     */
    export const getQualityColorAndNumber
        = (qualityLevel: number): QualityColorAndNumber => {
            let c: cc.Color = new cc.Color(174, 171, 176, 255);
            let cs: string = "#AEABB0";
            let n: number = 0;
            let j = 1;
            if (qualityLevel > 10) {
                c = new cc.Color(255, 164, 34, 255);
                cs = "#FFFA422";
                n = qualityLevel - 10;
                j = 5;
            } else if (qualityLevel > 6) {
                c = new cc.Color(216, 0, 255, 255);
                cs = "#D800FF";
                n = qualityLevel - 6;
                j = 4;
            } else if (qualityLevel > 3) {
                c = new cc.Color(34, 141, 231, 255);
                cs = "#228DE7";
                n = qualityLevel - 3;
                j = 3;
            } else if (qualityLevel > 1) {
                c = new cc.Color(73, 167, 26, 255);
                cs = "#49A71A";
                n = qualityLevel - 1;
                j = 2;
            }

            return new QualityColorAndNumber(c, n, j, cs);
        };
    export const delay = async (milliseconds: number, count: number): Promise<number> => {
        return new Promise<number>(resolve => {
            const fun = () => { resolve(count); };
            setTimeout(fun, milliseconds);
        });
    };

    //设置url
    export const setUrlAsync = async (node: cc.Node | cc.Sprite, url: string, defaultSp?: cc.SpriteFrame): Promise<void> => {
        let comp: cc.Sprite = null;
        if (typeof node === cc.Sprite.prototype.name) {
            comp = node.getComponent(cc.Sprite);
        } else {
            comp = <cc.Sprite>node;
        }
        if (!LibUtil.isNull(defaultSp)) {
            comp.spriteFrame = defaultSp;
        }
        let realUrl: string = url;
        if (LibUtil.isEmpty(realUrl) || realUrl.indexOf("http") < 0) {
            return;
        }
        if (realUrl.indexOf(".jpg") < 0 && realUrl.indexOf(".png") < 0) {
            realUrl = `${realUrl}??aaa=aa.jpg`;
        }

        return new Promise<void>((resolve) => {
            cc.loader.load(url, (err: Error, texture: cc.Texture2D) => {
                if (!LibUtil.isNull(err)) {
                    console.error(`拉取${url}网络图片失败:${err.toString()}`);
                    resolve();

                    return;
                }
                if (!comp.isValid) {
                    resolve();

                    return;
                }
                const frame = new cc.SpriteFrame(texture);
                comp.spriteFrame = frame;
                resolve();
            });
        });
    };

    //设置url
    export const setUrl = (node: cc.Node | cc.Sprite, url: string, defaultSp?: cc.SpriteFrame): void => {
        let comp: cc.Sprite = null;
        if (node instanceof cc.Node) {
            comp = node.getComponent(cc.Sprite);
        } else {
            comp = node;
        }
        if (LibUtil.isNull(comp)) {
            return;
        }
        if (!LibUtil.isNull(defaultSp)) {
            comp.spriteFrame = defaultSp;
        }
        let realUrl: string = url;
        if (LibUtil.isEmpty(realUrl) || realUrl.indexOf("http") < 0) {
            return;
        }
        if (realUrl.indexOf(".jpg") < 0 && realUrl.indexOf(".png") < 0) {
            realUrl = `${realUrl}??aaa=aa.jpg`;
        }
        cc.loader.load(realUrl, (err: Error, texture: cc.Texture2D) => {
            if (!LibUtil.isNull(err)) {
                console.error(`拉取${realUrl}网络图片失败:${err.toString()}`);

                return;
            }
            if (!comp.isValid) {
                return;
            }
            const frame = new cc.SpriteFrame(texture);
            comp.spriteFrame = frame;
        });
    };
    //用于给cc.sys.localStorage强转的接口,避免tslint报any的错
    export interface CCStorage {
        getItem(key: string): null | string;
        setItem(key: string, value: string): void;
    }
    //用于做不规则按钮时给node强转的接口,避免tslint报没有_hitTest的错
    export interface CCHitTest extends cc.Node {
        _hitTest: Function;
    }
    /**
     * 时间戳转换为格式为"23:12:01"的字符串
     * @param timeStamp 时间戳,个位为秒,不是毫秒
     */
    export const formatTime = (timeStamp: number): string => {
        const time = new Date(timeStamp * 1000);
        const hourNum = time.getHours();
        const hour = hourNum > 9 ? hourNum : `0${hourNum}`;
        const minNum = time.getMinutes();
        const min = minNum > 9 ? minNum : `0${minNum}`;
        const secNum = time.getSeconds();
        const sec = secNum > 9 ? secNum : `0${secNum}`;

        return `${hour}:${min}:${sec}`;
    };

    /**
     * 时间戳转换为格式为"2018-12-10 23:12:01"的字符串
     * @param dataStamp 时间戳,个位为秒,不是毫秒
     */
    export const formatDate = (dataStamp: number): string => {
        const date = new Date(dataStamp * 1000);
        const year = date.getFullYear();
        const monthNum = date.getMonth() + 1;
        const month = monthNum > 9 ? monthNum : `0${monthNum}`;
        const day = date.getDay();

        const hourNum = date.getHours();
        const hour = hourNum > 9 ? hourNum : `0${hourNum}`;
        const minNum = date.getMinutes();
        const min = minNum > 9 ? minNum : `0${minNum}`;
        const secNum = date.getSeconds();
        const sec = secNum > 9 ? secNum : `0${secNum}`;

        return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
    };
    /**
     * 格式化时间
     * @param value 倒计时秒数
     * @param count 以多少个域显示，比如00:02，这个时候count为2，默认是有多少就
     */
    export const formatSeconds = (value: number, fix: number = 2): string => {
        if (value < 0) {

            return "";
        }
        let secondTime: number = Math.floor(value);
        let minuteTime: number = 0;
        let hourTime: number = 0;
        if (secondTime >= 60) {
            minuteTime = Math.floor(secondTime / 60);
            secondTime = Math.floor(secondTime % 60);
            if (minuteTime >= 60) {
                hourTime = Math.floor(minuteTime / 60);
                minuteTime = Math.floor(minuteTime % 60);
            }
        }
        const fixN = LibUtil.checkNumber(fix, 0);
        const timeList: string[] = [];
        if (hourTime > 0) {
            timeList.push(hourTime > 9 ? hourTime.toString() : `0${hourTime.toString()}`);
        } else if (fixN >= 3) {
            timeList.push("00");
        }
        if (minuteTime > 0) {
            timeList.push(minuteTime > 9 ? minuteTime.toString() : `0${minuteTime.toString()}`);
        } else if (fixN >= 2) {
            timeList.push("00");
        }
        if (secondTime > 0) {
            timeList.push(secondTime > 9 ? secondTime.toString() : `0${secondTime.toString()}`);
        } else if (fixN >= 1) {
            timeList.push("00");
        }

        return timeList.join(":");
    };
    /**
     * 格式化数字
     * @param value 数字，Long型请转为number
     * @param count 小数点后显示几位
     * @param max 保持原样的最大数值
     */
    export const formatNumber = (value: number, count: number = 0, max: number = 9999): string => {
        const K = 1000;
        const M = K * 1000;
        const B = M * 1000;
        if (value <= max) {
            return `${value}`;
        } else if (value < M * 10) {
            if (count === 0) {
                return `${Math.floor(value / K)}K`;
            }

            return `${Math.floor(value / K)}.${String(value % K).substr(0, count)}K`;
        } else if (value >= M * 10 && value < B * 10) {
            if (count === 0) {
                return `${Math.floor(value / M)}M`;
            }

            return `${Math.floor(value / M)}.${String(value % M).substr(0, count)}M`;
        } else {
            if (count === 0) {
                return `${Math.floor(value / B)}B`;
            }

            return `${Math.floor(value / B)}.${String(value % B).substr(0, count)}B`;
        }
    };
    /**
     * 按段格式化数字，比如2345678 => 2,234,678
     * @param value 数字，Long型请转为number
     */
    export const formatFieldNumber = (value: number, fix: number = 3): string => {
        const str = value.toString();
        const pcount = Math.ceil(str.length / fix);
        const flist: string[] = [];
        for (let index = 1; index <= pcount; index++) {
            let start = index * 3;
            let count = 3;
            if (start > str.length) {
                start = str.length;
                count = str.length - (index - 1) * fix;
            }
            flist.push(str.substr(-start, count));
        }
        flist.reverse();

        return flist.join(",");

    };
    /**
     * 范围内获取整数随机数
     */
    export const getRandomInt = (min: number, max: number): number => {
        const range = max - min;
        const random = Math.random();

        return (min + Math.round(random * range));
    };

    /**
     * 用于强制转换,避免没有offset的报错,实际上是有offset的
     */
    interface CUtf8Array extends Uint8Array {
        offset: number;
    }
    /**
     * 用于将类似于 minGamePb.WorldChat 的类扩展一个 decode 方法,防止在decodeAndReset中调用的时候报错
     */
    interface CCanDecode {
        decode(key: Uint8Array): Object;
    }

    /**
     * 直接用类似 minGamePb.WorldChat的decode方法对messageData:Uint8Array进行decode的话会使 messageData的offset变化,
     * 第二次用这个messageData进行decode将得不到数据,因此使用这个方法在decode之后将offset设为decode之前的offset,可以再次decode
     * @param classType 用于解码的类型
     * @param messageData Uint8Array的数据,用于解码
     */
    export const decodeAndReset = <T extends CCanDecode>(classType: T, messageData: Uint8Array): Object => {
        const temp1 = <CUtf8Array>messageData;
        const temp = temp1.offset;
        const obj = (classType.decode(messageData));
        temp1.offset = temp;

        return obj;
    };

    export const loadRes = async <T>(path: string, ty: typeof cc.Asset): Promise<T> => {
        return new Promise<T>((resolve) => {
            cc.loader.loadRes(path, ty, null, (err: Error, result: Object) => {
                if (!LibUtil.isNull(err)) {
                    console.error(`loadRes loadRes: ${err}`);
                    resolve(null);

                    return;
                }

                resolve(<T>result);
            });
        });
    };

    export const isWXPlatform = (): boolean => {
        return cc.sys.platform === cc.sys.WECHAT_GAME;
    };

    /**
     * 微信托管数据战力key
     */
    export const getWeiXinPowerKey = (): string => {
        return `combat_power`;
    };

    /**
     * 微信托管数据等级key
     */
    export const getWeiXinLevelKey = (): string => {
        return `level`;
    };

    /**
     * 微信托管数据idkey
     */
    export const getWeiXinIdKey = (): string => {
        return `id`;
    };

    /**
     * 微信托管数据在线key
     */
    export const getWeiXinOnLineKey = (): string => {
        return `online`;
    };
    /**
     * 微信托管数据vip
     */
    export const getWeiXinIsVip = (): string => {
        return `isVip`;
    };
    /**
     * 微信托管数据关卡
     */
    export const getWeiXinStage = (): string => {
        return `stage`;
    };
    export const getWeiXinUserGameData = (): string => {
        return `userGameData`;
    };
}
