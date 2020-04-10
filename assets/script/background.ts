import Constant from "./constant";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Background extends cc.Component {

    @property([cc.Node])
    groundNode = [];

    @property(cc.Sprite)
    groundImg: cc.Sprite = null;

    // LIFE-CYCLE CALLBACKS:
    size: cc.Size;
    width: number;

    onLoad () {
        // 获取屏幕尺寸
        this.size = cc.winSize;
        this.width = this.groundImg.spriteFrame.getRect().width;
        // 移动地板
        this.schedule(this.onGroundMove, Constant.GROUND_MOVE_INTERVAL);
    }

    // 地板移动
    onGroundMove() {
        this.groundNode[0].x += Constant.GROUND_VX;
        // 判断位置是否超出范围, 超出范围更新位置
        if (this.groundNode[0].x < - this.size.width/4 - 20) {
            this.groundNode[0].x = this.size.width/4 + 20;
        }
    }

    start () {

    }

    // update (dt) {}
}
