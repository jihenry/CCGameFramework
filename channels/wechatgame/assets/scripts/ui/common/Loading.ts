/**
 * Author:朱快
 * Version:1.0
 * Description:宝箱界面装备物品node
 * History:
 */

const { ccclass, property } = cc._decorator;
import { GameEnv } from "../../genv/GameEnv";
import { UIParams } from "../../manager/UIParams";
import { LibUtil } from "../../utils/LibUtil";

type LoadingParamType = string | { str: string; time?: number; timeoutCB(): void };
/**
 * 加载界面
 */
@ccclass
export class Loading extends cc.Component {
    @property(cc.Sprite)
    public mBg: cc.Sprite = null;

    public onLoad(): void {
        const param = GameEnv.instance.uiDirector.getParam<LoadingParamType>(this.node);
        let time = 2000;
        console.log("sub loading onLoad", param);
        if (!LibUtil.isNull(param) && typeof param !== "string") {
            time = !LibUtil.isNull(param.time) ? param.time : time;
        }
        this.mBg.node.runAction(cc.repeatForever(cc.rotateBy(2, 360)));
        this.scheduleOnce(
            () => {
                GameEnv.instance.uiDirector.closeView(this.node);
                if (!LibUtil.isNull(param) && typeof param !== "string") {
                    if (!LibUtil.isNull(param.timeoutCB)) {
                        param.timeoutCB();
                    }
                }
            },
            time);
    }

    public onDestroy(): void {
        console.log("loading onDestroy");
    }
}
