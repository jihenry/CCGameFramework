import { GameEnv } from "../genv/GameEnv";

/**
 * Author:  王冬春
 * Version: 1.0
 * Description: 公共UI工具函数
 * History:无
 */

export namespace UIUtil {
    //显示提示Tip
    export const showTip = async (str: string): Promise<void> => {
        await GameEnv.instance.uiDirector.openView("prefab/view/TipView", str, { sound: false });
    };

    //显示转圈
    export const showLoading = async (data?: string | { str: string; time?: number; delay?: number; timeoutCB(): void }): Promise<void> => {
        await GameEnv.instance.uiDirector.openView("prefab/common/Loading", data, { sound: false, noPop: true });
    };

    export const closeLoading = (): void => {
        GameEnv.instance.uiDirector.closeView("Loading");
    };
    /**
     * 确认弹框
     * @param contentStr 弹框显示文本
     * @param confirmStr 确认按钮上的文本
     * @param confirmCallBack 确认按钮回调
     * @param closeCallBack 关闭按钮回调
     */
    export interface ConfirmOpts {
        contentStr: string;
        confirmStr?: string;
        confirmCallBack?: Function;
        closeCallBack?: Function;
    }
    export const openConfirmTip = async (opts: ConfirmOpts): Promise<void> => {
        const contentStr = opts.contentStr !== undefined ? opts.contentStr : "";
        const confirmStr = opts.confirmStr !== undefined ? opts.confirmStr : "确定";
        const closeCallBack = opts.closeCallBack !== undefined ? opts.closeCallBack : null;
        const confirmCallBack = opts.confirmCallBack !== undefined ? opts.confirmCallBack : null;
        await GameEnv.instance.uiDirector.openView(
            "prefab/view/ConfirmView",
            [contentStr, confirmCallBack, confirmStr, closeCallBack]);
    };
}
