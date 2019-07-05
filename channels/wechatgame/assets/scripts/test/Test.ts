/**
 * UI测试
 */
import { GameEnv } from "../genv/GameEnv";
import { WXData } from "../model/WXData";
import { Map } from "../utils/Map";
const { ccclass, property } = cc._decorator;

/**
 * 协议测试类型
 */
class ProtoTestType {
    public text: string;
    public func: () => void;
    constructor(text: string, func: () => void) {
        this.text = text;
        this.func = func;
    }
}
// type ProtoTestType = { text: string; func(): void };
/**
 * UI测试类
 */
@ccclass
export class Test extends cc.Component {
    @property({ type: cc.Node, displayName: "模块节点" })
    private mModuleItem: cc.Node = null;
    @property({ type: cc.Node, displayName: "布局节点" })
    private mLayoutPNode: cc.Node = null;
    private readonly mId: number = 25;
    private mModuleList: Map<string, cc.Node> = new Map<string, cc.Node>();

    private mWXModule: ProtoTestType[] = [
        new ProtoTestType("好友数据", async () => {
            console.log(await WXData.getFriendCloudStorage(["test1", "test2"]));
        }),
        new ProtoTestType("群数据", async () => {
            console.log(await WXData.getGroupCloudStorage("", ["test1", "test2"]));
        }),
        new ProtoTestType("保存数据", async () => {
            await WXData.setUserCloudStorage([
                { key: "test", value: "111" },
                { key: "test2", value: "2222" }
            ]);
        }),
        new ProtoTestType("获取数据", async () => {
            console.log(await WXData.getUserCloudStorage(["test1", "test2"]));
        }),
        new ProtoTestType("删除数据", async () => {
            await WXData.removeUserCloudStorage(["test1", "test2"]);
        })
    ];

    private mUIModule: ProtoTestType[] = [
        new ProtoTestType("微信好友", async () => {
            console.log(await GameEnv.instance.uiDirector.openView("prefab/friends/WeChatFriendPanel"));
        })
    ];

    public async start(): Promise<void> {
        await this.initEnv();
        this.init();
    }

    public init(): void {
        this.createTestModel("微信模块", "core", this.mWXModule);
        this.createTestModel("UI模块", "ui", this.mUIModule);
    }

    private createTestModel(label: string, name: string, list: ProtoTestType[] = null): void {
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

    private async initEnv(): Promise<void> {
        if (GameEnv.isExist()) {
            return;
        }
        await GameEnv.createInstance();
    }

    private addTestBtn(name: string, data: ProtoTestType): void {
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
        node.on(cc.Node.EventType.TOUCH_END, data.func);
        this.scheduleOnce(() => {
            const size = text.getContentSize();
            node.setContentSize(cc.size(size.width + 30, 55));
        });
    }
}
