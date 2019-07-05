import { LayoutUtil } from "./LayoutUtil";

// tslint:disable:no-any
export enum ListViewDir {
    Vertical = 1,
    Horizontal = 2
}

export type ListViewParams = {
    scrollview: cc.ScrollView;
    mask: cc.Node;
    content: cc.Node;
    item_tpl: cc.Node;
    direction?: ListViewDir;
    start_x?: number;  //开始的x坐标
    start_y?: number;  //开始的y坐标
    width?: number;
    height?: number;
    gap_x?: number;
    gap_y?: number;
    row?: number;                                                                //水平方向排版时，垂直方向上的行数
    column?: number;                                                             //垂直方向排版时，水平方向上的列数
    cb_host?: any;                                                               //回调函数host
    auto_scrolling?: boolean;                                                    //append时自动滚动到尽头
    itemSetter(item: cc.Node, data: any, index: number): void;                   //item更新setter
    recycle_cb?(item: cc.Node): void;                                           //回收时的回调
    select_cb?(data: any, index: number): void;                                  //item选中回调
    select_setter?(item: cc.Node, isSelect: boolean, index: number): void;       //item选中效果setter
    scroll_to_end_cb?(): void;                                                 //滚动到尽头的回调
};

type ListItem = {
    x: number;
    y: number;
    data: any;
    node: cc.Node;
    is_select: boolean;
};

/**
 * 无限滚动listview
 */
export class ListViewEx {

    // get datas(): any[] {
    //     return this.mDatas;
    // }

    // get selected_index(): number {
    //     return this.mSelectedIndex;
    // }

    // get selectd_data(): any {
    //     const item: ListItem = this.items[this.mSelectedIndex];
    //     if (item != null) {
    //         return item.data;
    //     }

    //     return null;
    // }
    private scrollview: cc.ScrollView;
    private mask: cc.Node;
    private content: cc.Node;
    private itemTpl: cc.Node;
    private nodePool: cc.Node[];
    private startX: number;
    private startY: number;
    private dir: number;
    private width: number;
    private height: number;
    private gapX: number;
    private gapY: number;
    private row: number;
    private col: number;
    private itemWidth: number;
    private itemHeight: number;
    private cbHost: any;
    private itemSetter: (item: cc.Node, data: any, index: number) => void;
    private recycleCb: (item: cc.Node) => void;
    private selectCb: (data: any, index: number) => void;
    private selectSetter: (item: cc.Node, isSelect: boolean, index: number) => void;
    private scrollToEndCb: () => void;
    private autoScrolling: boolean;
    private items: ListItem[];
    private startIndex: number;
    private stopIndex: number;
    private mDatas: any[];
    private mSelectedIndex: number = -1;

    constructor(params: ListViewParams) {
        this.scrollview = params.scrollview;
        this.mask = params.mask;
        this.content = params.content;
        this.startY = params.start_y;
        this.itemTpl = params.item_tpl;
        this.itemTpl.active = false;
        this.itemWidth = this.itemTpl.width;
        this.itemHeight = this.itemTpl.height;
        this.cbHost = params.cb_host;
        this.itemSetter = params.itemSetter;
        this.recycleCb = params.recycle_cb;
        this.selectCb = params.select_cb;
        this.selectSetter = params.select_setter;
        this.scrollToEndCb = params.scroll_to_end_cb;
        this.nodePool = [];
        this.initData(params);

        if (this.dir === ListViewDir.Vertical) {
            const realWidth: number = (this.itemWidth + this.gapX) * this.col - this.gapX;
            if (realWidth > this.width) {
                console.log("real width > width, resize scrollview to realwidth,", this.width, "->", realWidth);
                this.width = realWidth;
            }
            this.content.width = this.width;
        } else {
            const realHeight: number = (this.itemHeight + this.gapY) * this.row - this.gapY;
            if (realHeight > this.height) {
                console.log("real height > height, resize scrollview to realheight,", this.height, "->", realHeight);
                this.height = realHeight;
            }
            this.content.height = this.height;
        }
        this.mask.setContentSize(this.width, this.height);
        this.mask.addComponent(cc.Mask);
        this.scrollview.node.setContentSize(this.width, this.height);
        this.scrollview.vertical = this.dir === ListViewDir.Vertical;
        this.scrollview.horizontal = this.dir === ListViewDir.Horizontal;
        this.scrollview.inertia = true;
        this.scrollview.node.on("scrolling", this.on_scrolling, this);
        this.scrollview.node.on("scroll-to-bottom", this.on_scroll_to_end, this);
        this.scrollview.node.on("scroll-to-right", this.on_scroll_to_end, this);
    }

    public select_item(index: number): void {
        if (index === this.mSelectedIndex) {
            return;
        }
        if (this.mSelectedIndex !== -1) {
            this.inner_select_item(this.mSelectedIndex, false);
        }
        this.inner_select_item(index, true);
    }

    public set_data(datas: any[]): void {
        this.clear_items();
        this.items = [];
        this.mDatas = datas;
        datas.forEach((data) => {
            const item: ListItem = this.pack_item(data);
            this.items.push(item);
        });
        this.layoutItems(0);
        this.resize_content();
        this.startIndex = -1;
        this.stopIndex = -1;
        if (this.dir === ListViewDir.Vertical) {
            this.content.y = 0;
        } else {
            this.content.x = 0;
        }
        if (this.items.length > 0) {
            this.on_scrolling();
        }
    }

    public insert_data(index: number, ...datas: any[]): void {
        if (datas.length === 0) {
            console.log("nothing to insert");

            return;
        }
        if (this.items == null) {
            this.items = [];
        }
        if (this.mDatas == null) {
            this.mDatas = [];
        }
        if (index < 0 || index > this.items.length) {
            console.log("invalid index", index);

            return;
        }
        const isAppend: boolean = index === this.items.length;
        const items: ListItem[] = [];
        datas.forEach((data) => {
            const item: ListItem = this.pack_item(data);
            items.push(item);
        });
        this.mDatas.splice(index, 0, ...datas);
        this.items.splice(index, 0, ...items);
        this.layoutItems(index);
        this.resize_content();
        this.startIndex = -1;
        this.stopIndex = -1;

        if (this.autoScrolling && isAppend) {
            this.scroll_to_end();
        }
        this.on_scrolling();
    }

    public remove_data(index: number, count: number = 1): void {
        if (this.items == null) {
            console.log("call set_data before call this method");

            return;
        }
        if (index < 0 || index >= this.items.length) {
            console.log("invalid index", index);

            return;
        }
        if (count < 1) {
            console.log("nothing to remove");

            return;
        }
        const oldLength: number = this.items.length;
        const delItems: ListItem[] = this.items.splice(index, count);
        this.mDatas.splice(index, count);
        //回收node
        delItems.forEach((item) => {
            this.recycle_item(item);
        });

        //重新排序index后面的
        if (index + count < oldLength) {
            this.layoutItems(index);
        }
        this.resize_content();
        if (this.items.length > 0) {
            this.startIndex = -1;
            this.stopIndex = -1;
            this.on_scrolling();
        }
    }

    public append_data(...datas: any[]): void {
        if (this.items == null) {
            this.items = [];
        }
        this.insert_data(this.items.length, ...datas);
    }

    public scroll_to(index: number): void {
        if (this.dir === ListViewDir.Vertical) {
            const minY = this.height - this.content.height;
            if (minY >= 0) {
                console.log("no need to scroll");

                return;
            }
            let [x, y] = LayoutUtil.verticalLayout(
                index, this.itemWidth, this.itemHeight, this.col, this.gapX, this.gapY, this.startX, this.startY);
            if (y < minY) {
                y = minY;
                console.log("content reach bottom");
            }
            if (y > 0) {
                y = 0;
                console.log("content reach top");
            }
            console.log("content reach bottom", x);
            x = 0;
            this.scrollview.setContentPosition(cc.v2(this.content.getPosition().x, -y));
            this.on_scrolling();
        } else {
            const maxX = this.content.width - this.width;
            if (maxX <= 0) {
                console.log("no need to scroll");

                return;
            }
            let [x, y] = LayoutUtil.horizontalLayout(
                index, this.itemWidth, this.itemHeight, this.row, this.gapX, this.gapY, this.startX, this.startY);
            if (x > maxX) {
                x = maxX;
                console.log("content reach right");
            }
            if (x < 0) {
                x = 0;
                console.log("content reach left");
            }
            console.log("content reach bottom", y);
            y = 0;
            this.scrollview.setContentPosition(cc.v2(-x, this.content.getPosition().y));
            this.on_scrolling();
        }
    }

    public scroll_to_end(): void {
        if (this.dir === ListViewDir.Vertical) {
            this.scrollview.scrollToBottom();
        } else {
            this.scrollview.scrollToRight();
        }
    }

    public refresh_item(index: number, data: any): void {
        if (this.items == null) {
            console.log("call set_data before call this method");

            return;
        }
        if (index < 0 || index >= this.items.length) {
            console.log("invalid index", index);

            return;
        }
        const item: ListItem = this.items[index];
        item.data = data;
        this.mDatas[index] = data;
        if (item.node != null) {
            if (this.recycleCb != null) {
                this.recycleCb.call(this.cbHost, item.node);
            }
            this.itemSetter.call(this.cbHost, item.node, item.data, index);
        }
    }

    public destroy(): void {
        this.clear_items();
        this.nodePool.forEach((node) => {
            node.destroy();
        });
        this.nodePool = null;
        this.items = null;
        this.mDatas = null;

        if (cc.isValid(this.scrollview.node)) {
            this.scrollview.node.off("scrolling", this.on_scrolling, this);
            this.scrollview.node.off("scroll-to-bottom", this.on_scroll_to_end, this);
            this.scrollview.node.off("scroll-to-right", this.on_scroll_to_end, this);
        }
    }

    private initData(params: ListViewParams): void {
        if (this.isNull(params.start_x)) {
            params.start_x = 0;
        }
        this.startX = params.start_x;
        if (this.isNull(params.start_y)) {
            params.start_y = 0;
        }
        this.startY = params.start_y;
        if (this.isNull(params.direction)) {
            params.direction = ListViewDir.Vertical;
        }
        this.dir = params.direction;
        if (this.isNull(params.width)) {
            params.width = this.mask.width;
        }
        this.width = params.width;
        if (this.isNull(params.height)) {
            params.height = this.mask.height;
        }
        this.height = params.height;
        if (this.isNull(params.gap_x)) {
            params.gap_x = 0;
        }
        this.gapX = params.gap_x;
        if (this.isNull(params.gap_y)) {
            params.gap_y = 0;
        }
        this.gapY = params.gap_y;
        if (this.isNull(params.row)) {
            params.row = 1;
        }
        this.row = params.row;
        if (this.isNull(params.column)) {
            params.column = 1;
        }
        this.col = params.column;

        if (this.isNull(params.auto_scrolling)) {
            params.auto_scrolling = false;
        }
        this.autoScrolling = params.auto_scrolling;
    }
    private isNull(o: Object): boolean {
        if (o === undefined || o === null) {
            return true;
        }

        return false;
    }
    private on_scroll_to_end(): void {
        if (!this.isNull(this.scrollToEndCb)) {
            this.scrollToEndCb.call(this.cbHost);
        }
    }

    private on_scrolling(): void {
        if (this.isNull(this.items) || this.isNull(this.items.length)) {
            return;
        }
        if (this.dir === ListViewDir.Vertical) {
            let posy: number = this.content.y;
            // console.log("onscrolling, content posy=", posy);
            if (posy < 0) {
                posy = 0;
            }
            if (posy > this.content.height - this.height) {
                posy = this.content.height - this.height;
            }
            let start: number = 0;
            let stop: number = this.items.length - 1;
            const viewportStart: number = -posy;
            const viewportStop: number = viewportStart - this.height;
            while (this.items[start].y - this.itemHeight > viewportStart) {
                start++;
            }
            while (this.items[stop].y < viewportStop) {
                stop--;
            }
            if (start !== this.startIndex && stop !== this.stopIndex) {
                this.startIndex = start;
                this.stopIndex = stop;
                // console.log("render_from:", start, stop);
                this.render_items();
            }
        } else {
            let posx: number = this.content.x;
            // console.log("onscrolling, content posx=", posx);
            if (posx > 0) {
                posx = 0;
            }
            if (posx < this.width - this.content.width) {
                posx = this.width - this.content.width;
            }
            let start: number = 0;
            let stop: number = this.items.length - 1;
            const viewportStart: number = -posx;
            const viewportStop: number = viewportStart + this.width;
            while (this.items[start].x + this.itemWidth < viewportStart) {
                start++;
            }
            while (this.items[stop].x > viewportStop) {
                stop--;
            }
            if (start !== this.startIndex && stop !== this.stopIndex) {
                this.startIndex = start;
                this.stopIndex = stop;
                // console.log("render_from:", start, stop);
                this.render_items();
            }
        }
    }

    private inner_select_item(index: number, isSelect: boolean): void {
        const item: ListItem = this.items[index];
        if (this.isNull(item)) {
            console.log("inner_select_item index is out of range{", 0, this.items.length - 1, "}", index);

            return;
        }
        item.is_select = isSelect;
        if (item.node != null && this.selectSetter != null) {
            this.selectSetter.call(this.cbHost, item.node, isSelect, index);
        }
        if (isSelect) {
            this.mSelectedIndex = index;
            if (this.selectCb != null) {
                this.selectCb.call(this.cbHost, item.data, index);
            }
        }
    }

    private spawn_node(index: number): cc.Node {
        let node: cc.Node = this.nodePool.pop();
        if (this.isNull(node)) {
            node = cc.instantiate(this.itemTpl);
            node.active = true;
            // console.log("spawn_node", index);
        }
        node.setParent(this.content);

        return node;
    }

    private recycle_item(item: ListItem): void {
        if (item.node != null && cc.isValid(item.node)) {
            if (this.recycleCb != null) {
                this.recycleCb.call(this.cbHost, item.node);
            }
            item.node.removeFromParent();
            this.nodePool.push(item.node);
            item.node = null;
        }
    }

    private clear_items(): void {
        if (this.items != null) {
            this.items.forEach((item) => {
                this.recycle_item(item);
            });
        }
    }

    private render_items(): void {
        let item: ListItem;
        for (let i: number = 0; i < this.startIndex; i++) {
            item = this.items[i];
            if (item.node != null) {
                // console.log("recycle_item", i);
                this.recycle_item(item);
            }
        }
        for (let i: number = this.items.length - 1; i > this.stopIndex; i--) {
            item = this.items[i];
            if (item.node != null) {
                // console.log("recycle_item", i);
                this.recycle_item(item);
            }
        }
        for (let i: number = this.startIndex; i <= this.stopIndex; i++) {
            item = this.items[i];
            if (this.isNull(item.node)) {
                // console.log("render_item", i);
                item.node = this.spawn_node(i);
                this.itemSetter.call(this.cbHost, item.node, item.data, i);
                if (this.selectSetter != null) {
                    this.selectSetter.call(this.cbHost, item.node, item.is_select, i);
                }
            }
            // item.x = item.x + this.start_x;
            item.node.setPosition(item.x, item.y);
        }
    }

    private pack_item(data: any): ListItem {
        return { x: 0, y: 0, data: data, node: null, is_select: false };
    }

    private layoutItems(start: number): void {
        // console.log("layout_items, start=", start);
        // tslint:disable-next-line:one-variable-per-declaration
        for (let index: number = start, stop: number = this.items.length; index < stop; index++) {
            const item: ListItem = this.items[index];
            if (this.dir === ListViewDir.Vertical) {
                [item.x, item.y] = LayoutUtil.verticalLayout(
                    index, this.itemWidth, this.itemHeight, this.col, this.gapX, this.gapY, this.startX, this.startY);
            } else {
                [item.x, item.y] = LayoutUtil.horizontalLayout(
                    index, this.itemWidth, this.itemHeight, this.row, this.gapX, this.gapY, this.startX, this.startY);
            }
        }
    }

    private resize_content(): void {
        if (this.items.length <= 0) {
            this.content.width = 0;
            this.content.height = 0;

            return;
        }
        const lastItem: ListItem = this.items[this.items.length - 1];
        if (this.dir === ListViewDir.Vertical) {
            this.content.height = Math.max(this.height, this.itemHeight - lastItem.y);
        } else {
            this.content.width = Math.max(this.width, lastItem.x + this.itemWidth);
        }
    }
}
