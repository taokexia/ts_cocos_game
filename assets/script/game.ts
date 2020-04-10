
import Constant from './constant';
const {ccclass, property} = cc._decorator;
import Bird from './bird';
import Pipe from './pipe';
import MyStorage from './storage';


@ccclass
export default class NewClass extends cc.Component {

    // 菜单
    @property(cc.Node)
    menu: cc.Node = null;

    // 小鸟组件
    @property(Bird)
    bird: Bird = null;

    // 地板组件
    @property(cc.Node)
    ground: cc.Node = null; 

    // 管道节点
    @property(cc.Node)
    pipe: cc.Node = null;

    // 管道预制
    @property([cc.Prefab])
    pipePrefabs = [];

    // 管道纵向最大偏移值
    @property(cc.Integer)
    pipeMaxOffsetY =  150;

    // 管道生成时，屏幕外横向偏移位置
    @property(cc.Integer)
    pipeSpawnOffsetX = 30;

    // 上下管道间最小间隙
    @property(cc.Integer)
    pipeMinGap = 80;
    
    // 上下管道间最大间隙
    @property(cc.Integer)
    pipeMaxGap =  150;

    // 管道生成时间间隔
    @property(cc.Float)
    pipeSpawnInterval =  4.5;

    // 重新刷新时间
    @property(cc.Integer)
    gameReflashTime = 5;

    // 形变动画播放间隔
    @property(cc.Float)
    scoreScaleDuration = 0.2;

    // 游戏结束的文本
    @property(cc.Label)
    gameOverLabel = null;

    // 分数记录文本
    @property(cc.Label)
    currScoreLabel = null;

    // 最高分记录
    @property(cc.Label)
    heightScoreLabel = null;


    size: cc.Size;
    groundBox: cc.Rect;
    groundTop: number;
    pipes: Array<cc.Node>;
    isGameOver: boolean;
    curScore: number;
    // 开始游戏
    startGame() {
        this.menu.active = false;
        this.bird.node.active = true;

        // 小鸟开始运动
        this.bird.onStartDrop();
        this.isGameOver = false;
        this.curScore = 0;

        // 启动生成管道定时器
        this.schedule(this.spawnPipes, this.pipeSpawnInterval);
        // 启动游戏逻辑更新定时器
        this.schedule(this.gameUpdate, Constant.GROUND_MOVE_INTERVAL);
    }

    // 生成管道
    spawnPipes() {
        let pipeUp: cc.Node = cc.instantiate(this.pipePrefabs[Constant.PIPE_UP]);
        let pipeUpComponent: Pipe = pipeUp.getComponent("pipe");
        pipeUpComponent.init(Constant.PIPE_UP);

        // 获取管道的高度（上端与上端的相同）
        let pipeHeight = pipeUp.getComponent('cc.Sprite').spriteFrame.getRect().height;
        // 设置上端管道的横向起始位置（屏幕右端另加一定偏移）
        pipeUp.x = this.size.width / 2 + this.pipeSpawnOffsetX;

        // 设置上端管道的纵向起始位置（随机取偏移量）
        pipeUp.y = Math.floor(Math.random() * this.pipeMaxOffsetY) + pipeHeight;

        // 下端生成逻辑基本与上端相同
        var pipeDown = cc.instantiate(this.pipePrefabs[Constant.PIPE_DOWN]);
        let pipeDownComponent: Pipe = pipeDown.getComponent("pipe");
        pipeDownComponent.init(Constant.PIPE_DOWN);
        pipeDown.x = this.size.width / 2 + this.pipeSpawnOffsetX;

        // 随机生成上端与下端管道之间的间隙值（pipeMinGap与pipeMaxGap之间）
        var pipeGap = Math.floor(Math.random() * (this.pipeMaxGap - this.pipeMinGap)) + this.pipeMinGap;
        pipeDown.y = pipeUp.y - pipeGap - pipeHeight * 2;

        // 添加管道到pipes节点上
        this.pipe.addChild(pipeUp);
        this.pipe.addChild(pipeDown);
        // 添加管道到管道数组中
        this.pipes.push(pipeUp);
        this.pipes.push(pipeDown);
    }

    // 游戏更新逻辑
    // 1.判断是否碰撞到管子
    // 2.判断是否落地
    gameUpdate() {
        // 1.移动管道并判断是否碰撞
        for ( var i = 0; i < this.pipes.length; i ++ ) {
            // 获取当前管道对象节点
            let curPipeNode = this.pipes[i];
            // 对管道进行移动操作
            curPipeNode.x += Constant.GROUND_VX;
            
            // 获取小鸟的包围盒
            let birdBox = this.bird.node.getBoundingBox();
            // 获取当前管道的包围盒
            let pipeBox = curPipeNode.getBoundingBox();
            // var birdRect = new cc.Rect(birdBox.x - birdBox.width / 2, birdBox.y - birdBox.height / 2,
            //     birdBox.width, birdBox.height);
            // var pipeRect = new cc.Rect(pipeBox.x - pipeBox.width / 2, pipeBox.y - pipeBox.height / 2,
            //     pipeBox.width, pipeBox.height);
            // 根据两个矩形范围判断是否相交
            if (cc.Intersection.rectRect(birdBox, pipeBox)) {
                this.onGameOver();
                return;
            }
            
            // 获取当前管道对象
            let curPipe: Pipe = curPipeNode.getComponent('pipe');
            // 判断小鸟是否顺利通过管道，是则加分
            if ( curPipeNode.x < this.bird.node.x && curPipe.isPassed === false 
                && curPipe.type === Constant.PIPE_UP) {
                curPipe.isPassed = true;
                // 通过管道，添加分数
                this.addScore();
            }
            
            // 超出屏幕范围的管道，从数组中移除，并从节点上删除
            if ( curPipeNode.x < -(this.size.width/2 + curPipeNode.width)) {
                this.pipes.splice(i, 1);
                this.pipe.removeChild(curPipeNode, true);
            } 
        }


        // 2.判断是否落地
        if (this.bird.node.y + this.bird.node.height/2 + this.bird.velocity < this.groundTop) {
            console.log(this.bird.node.y, this.groundTop)
            this.onGameOver();
        }
    }

    // 增加分数
    addScore() {
        // 加分
        this.curScore ++;
        // 显示当前分数
        this.currScoreLabel.string = "" + this.curScore;
        var action1 = cc.scaleTo(this.scoreScaleDuration, 1.1, 0.6);
        var action2 = cc.scaleTo(this.scoreScaleDuration, 0.8, 1.2);
        var action3 = cc.scaleTo(this.scoreScaleDuration, 1, 1);
        // 播放形变动画
        this.currScoreLabel.node.runAction(cc.sequence(action1, action2, action3));
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 初始化界面
        this.bird.node.active = false;
        // 初始化管道数组
        this.pipes = [];
        // 获取屏幕尺寸
        this.size = cc.winSize;
        this.groundBox = this.ground.getBoundingBox();
        // 获取地板顶部位置
        this.groundTop = -(this.size.height/2 - this.ground.height);
        // 开始游戏界面，如有历史最高分则显示该成绩
        if ( MyStorage.getHighScore() > 0 ) {
            this.heightScoreLabel.string = Constant.HIGHSCORE_TXT + MyStorage.getHighScore();
        }

        // 添加事件
        this.setControl();
    }

    setControl() {
        // 点击小鸟上飞
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegin, this);
    }

    onTouchBegin() {
        this.bird.onJump();
    }

    // 游戏结果
    onGameOver()
    {
        this.isGameOver = true;
        // 死亡时，显示“Game Over”
        this.gameOverLabel.string = Constant.GAMEOVER_TXT;
        // 游戏失败，如超过最高分则成绩
        if ( this.curScore > MyStorage.getHighScore() ) {
            MyStorage.setHighScore(this.curScore);
        }
        // 关闭所有定时器
        this.bird.unscheduleAllCallbacks();
        this.unscheduleAllCallbacks();
        // 一定时间后，重新刷新游戏到开始状态
        this.schedule(function() {
            cc.director.loadScene('game');
        }, this.gameReflashTime);
    }

    start () {

    }

    // update (dt) {}
}
