const {ccclass, property} = cc._decorator;

@ccclass
export default class Bird extends cc.Component {
    // 小鸟重力
    @property(cc.Float)
    gravity = 0.5;

    // 小鸟弹跳值
    @property(cc.Float)
    birdJump = 6.6;

    // 弹跳音效
    @property({
        type: cc.AudioClip
    })
    jumpDownAudio = null;

    velocity: number;

    onStartDrop() {
        // 开始往下掉
        this.schedule(this.onDrop, 0.01);
    }

    onDrop() {
        this.node.y += this.velocity;
        this.velocity -= this.gravity; // 更新速度
    }

    // 往上跳
    onJump() {
        // 弹跳时，重设向上的速度
        this.velocity = this.birdJump;
        cc.audioEngine.playEffect(this.jumpDownAudio, false);
    }
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 播放动画
        this.getComponent(cc.Animation).play();
        this.velocity = 0;
    }

    start () {

    }

    // update (dt) {}
}
