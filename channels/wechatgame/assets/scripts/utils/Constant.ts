import { Map } from "./Map";

/**
 * Author:  王冬春
 * Version: 1.0
 * Description: 常量声明
 * History: 无
 */

export namespace Constant {

    export const gameVersion: string = "1.0.0.1"; //公共测试服务器
    // export const gameVersion: string = "1.0.0.6"; //罗行
    // export const gameVersion: string = "1.0.0.5"; //海洋
    // export const gameVersion: string = "1.0.1.6"; //龙伟

    /**
     * 主域发送过来的消息结构
     */
    export type MainMessageEvent = {
        cmd: string; //命令
        data?: Object; //数据
    };

    /**
     * 界面消息结构
     */
    export type ViewMsgType = {
        view: string; //界面路径
        data?: Object; //界面数据
        params?: { [field: string]: Object }; //参数
    };

}
