/**
 * Author:  王冬春
 * Version: 1.0
 * Description: 微信开发数据
 * History: 无
 */
import { GameEnv } from "../genv/GameEnv";
import { CommonUtil } from "../utils/CommonUtil";
import { LibUtil } from "../utils/LibUtil";
import { Map } from "../utils/Map";

export namespace WXData {
    let mFriendData: UserGameData[] = null;
    let mSaveTime: number = 0;
    /**
     * 自己托管数据
     */
    export const getUserCloudStorage = async (keyList: string[]): Promise<KVData[]> => {
        if (!CommonUtil.isWXPlatform()) {
            return null;
        }

        return new Promise<KVData[]>((resolve) => {
            wx.getUserCloudStorage({
                keyList: keyList,
                success: (data) => {
                    console.log("getUserCloudStorage success", data);
                    resolve(data.KVDataList);
                },
                fail: () => {
                    console.log("getUserCloudStorage fail");
                    resolve(null);
                },
                complete: () => {
                    console.log("getUserCloudStorage complete");
                    resolve(null);
                }
            });
        });
    };

    const getFriendCache = (): UserGameData[] => {
        if (LibUtil.isNull(mFriendData)) {
            return null;
        }
        const offset = Date.now() - LibUtil.checkNumber(mSaveTime, Date.now());
        if (offset >= 5 * 60 * 1000) { //过期了
            return null;
        }

        return mFriendData;
    };

    export const doHandleMessage = (msg: string): void => {
        console.log("sub doHandleMessage msg:", doHandleMessage);
        switch (msg) {
            case "friends":
                getFriendCloudStorage([GameEnv.instance.dataKey], true);
                break;
            default:
                console.log("sub doHandleMessage nohandled:", msg);
        }
    };

    /**
     * 好友托管数据
     */
    export const getFriendCloudStorage = async (keyList: string[], force?: boolean): Promise<UserGameData[]> => {
        if (!CommonUtil.isWXPlatform()) {
            return null;
        }

        const cache = getFriendCache();
        if (!LibUtil.isNull(cache) && !LibUtil.checkBoolean(force)) {
            return cache;
        }
        mFriendData = null;

        return new Promise<UserGameData[]>((resolve) => {
            wx.getFriendCloudStorage({
                keyList: keyList,
                success: (data) => {
                    mSaveTime = Date.now();
                    mFriendData = data.data;
                    console.log("getFriendCloudStorage success", data);
                    resolve(data.data);
                },
                fail: () => {
                    console.log("getFriendCloudStorage fail");
                    resolve(null);
                },
                complete: () => {
                    console.log("getFriendCloudStorage complete");
                    resolve(null);
                }
            });
        });
    };

    /**
     * 群托管数据
     */
    export const getGroupCloudStorage = async (shareTicket: string, keyList: string[]): Promise<UserGameData[]> => {
        if (!CommonUtil.isWXPlatform()) {
            return null;
        }

        return new Promise<UserGameData[]>((resolve) => {
            wx.getGroupCloudStorage({
                shareTicket: shareTicket,
                keyList: keyList,
                success: (data) => {
                    console.log("getGroupCloudStorage success", data);
                    resolve(data.data);
                },
                fail: () => {
                    console.log("getGroupCloudStorage fail");
                    resolve(null);
                },
                complete: () => {
                    console.log("getGroupCloudStorage complete");
                    resolve(null);
                }
            });
        });
    };

    /**
     * 托管自己的数据
     */
    export const setUserCloudStorage = async (kvDataList: KVData[]): Promise<void> => {
        if (!CommonUtil.isWXPlatform()) {
            return;
        }

        return new Promise<void>((resolve) => {
            wx.setUserCloudStorage({
                KVDataList: kvDataList,
                success: (data) => {
                    console.log("setUserCloudStorage success", data);
                    resolve();
                },
                fail: () => {
                    console.log("setUserCloudStorage fail");
                    resolve();
                },
                complete: () => {
                    console.log("setUserCloudStorage complete");
                    resolve();
                }
            });
        });
    };

    /**
     * 删除自己的某些托管数据
     */
    export const removeUserCloudStorage = async (keyList: string[]): Promise<void> => {
        if (!CommonUtil.isWXPlatform()) {
            return;
        }

        return new Promise<void>((resolve) => {
            wx.removeUserCloudStorage({
                keyList: keyList,
                success: (data) => {
                    console.log("removeUserCloudStorage success", data);
                    resolve();
                },
                fail: () => {
                    console.log("removeUserCloudStorage fail");
                    resolve();
                },
                complete: () => {
                    console.log("removeUserCloudStorage complete");
                    resolve();
                }
            });
        });
    };

    /**
     * 转换KVData为Map
     */
    export const convertKVData2Map = (keyList: KVData[]): Map<string, string> => {
        const result = new Map<string, string>();
        if (LibUtil.isNull(keyList)) {
            return result;
        }
        keyList.forEach((data) => {
            result.add(data.key, data.value);
        });

        return result;
    };
}
