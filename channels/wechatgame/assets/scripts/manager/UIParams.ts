/**
 * !#zh
 * 这是一个预设参数扩展类，用途传参和模拟测试，通过此组件可以给节点扩展一些公共属性
 * 为什么不设置成基类，让prefab的脚本组件继承的形式？首先节点可以挂载很多脚本组件，哪些继承哪些不继承是个问题。
 * 其次继承是强关系，通过组合方式关联耦合性更低。
 */

const { ccclass, property } = cc._decorator;

/**
 * 显示动态UI界面，传递参数组件
 */
@ccclass
export class UIParams extends cc.Component {

    //预设
    @property({ displayName: "传递参数：" })
    private mParams: Object = "";

    public get params(): Object {
        return this.mParams;
    }

    public set params(v: Object) {
        this.mParams = v;
    }
}
