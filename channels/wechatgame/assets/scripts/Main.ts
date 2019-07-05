import { GameEnv } from "./genv/GameEnv";

/**
 * Author:
 * Version:1.0
 * Description:开放域入口文件
 * History:
 */

const { ccclass, property } = cc._decorator;
/**
 * 好友界面-微信好友面板
 */
@ccclass
export class Main extends cc.Component {
    public async onLoad(): Promise<void> {
        console.log('sub main onLoad');
        if (GameEnv.isExist()) {
            return;
        }
        await GameEnv.createInstance();
    }
}
