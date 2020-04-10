const {ccclass, property} = cc._decorator;

@ccclass
export default class Pipe extends cc.Component {

    // 小鸟通过管道与否的标志位
    @property(cc.Boolean)
    isPassed = false;

    type: number;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }
    // 判断管道的类型,是向上还是向下
    init(type: number) {
        this.type = type;
    }

    // update (dt) {}
}
