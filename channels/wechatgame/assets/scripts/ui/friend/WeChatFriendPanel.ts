import { GameEnv } from "../../genv/GameEnv";
import { WXData } from "../../model/WXData";
import { CommonUtil } from "../../utils/CommonUtil";
import { Constant } from "../../utils/Constant";
import { LibUtil } from "../../utils/LibUtil";
import { ListViewDir, ListViewEx, ListViewParams } from "../common/ListViewEx";

/**
 * Author:
 * Version:1.0
 * Description:好友界面-微信好友面板
 * History:
 */

interface Friend {
    id?: string;
    nick?: string;
    protrait?: string;
    online?: boolean;
    level?: number;
    quality?: number;
    star?: number;
    unrecvnum?: number;
}

const { ccclass, property } = cc._decorator;
/**
 * 好友界面-微信好友面板
 */
@ccclass
export class WeChatFriendPanel extends cc.Component {
    @property(cc.Node)
    private mFriendLabel: cc.Node = null;
    @property(cc.Node)
    private mScrollView: cc.Node = null;
    @property(cc.Label)
    private mFriendNumLabel: cc.Label = null;
    @property(cc.Label)
    private mFriendTotalLabel: cc.Label = null;
    @property(cc.Node)
    private mSubItem: cc.Node = null;
    @property(cc.Node)
    private mTipNode: cc.Node = null;
    @property(cc.Node)
    private mScrollContainer: cc.Node = null;
    @property(cc.Node)
    private mLoadingNode: cc.Node = null;
    private mDefaultSp: cc.SpriteFrame = null;
    private mFriendList: Friend[] = [];
    private mListViewEx: ListViewEx = null;

    public async onLoad(): Promise<void> {
        this.mFriendList = GameEnv.instance.uiDirector.getParam<Friend[]>(this.node, []);
        console.log('sub WeChatFriendPanel onLoad', this.mFriendList);
        this.initInfiniteScroll();
        await this.init();
    }

    public onDestroy(): void {
        this.mListViewEx.destroy();
        this.unschedule(this.onLoadingTimeOut);
        console.log("sub WeChatFriendPanel onDestroy");
    }

    private async init(): Promise<void> {
        console.log("初始化微信好友panel");
        this.mLoadingNode.active = true;
        this.mLoadingNode.runAction(cc.sequence(cc.delayTime(1), cc.show()));
        this.unschedule(this.onLoadingTimeOut);
        this.scheduleOnce(this.onLoadingTimeOut, 10);
        const data = await WXData.getFriendCloudStorage([GameEnv.instance.dataKey]);
        await this.refreshList(data);
        this.mLoadingNode.stopAllActions();
        this.mLoadingNode.active = false;
        this.unschedule(this.onLoadingTimeOut);
    }

    private onLoadingTimeOut(): void {
        console.log("sub WeChatFriendPanel onLoadingTimeOut");
        this.setEmptyTipVisible(true);
        this.mLoadingNode.stopAllActions();
        this.mLoadingNode.active = false;
    }

    private initInfiniteScroll(): void {
        if (!LibUtil.isNull(this.mListViewEx)) {
            return;
        }
        const params: ListViewParams = {
            scrollview: this.mScrollView.getComponent(cc.ScrollView),
            mask: this.mScrollView,
            content: this.mScrollContainer,
            item_tpl: this.mSubItem,
            direction: ListViewDir.Vertical,
            gap_y: 4,
            start_y: -15,
            itemSetter: (item: cc.Node, data: { [key: string]: Object }, index: number) => {
                this.initItem(item, data);

                return [item.width, item.height];
            }
        };
        this.mListViewEx = new ListViewEx(params);
    }

    private getDataFromMainById(id: string): Friend {
        if (LibUtil.isNull(this.mFriendList)) {
            return null;
        }
        for (const data of this.mFriendList) {
            if (data.id === id) {
                return data;
            }
        }

        return null;
    }

    private initItem(itemNode: cc.Node, dataJson: { [key: string]: Object }): void {
        const data = <UserGameData>dataJson[CommonUtil.getWeiXinUserGameData()];
        const idStr = LibUtil.checkString(dataJson[CommonUtil.getWeiXinIdKey()], "");
        itemNode.active = true;
        const name = itemNode.getChildByName("PlayerName").getComponent(cc.Label);
        const id = itemNode.getChildByName("Id");
        const portrait = cc.find("HeadNode/Portrait", itemNode);
        const vip = cc.find("HeadNode/vip", itemNode);
        const level = itemNode.getChildByName("Level").getComponent(cc.Label);
        const offlineFlag = itemNode.getChildByName("OfflineFlag");
        const onlineFlag = itemNode.getChildByName("OnlineFlag");
        id.getComponent(cc.Label).string = idStr;
        const online = LibUtil.checkBoolean(dataJson[CommonUtil.getWeiXinOnLineKey()], false);
        const levelStr = LibUtil.checkString(dataJson[CommonUtil.getWeiXinLevelKey()], "");
        name.string = CommonUtil.pointNumStr(data.nickname, 6);
        level.string = levelStr;
        offlineFlag.active = !online;
        onlineFlag.active = online;
        vip.active = LibUtil.checkBoolean(dataJson[CommonUtil.getWeiXinIsVip()], false);
        if (LibUtil.isNull(this.mDefaultSp)) {
            this.mDefaultSp = portrait.getComponent(cc.Sprite).spriteFrame;
        }
        CommonUtil.setUrl(portrait, data.avatarUrl, this.mDefaultSp);
    }

    private async refreshList(data: UserGameData[]): Promise<void> {
        this.hideAll();
        if (LibUtil.isNull(data)) {
            this.setEmptyTipVisible(true);

            return;
        }
        let onlineNum = 0;

        const mine = WXData.convertKVData2Map(await WXData.getUserCloudStorage([GameEnv.instance.dataKey]));
        const mineData = mine.getValue(GameEnv.instance.dataKey);
        const mineJson = <{ [key: string]: Object }>JSON.parse(mineData);
        const myOpenId = LibUtil.checkString(mineJson[CommonUtil.getWeiXinIdKey()], "");
        let totalNum = 0;
        let onlineList: { [key: string]: Object }[] = [];
        const offList: { [key: string]: Object }[] = [];
        data.forEach((element) => {
            const stroageMap = WXData.convertKVData2Map(element.KVDataList);
            const ap = stroageMap.getValue(GameEnv.instance.dataKey);
            // let map: { [key: string]: Object } = {};
            if (LibUtil.isEmpty(ap)) {
                return;
            }
            const map = <{ [key: string]: Object }>JSON.parse(ap);
            const id = LibUtil.checkString(map[CommonUtil.getWeiXinIdKey()], "");

            const mainFriendData = this.getDataFromMainById(id);
            if (!LibUtil.isNull(mainFriendData)) {
                element.nickname = mainFriendData.nick;
                element.avatarUrl = mainFriendData.protrait;
                map[CommonUtil.getWeiXinLevelKey()] = mainFriendData.level.toString();
                map[CommonUtil.getWeiXinOnLineKey()] = mainFriendData.online ? "true" : "false";
            }
            map[CommonUtil.getWeiXinUserGameData()] = element;

            const online = LibUtil.checkBoolean(map[CommonUtil.getWeiXinOnLineKey()], false);
            const level = LibUtil.checkString(map[CommonUtil.getWeiXinLevelKey()], "");
            // const power = LibUtil.checkString(map[CommonUtil.getWeiXinPowerKey()], "");
            const power = LibUtil.checkString(map[CommonUtil.getWeiXinStage()], "");
            if (LibUtil.isEmpty(level) || LibUtil.isEmpty(id) || LibUtil.isEmpty(power)) {
                return;
            }
            online ? onlineList.push(map) : offList.push(map);
        });
        const sortCB = (a: { [key: string]: Object }, b: { [key: string]: Object }) => {
            const aLevel = LibUtil.checkNumber(a[CommonUtil.getWeiXinLevelKey()], 0);
            const bLevel = LibUtil.checkNumber(b[CommonUtil.getWeiXinLevelKey()], 0);
            if (aLevel > bLevel) {
                return -1;
            } else if (aLevel === bLevel) {
                return 0;
            } else {
                return 1;
            }
        };
        onlineList.sort(sortCB);
        offList.sort(sortCB);
        onlineList = onlineList.concat(offList);
        this.setEmptyTipVisible(onlineList.length <= 0);
        const validList: { [key: string]: Object }[] = [];
        onlineList.forEach((map, i) => {
            const online = LibUtil.checkBoolean(map[CommonUtil.getWeiXinOnLineKey()], false);
            const id = LibUtil.checkString(map[CommonUtil.getWeiXinIdKey()], "");
            if (id === myOpenId && !LibUtil.isEmpty(myOpenId)) {
                return true;
            }
            totalNum++;
            validList.push(map);
            if (online) {
                onlineNum += 1;
            }

            return true;
        });
        if (totalNum <= 0) {
            this.setEmptyTipVisible(true);

            return;
        }
        this.mFriendNumLabel.string = onlineNum.toString();
        this.mFriendTotalLabel.string = totalNum.toString();
        this.mListViewEx.set_data(validList);
    }

    private hideAll(): void {
        this.mFriendNumLabel.string = "0";
        this.mFriendTotalLabel.string = "0";
    }

    private setEmptyTipVisible(visible: boolean): void {
        this.mTipNode.active = visible;
        this.mFriendLabel.active = !visible;
        this.mScrollContainer.active = !visible;
    }
}
