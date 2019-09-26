//打亂整個Array
Array.prototype.shuffle = function (array) {
    for (let i = this.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [this[i], this[j]] = [this[j], this[i]];  //兩兩交換
    }
};
//告訴你什麼產生什麼 產生數字陣列
const getTiles = function (total) {   
    let tiles = [];
    while (tiles.length < total) {   //判斷產生數字9:1~9
        tiles.push(tiles.length + 1);
    }
    return tiles;
};

const checkResolvable = function (ary, col) {
    let count = 0;
    let space = 0;

    ary = ary.filter((item, index) => {
        if (item === ary.length) space = (index % col) + 1;
        return item != ary.length;
    });
    //比我大的就+1
    ary.forEach((item, index, ary) => {
        let j = index + 1;
        while (j < ary.length) {
            if (item > ary[j]) count++;
            j++;
        }
    });
    //col%2  true=>奇數  逆序位數和加起來為0
    return col % 2 ? count % 2 === 0 : (count % 2) + (space % 2) === 0;
};
//一維陣列
const getGrids = function (col) {
    let tiles = getTiles(col * col);  //產一維陣列
    let resolvable = false;
    while (!resolvable) {
        tiles.shuffle();
        resolvable = checkResolvable(tiles, col);
    }
    let grids = [];
    while (grids.length < col) {
        let row = [];
        while (row.length < col) {
            row.push({
                label: tiles[grids.length * col + row.length]
            });
        }
        grids.push(row);
    }
    return grids;
};
//顯示資料
Vue.component("Tile", {
    props: ["tile", "col", "position"],
    template: `
    <div
        class="tile"
        :class="{space,ok}"
        @click="clickHandler"
    >
        {{ !space ? this.tile.label : "" }}
        </div>`,
    computed: {
        space() {
            return this.tile.label === this.col * this.col;
        },
        ok() {  //座標位置換算數字
            return this.tile.label === this.position.x * this.col + this.position.y + 1;
        }
    },
    methods: {
        clickHandler() {
            if (!this.space) {
                this.$emit("move");
            }
        }
    }
});
new Vue({
    el: "#app",
    data: {
        col: 3,  //三行
        move: 0,
        grids:[]
    },
    computed: {
        total() {
            return this.col * this.col;
        },
        win() {
            if (this.grids.length != this.col) return false;  //先跳過一開始的檢查
            for (let i = 0; i < this.col; i++){
                for (let j = 0; j < this.col; j++){
                    if (this.grids[i][j].label != i * this.col + j + 1) {
                        return false;
                    }
                }
            }
            return true;
        }
    },
    methods: {
        init() {
            this.grids = getGrids(this.col);
            this.move = 0;
        },
        moveHandler(x, y) {
            // console.log(x,y)
            let target = this.grids[x][y];
            let switchTarget = null;   //space
            if (x - 1 >= 0 && this.grids[x - 1][y].label === this.total) {
                switchTarget = this.grids[x - 1][y];
            } else if (x + 1 < this.col && this.grids[x + 1][y].label === this.total) {
                switchTarget = this.grids[x + 1][y];
            } else if (y - 1 >= 0 && this.grids[x][y - 1].label === this.total) {
                switchTarget = this.grids[x][y - 1];
            } else if (y + 1 < this.col && this.grids[x][y + 1].label === this.total) {
                switchTarget = this.grids[x][y + 1];
            }
            if (switchTarget) {   //如果有交換對象的話
                switchTarget.label = target.label;
                target.label = this.total;
                this.move++;
            }
        }
    },
    watch: {
        col: {
            immediate: true,
            handler() {
            this.init();                
            }
        }
    }
});