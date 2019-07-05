import { Map } from "../../utils/Map";

/**
 * UI测试
 */
const { ccclass, property } = cc._decorator;

/**
 * 协议测试类型
 */
export class ProtoTestType {
    public text: string;
    public func: () => void;
    constructor(text: string, func: (btn?: cc.Button) => void) {
        this.text = text;
        this.func = func;
    }
}
// type ProtoTestType = { text: string; func(): void };
/**
 * UI测试类
 */
@ccclass
export class TestComp extends cc.Component {
    public mModuleList: Map<string, cc.Node> = new Map<string, cc.Node>();
    @property({ type: cc.Node, displayName: "模块节点" })
    private mModuleItem: cc.Node = null;
    @property({ type: cc.Node, displayName: "布局节点" })
    private mLayoutPNode: cc.Node = null;

    public createTestModel(label: string, name: string, list: ProtoTestType[] = null): void {
        let modelNode: cc.Node = null;
        if (this.mModuleList.containsKey(name)) {
            modelNode = this.mModuleList.getValue(name);
        } else {
            modelNode = cc.instantiate(this.mModuleItem);
            modelNode.name = name;
            modelNode.active = true;
            this.mModuleList.add(name, modelNode);
            const title = modelNode.getChildByName("Title");
            title.getComponent(cc.Label).string = label;
            this.mLayoutPNode.addChild(modelNode);
        }
        list.forEach((data) => {
            this.addTestBtn(name, data);
        });
    }

    public addTestBtn(name: string, data: ProtoTestType): void {
        let modelNode: cc.Node = null;
        if (this.mModuleList.containsKey(name)) {
            modelNode = this.mModuleList.getValue(name);
        }
        const itemNode = modelNode.getChildByName("TestItem");
        const content = modelNode.getChildByName("Content");
        const node = cc.instantiate(itemNode);
        node.active = true;
        content.addChild(node);
        const text = node.getChildByName("Label");
        text.getComponent(cc.Label).string = data.text;
        node.on("click", data.func.bind(node));
        this.scheduleOnce(() => {
            const size = text.getContentSize();
            node.setContentSize(cc.size(size.width + 30, 55));
        });
    }
}
