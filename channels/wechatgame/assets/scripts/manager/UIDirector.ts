/**
 * @description
 * !#zh
 * 场景下的动态UI界面管理模块，此类存在是为了复用一个场景，避免资源的频繁释放和加载。
 * 设计界面管理功能的目标是所有场景都能管理自己的UI。要实现场景自行管理自己UI界面，
 * 首先需要明确此场景有哪些预设节点需要管理（目前支持把资源挂载到FireRes组件下，或者放到resources目录里），再把FireRes组件添加到到场景的DUI节点。
 * 其次是调度逻辑。此类属于调度逻辑实现，实现方法如下：首先通过获得当前场景或者传入场景下的预设管理组件Prefab，遍历组件下的预设属性，
 * 找到想要显示的预设节点。关于有些UI界面需要外部传参，通过提供一个公共组件Param，然后设置公共组件的参数属性实现，
 * 如果是公共数据而通过数据模块取即可。UI界面管理最笨的方式就是把所有预设全部拖到场景里面，然后控制显示与隐藏，通过预设属性会更加灵活。
 * @author 王冬春
 */
import { CommonUtil } from "../utils/CommonUtil";
import { LibUtil } from "../utils/LibUtil";
import { FireRes } from "./FireRes";
import { UIParams } from "./UIParams";

/**
 * 场景下的UI界面管理类
 */
export class UIDirector {
    private mViewList: cc.Node[] = []; //节点列表
    public constructor() {
        console.info("sub UIDirector constructor");
    }

    /**
     * 叠加方式打开一个界面，如果要替换当前界面请使用replaceView接口
     * @param path 预设路径，如果是params指定了quote这里填预设的名字即可
     * @param data 可选，传给界面的数据，界面里强转成自己使用的类型
     * @param params 可选，params是传入给UIDirector的参数，比如{name:"HeroView",level:1,quote:true,sound:false}
     * level是控制界面添加到DUI的层级，name是控制显示界面的节点名字
     * params是传入给UIDirector的参数，data是传给界面的参数。
     */
    public async openView(path: string, data: Object = "", params: { [field: string]: Object } = {}): Promise<cc.Node> {
        const curSence: cc.Scene = cc.director.getScene();
        const dui: cc.Node = curSence.getChildByName("DUI");
        if (dui == null) {
            console.error("sub 场景必须添加DUI节点才能使用");

            return null;
        }
        let name = "";
        if (!LibUtil.isEmpty(<string>params.name)) {
            name = <string>params.name;
        } else {
            name = path.substr(path.lastIndexOf("/") + 1);
        }
        console.info(`sub openView path:${path} name:${name}`, "data:", data, "params:", params);
        const view = this.getView(name);
        if (!LibUtil.isNull(view)) {
            console.info(`sub openView exist view: ${name}`);
            this.popView(name);
            this.setData(view, data);
            view.active = false; //重新激活组件
            view.active = true;

            return view;
        }
        if (LibUtil.checkBoolean(params.hidePreView, false)) {
            const preView = this.getTopView();
            if (!LibUtil.isNull(preView)) {
                preView.active = false;
            }
        }
        params.name = name;
        let sprefab: cc.Prefab = null;
        let node: cc.Node = null;
        if (LibUtil.isNull(params.quote)) {
            sprefab = await CommonUtil.loadRes<cc.Prefab>(path, cc.Prefab);
        } else {
            const frc: FireRes = dui.getComponent(FireRes);
            if (frc == null) {
                console.error("sub openView DUI节点未添加FireRes组件");

                return null;
            }
            frc.prefabs.forEach((prefab: cc.Prefab) => {
                if (prefab.data.name === path) {
                    sprefab = prefab;
                }
            });
        }
        if (LibUtil.isNull(sprefab)) {
            return null;
        }
        node = this.createNode(sprefab, params, data);
        this.mViewList.push(node);
        console.info("sub openView mViewList.length:", this.mViewList.length);

        return node;
    }

    /**
     * 通过标记获取UIDirector已经管理的界面对象
     * @param tag 界面的标记，可以是界面的根节点或者openView中指定的页面的名字（默认是预设的名字）
     */
    public getView(tag: string | cc.Node): cc.Node {
        let node: cc.Node = null;
        if (tag === undefined) {
            return null;
        } else if (typeof (tag) === "string") {
            const fields = tag.split("/");
            const curSence: cc.Scene = cc.director.getScene();
            const vn: cc.Node = cc.find(`DUI/${fields[fields.length - 1]}`, curSence);
            node = vn;
        } else if (tag instanceof cc.Node) {
            const index = this.mViewList.indexOf(tag);
            if (index >= 0) {
                node = tag;
            }
        }

        if (!LibUtil.isNull(node) && !node.isValid) {
            node = null;
        } else if (!LibUtil.isNull(node)) {
            if (this.mViewList.indexOf(node) < 0) {
                node = null;
            }
        }

        return node;
    }

    /**
     * 获取最上层的界面
     */
    public getTopView(lastIndex: number = 0): cc.Node {
        let view: cc.Node = null;
        if (lastIndex <= 0) {
            view = this.mViewList[this.mViewList.length + lastIndex - 1];
        } else {
            view = this.mViewList[lastIndex];
        }
        if (!LibUtil.isNull(view) && !view.isValid) {
            view = null;
        }

        return view;
    }

    /**
     * 是否存在此界面
     * @param tag 界面的标记，可以是界面的根节点或者openView中指定的页面的名字（默认是预设的名字）
     */
    public hasView(tag: string | cc.Node): boolean {
        return !LibUtil.isNull(this.getView(tag));
    }

    /**
     * 通过标记关闭某个界面
     * @param tag 界面的标记，可以是界面的根节点或者openView中指定的页面的名字（默认是预设的名字）
     */
    public closeView(tag: string | cc.Node): void {
        const node = this.getView(tag);
        if (LibUtil.isNull(node)) {
            return;
        }
        console.info("sub closeView name:", node.name);
        node.active = false;
        node.destroy();
        const index: number = this.mViewList.indexOf(node);
        if (index < 0) {
            return;
        }

        if (index === this.mViewList.length - 1) {
            const topView = this.getTopView(-1);
            if (!LibUtil.isNull(topView) && !topView.active) {
                topView.active = true;
            }
        }
        this.mViewList.splice(index, 1);
        console.info("sub closeView mViewList.length:", this.mViewList.length);
    }

    /**
     * 把当前的界面替换为另外一个界面
     * @param path 预设路径，如果是params指定了quote这里填预设的名字即可
     * @param data 可选，传给界面的数据，界面里强转成自己使用的类型
     * @param params 可选，params是传入给UIDirector的参数，比如{name="HeroView",level=1,quote=true}
     * level是控制界面添加到DUI的层级，name是控制显示界面的节点名字
     * params是传入给UIDirector的参数，data是传给界面的参数。
     */
    public async replaceView(path: string, data: Object = "", params: { [field: string]: Object } = {}): Promise<cc.Node> {
        const view = this.getView(path);
        if (!LibUtil.isNull(view)) { //多次调用replaceView，防止closeView其他的界面
            return this.openView(path, data, params);
        }
        const topNode: cc.Node = this.mViewList[this.mViewList.length - 1];
        this.closeView(topNode);

        return this.openView(path, data, params);
    }

    /**
     * 关闭所有界面
     * @param index 从哪个界面开始关闭
     */
    public closeAllView(index: number = -1): void {
        console.info(`sub closeAllView index: ${index}`);
        const loop = this.mViewList.slice();
        for (let i = index + 1; i < loop.length; i++) {
            this.closeView(loop[i]);
        }
    }

    /**
     * 获取界面打开参数
     * @param node 界面根节点
     * @param dp 默认参数
     */
    public getParam<T>(node: cc.Node, dp: T = null): T {
        const comp = node.getComponent(UIParams);
        if (!LibUtil.isNull(comp) && !LibUtil.isEmpty(<string>comp.params)) {
            return <T>comp.params;
        } else {
            return dp;
        }
    }

    /**
     * 弹出某个界面上所有界面
     * @param tag 界面的标记，可以是界面的根节点或者openView中指定的页面的名字（默认是预设的名字）
     */
    private popView(tag: string | cc.Node): void {
        const view = this.getView(tag);
        if (LibUtil.isNull(view)) {
            return;
        }
        const index = this.mViewList.indexOf(view);
        if (index < 0) {
            return;
        }
        this.closeAllView(index);
    }

    private setData(tn: cc.Node, data: Object): void {
        let upc: UIParams = tn.getComponent(UIParams);
        if (LibUtil.isNull(upc)) {
            upc = tn.addComponent(UIParams);
        }
        if (!LibUtil.isNull(upc)) {
            upc.params = data;
        }
    }

    private createNode(prefab: cc.Prefab | cc.Node, params: { [field: string]: Object } = {}, data: Object = ""): cc.Node {
        const curSence: cc.Scene = cc.director.getScene();
        const dui: cc.Node = curSence.getChildByName("DUI");
        const tn: cc.Node = prefab instanceof cc.Prefab ? prefab.data : prefab;
        this.setData(tn, data);
        const node: cc.Node = cc.instantiate(tn);
        node.setAnchorPoint(new cc.Vec2(0, 1));
        node.setPosition(new cc.Vec2(0, 0));
        dui.addChild(node);
        if (params.name !== undefined) {
            node.name = <string>params.name;
        }
        if (params.level !== undefined) {
            dui.setSiblingIndex(<number>params.level);
        }
        if (params.cb !== undefined && typeof (params.cb) === "function") {
            params.cb(node);
        }

        return node;
    }
}
