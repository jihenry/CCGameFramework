/**
 * !#zh
 * 这是一个场景资源管理扩展类，用于场景资源管理，此模块的预设属性用于UIDirector复用场景进行界面切换。
 */

const { ccclass, property } = cc._decorator;

/**
 * 场景动态资源挂载组件
 */
@ccclass
export class FireRes extends cc.Component {

    //预设
    @property({ type: [cc.Prefab], displayName: "动态UI的prefab列表：" })
    private mPrefabs: cc.Prefab[] = [];

    public get prefabs(): cc.Prefab[] {
        return this.mPrefabs;
    }
}
