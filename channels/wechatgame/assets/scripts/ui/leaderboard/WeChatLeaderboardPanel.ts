import { GameEnv } from "../../genv/GameEnv";
import { WXData } from "../../model/WXData";
import { CommonUtil } from "../../utils/CommonUtil";
import { LibUtil } from "../../utils/LibUtil";
import { UIUtil } from "../../utils/UIUtil";
import { ListViewDir, ListViewEx, ListViewParams } from "../common/ListViewEx";

/**
 * Author:
 * Version:1.0
 * Description:好友排行
 * History:
 */

const { ccclass, property } = cc._decorator;
/**
 * 好友排行
 */
@ccclass
export class WeChatLeaderboardPanel extends cc.Component {
    @property(cc.Node)
    private mScrollView: cc.Node = null;
    @property(cc.Node)
    private mSubItem: cc.Node = null;
    @property(cc.Node)
    private mScrollContainer: cc.Node = null;
    private mDefaultSp: cc.SpriteFrame = null;
    @property({ type: cc.SpriteFrame, displayName: "关卡图片集" })
    private mGqImage: cc.SpriteFrame[] = [];

    //自己信息
    @property({ type: cc.Node, displayName: "自己未上榜node" })
    private mMyNode: cc.Node = null;
    @property({ type: cc.Label, displayName: "自己未上榜名字" })
    private mMyName: cc.Label = null;
    @property({ type: cc.Label, displayName: "自己未上榜等级" })
    private mMyLevel: cc.Label = null;
    @property({ type: cc.Sprite, displayName: "自己未上榜头像" })
    private mMySprite: cc.Sprite = null;
    @property({ type: cc.Label, displayName: "自己未上榜战力" })
    private mMyNumber: cc.Label = null;
    @property({ type: cc.Node, displayName: "自己未上榜排名" })
    private mMyRankNode: cc.Node = null;
    @property({ type: cc.Label, displayName: "自己上榜排名" })
    private mMyRank: cc.Label = null;
    @property({ type: cc.Node, displayName: "自己上榜vip" })
    private mMyVip: cc.Node = null;
    @property({ type: cc.Sprite, displayName: "自己未上榜关卡图片" })
    private mMyGQSprite: cc.Sprite = null;

    private mListViewEx: ListViewEx = null;
    private mItemList: cc.Node[] = [];

    private myId: string;
    public async onLoad(): Promise<void> {
        this.initInfiniteScroll();
        await this.init();
    }

    public onDestroy(): void {
        //
    }

    private async init(): Promise<void> {
        // console.log("初始化微信好友排行");
        await UIUtil.showLoading();
        const data = await WXData.getFriendCloudStorage([GameEnv.instance.dataKey]);
        await this.refreshList(data);
        UIUtil.closeLoading();
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
            gap_y: 10,
            start_y: -15,
            itemSetter: (item: cc.Node, data: { [key: string]: Object }, index: number) => {
                this.initItem(item, data, index);

                return [item.width, item.height];
            }
        };
        this.mListViewEx = new ListViewEx(params);
    }
    private updateMyRanking(dataJson: { [key: string]: Object }, index: number): void {
        if (LibUtil.isNull(dataJson)) {
            return;
        }
        const data = <UserGameData>dataJson[CommonUtil.getWeiXinUserGameData()];
        const levelStr = LibUtil.checkString(dataJson[CommonUtil.getWeiXinLevelKey()], "1");
        // const combatPowerStr = LibUtil.checkString(dataJson[CommonUtil.getWeiXinPowerKey()], "0");
        const nick = CommonUtil.pointNumStr(data.nickname, 6);

        this.mMyLevel.string = levelStr;
        this.mMyName.string = nick;
        // this.mMyNumber.string = combatPowerStr;
        this.mMyRank.string = (index + 1).toString();
        this.mMyRank.node.active = true;
        this.mMyVip.active = LibUtil.checkBoolean(dataJson[CommonUtil.getWeiXinIsVip()], false);
        if (LibUtil.isNull(this.mDefaultSp)) {
            this.mDefaultSp = this.mMySprite.getComponent(cc.Sprite).spriteFrame;
        }
        //关卡
        const stageid = LibUtil.checkString(dataJson[CommonUtil.getWeiXinStage()], "st_1_1_1");
        const splitted = stageid.split("_");
        if (splitted.length === 4) {
            const num = LibUtil.checkNumber(splitted[1]);
            this.mMyGQSprite.spriteFrame = this.mGqImage[num - 1];
            const str = `${splitted[2]}-${splitted[3]}`;
            this.mMyNumber.getComponent(cc.Label).string = str;
        }
        CommonUtil.setUrl(this.mMySprite, data.avatarUrl, this.mDefaultSp);
        this.mMyNode.active = true;
    }
    private initItem(itemNode: cc.Node, dataJson: { [key: string]: Object }, index: number): void {
        //初始化
        const data = <UserGameData>dataJson[CommonUtil.getWeiXinUserGameData()];
        const bg4 = cc.find("bg/Background", itemNode);
        const bg3 = cc.find("bg/checkmark", itemNode);
        const kuang = cc.find("bg/kuang", itemNode);
        const rankingsNode: cc.Node[] = [];
        const nick = CommonUtil.pointNumStr(data.nickname, 6);
        for (let i = 0; i < 4; i++) {
            rankingsNode[i] = cc.find(`ranking/${i + 1}`, itemNode);
            rankingsNode[i].active = false;
        }
        bg4.active = false;
        bg3.active = false;
        kuang.active = false;
        //数据
        const levelStr = LibUtil.checkString(dataJson[CommonUtil.getWeiXinLevelKey()], "1");
        const idStr = LibUtil.checkString(dataJson[CommonUtil.getWeiXinIdKey()], "");
        // const combatPowerStr = LibUtil.checkString(dataJson[CommonUtil.getWeiXinPowerKey()], "0");

        const name = itemNode.getChildByName("name");
        const level = itemNode.getChildByName("number");
        const combatPower = itemNode.getChildByName("combatPower");
        const gqImage = itemNode.getChildByName("gqImage").getComponent(cc.Sprite);
        const portrait = cc.find("head", itemNode);
        const vip = cc.find("vip", portrait);
        vip.active = LibUtil.checkBoolean(dataJson[CommonUtil.getWeiXinIsVip()], false);
        const rankStr = (index + 1).toString();
        if (index > 2) {
            rankingsNode[3].active = true;
            rankingsNode[3].getComponent(cc.Label).string = rankStr;
            bg4.active = true;
            name.color = new cc.Color(234, 211, 179);
        } else {
            rankingsNode[index].active = true;
            bg3.active = true;
            name.color = new cc.Color(72, 51, 42);
        }
        if (idStr === this.myId && !LibUtil.isEmpty(this.myId)) {
            kuang.active = true;
        }
        name.getComponent(cc.Label).string = nick;
        level.getComponent(cc.Label).string = levelStr;
        // combatPower.getComponent(cc.Label).string = combatPowerStr;
        if (LibUtil.isNull(this.mDefaultSp)) {
            this.mDefaultSp = portrait.getComponent(cc.Sprite).spriteFrame;
        }
        //关卡
        const stageid = LibUtil.checkString(dataJson[CommonUtil.getWeiXinStage()], "st_1_1_1");
        const splitted = stageid.split("_");
        if (splitted.length === 4) {
            const num = LibUtil.checkNumber(splitted[1]);
            gqImage.spriteFrame = this.mGqImage[num - 1];
            const str = `${splitted[2]}-${splitted[3]}`;
            combatPower.getComponent(cc.Label).string = str;
        }
        CommonUtil.setUrl(portrait, data.avatarUrl, this.mDefaultSp);

        itemNode.active = true;
    }

    private async refreshList(data: UserGameData[]): Promise<void> {
        this.hideAll();
        if (LibUtil.isNull(data)) {

            return;
        }
        console.log("data ---------------------- ", data);
        const mine = WXData.convertKVData2Map(await WXData.getUserCloudStorage([GameEnv.instance.dataKey]));
        const mineData = mine.getValue(GameEnv.instance.dataKey);
        const mineJson = <{ [key: string]: Object }>JSON.parse(mineData);
        this.myId = LibUtil.checkString(mineJson[CommonUtil.getWeiXinIdKey()], "");
        // data.sort((a, b) => {
        //     if (a.KVDataList.length === 0 && b.KVDataList.length === 0) {
        //         return 0;
        //     }
        //     const stroageMapA = WXData.convertKVData2Map(a.KVDataList);
        //     const ap = stroageMapA.getValue(GameEnv.instance.dataKey);
        //     if (LibUtil.isEmpty(ap)) {
        //         return 1;
        //     }
        //     const stroageMapB = WXData.convertKVData2Map(b.KVDataList);
        //     const bp = stroageMapB.getValue(GameEnv.instance.dataKey);
        //     if (LibUtil.isEmpty(bp)) {
        //         return -1;
        //     }
        //     const mapA = <{ [key: string]: Object }>JSON.parse(ap);
        //     const mapB = <{ [key: string]: Object }>JSON.parse(bp);

        //     return LibUtil.checkNumber(mapA[CommonUtil.getWeiXinPowerKey()]) - LibUtil.checkNumber(mapB[CommonUtil.getWeiXinPowerKey()]);
        // });

        const validList: { [key: string]: Object }[] = [];
        // console.log("-------------------data --------------- ", data);
        data.forEach((itemD, i) => {
            const stroageMap = WXData.convertKVData2Map(itemD.KVDataList);
            const bp = stroageMap.getValue(GameEnv.instance.dataKey);
            let mapB: { [key: string]: Object } = {};
            if (!LibUtil.isEmpty(bp)) {
                mapB = <{ [key: string]: Object }>JSON.parse(bp);
                if (!LibUtil.isEmpty(LibUtil.checkString(mapB[CommonUtil.getWeiXinStage()], ""))) {
                    mapB[CommonUtil.getWeiXinUserGameData()] = itemD;
                    // if (!haveMe) {
                    //     const idStr = LibUtil.checkString(mapB[CommonUtil.getWeiXinIdKey()], "");
                    //     if (idStr === this.myId) {
                    //         this.updateMyRanking(mapB, i);
                    //         haveMe = true;
                    //     }
                    // }
                    validList.push(mapB);
                }
            }
        });
        validList.sort((a, b) => {
            if (a.length === 0 && b.length === 0) {
                return 0;
            }
            const bStr = LibUtil.checkString(b[CommonUtil.getWeiXinStage()], "");
            const aStr = LibUtil.checkString(a[CommonUtil.getWeiXinStage()], "");

            return this.changeStageToNumber(bStr) - this.changeStageToNumber(aStr);
        });
        this.mListViewEx.set_data(validList);
        let haveMe = false;
        validList.forEach((itemD, i) => {
            if (!haveMe) {
                const idStr = LibUtil.checkString(itemD[CommonUtil.getWeiXinIdKey()], "");
                if (idStr === this.myId) {
                    this.updateMyRanking(itemD, i);
                    haveMe = true;

                    return;
                }
            }
        });
        // console.log("-------------------validList --------------- ", validList);
    }

    private changeStageToNumber(stageid: string): number {
        let num = 0;
        const splitted = stageid.split("_");
        if (splitted.length === 4) {
            const numG = LibUtil.checkNumber(splitted[3]);
            const numG2 = numG > 9 ? splitted[3] : `0${numG}`;

            const numS = LibUtil.checkNumber(splitted[2]);
            const numS2 = numS > 9 ? splitted[2] : `0${numS}`;

            const numB = LibUtil.checkNumber(splitted[1]);
            // const numB2 = numB > 9 ? splitted[1] : `0${numB}`;

            num = LibUtil.checkNumber(`${numB}${numS2}${numG2}`);
        }

        return num;
    }
    private hideAll(): void {
        // if (LibUtil.isNull(this.mItemList)) {
        //     return;
        // }
        // this.mItemList.forEach((item) => {
        //     item.active = false;
        // });
    }

    // private createItem(data: UserGameData, index: number): void {
    //     const itemNode = cc.instantiate(this.mSubItem);
    //     this.mScrollContainer.addChild(itemNode);
    //     this.mItemList.push(itemNode);
    //     this.initItem(itemNode, data, index);
    // }

}
