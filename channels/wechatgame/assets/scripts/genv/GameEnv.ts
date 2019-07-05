import { UIDirector as UIDirectorCls } from "../manager/UIDirector";
import { WXData } from "../model/WXData";
import { CommonUtil } from "../utils/CommonUtil";
import { Constant } from "../utils/Constant";
import { LibUtil } from "../utils/LibUtil";

/**
 * 全局的游戏环境
 * 游戏一开始时，由第一个cocos生成的脚本对象来new GameEnv对象，
 * 之后，唯一的GameEnv就一直存在，直到退出游戏。
 */
export class GameEnv {
    /**
     * 全局唯一单件实例
     */
    private static mInstance: GameEnv;

    //切换场景参数传递
    private mSceneParam: Object = {};

    public set sceneParam(param: Object) {
        this.mSceneParam = param;
    }

    public get sceneParam(): Object {
        return this.mSceneParam;
    }
    /**
     * UI操作
     */
    private mUIDirector: UIDirectorCls;
    public get uiDirector(): UIDirectorCls {
        return this.mUIDirector;
    }

    private mWXDataKey: string = "";
    public get dataKey(): string {
        return this.mWXDataKey;
    }

    constructor() {
        console.log('sub constructor GameEnv!');
        this.mUIDirector = new UIDirectorCls();
        this.initEvent();
    }

    /**
     * 获取GameEnv全局唯一实例
     */
    public static get instance(): GameEnv {
        if (GameEnv.mInstance === undefined) {
            throw Error("sub singleton instance is undefined");
        }

        return GameEnv.mInstance;
    }

    public static isExist(): boolean {
        return GameEnv.mInstance !== undefined;
    }

    /**
     * 创建GameEnv全局唯一实例
     */
    public static async createInstance(): Promise<void> {
        if (GameEnv.mInstance !== undefined) {
            throw Error("sub singleton instance has been created");
        }

        GameEnv.mInstance = new GameEnv();
    }

    private initEvent(): void {
        if (cc.sys.platform !== cc.sys.WECHAT_GAME) {
            console.log("非微信环境 不注册事件!");

            return;
        }
        wx.onMessage(async (data) => {
            console.log(data);
            await this.dispatchEvent(<Constant.MainMessageEvent>data);
        });
    }

    private async dispatchEvent(msg: Constant.MainMessageEvent): Promise<void> {
        if (LibUtil.isNull(msg)) {
            return;
        }
        switch (msg.cmd) {
            case "closeAllView":
                GameEnv.instance.uiDirector.closeAllView();
                break;
            case "openView": {
                GameEnv.instance.uiDirector.closeAllView();
                const msgData = <Constant.ViewMsgType>(msg.data);
                await GameEnv.instance.uiDirector.openView(msgData.view, msgData.data, msgData.params);
                break;
            }
            case "closeView": {
                const msgData = <Constant.ViewMsgType>(msg.data);
                GameEnv.instance.uiDirector.closeView(msgData.view);
                break;
            }
            case "replaceView": {
                const msgData = <Constant.ViewMsgType>(msg.data);
                await GameEnv.instance.uiDirector.replaceView(msgData.view, msgData.data, msgData.params);
                break;
            }
            case "loadData": {
                await WXData.doHandleMessage(<string>msg.data);
                break;
            }
            case "updateDataKey": {
                this.mWXDataKey = <string>(msg.data);
                break;
            }
            default:
                console.log(`未处理的消息类型: ${msg.cmd}`);
        }
    }
}
