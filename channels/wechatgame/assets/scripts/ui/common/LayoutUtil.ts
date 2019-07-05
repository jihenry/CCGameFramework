/**
 * item及父节点锚点都为(0,1)
 */
export namespace LayoutUtil {
    // tslint:disable:max-line-length
    export const verticalLayout = (index: number, itemWidth: number, itemHeight: number, column: number = 1, gapX: number = 0, gapY: number = 0, sx: number, sy: number): [number, number] => {
        const x: number = (index % column) * (itemWidth + gapX) + sx;
        const y: number = -Math.floor(index / column) * (itemHeight + gapY) + sy;

        return [x, y];
    };

    export const horizontalLayout = (index: number, itemWidth: number, itemHeight: number, row: number = 1, gapX: number = 0, gapY: number = 0, sx: number, sy: number): [number, number] => {
        const x: number = Math.floor(index / row) * (itemWidth + gapX) + sx;
        const y: number = -(index % row) * (itemHeight + gapY) + sy;

        return [x, y];
    };
}
