let MyStorage = {
    getHighScore: function() {
        var score = cc.sys.localStorage.getItem('HighScore') || 0;
        return parseInt(score);
    },
    
    setHighScore: function(score) {
        cc.sys.localStorage.setItem('HighScore', score);
    }
};

export default MyStorage;