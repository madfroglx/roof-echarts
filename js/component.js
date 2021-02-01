Vue.component('XAxis', {
    template: `
        <div>
            <label>显示：</label>
            <input type="checkbox" v-model="new$$show" @change="configChange">
            <br />
            <label>位置</label>
            <select  v-model="new$$nameLocation" @change="configChange">
                <option value="start">起始</option>
                <option value="middle">中间</option>
                <option value="end">尾部</option>
            </select>
            <br /> 
            <label>名称:</label>
            <input type="text" v-model="new$$name" @change="configChange">
            <label>类型：</label>
            <select  v-model="new$$type" @change="configChange">
                <option value="category">类目</option>
                <option value="value">数值</option>
                <option value="time">时间</option>
                <option value="log">对数</option>
            </select>
        </div>`,
    props: ["name", "type", "show", "nameLocation"],
    data() {
        let r = {};
        for (let a in this._props) {
            r["new$$" + a] = this[a];
        }
        return r;
    },
    methods: {
        configChange: function (e) {
            let r = {};
            for (let a in this._props) {
                r[a] = this["new$$" + a];
            }
            this.$emit("config-change", "xAxis", r);
        }
    }
})

Vue.component('SeriesSelect', {
    template: `<div>
                    <input type="checkbox" name="used" v-model="new$$used" @change="configChange" />{{name}}
                    <label>| 类型</label>
                    <select v-model="new$$type" name="type" @change="configChange">
                        <option value="line">线</option>
                        <option value="bar">柱</option>
                    </select>
                    <label>| X轴：</label>
                    <select v-model="new$$encode.x" @change="configChange">
                        <option v-for="(item, index) in dimensions" :value="item.name">{{item.displayName}}</option>
                    </select>
                    <br />
                    <label>| 颜色</label>
                    <input type="text" v-model="new$$itemStyle.color" name="itemStyle.color" @change="configChange"/>
                </div>`,
    props: {
        "used": Boolean,
        "name": String,
        "type": String,
        "itemStyle": {
            type: Object, default: function () {
                return {};
            }
        },
        "encode": {
            type: Object, default: function () {
                return {};
            }
        },
        "dimensions": {type: Array, default: []}
    },
    data() {
        let r = {};
        for (let prop in this._props) {
            if (prop === "dimensions") continue;
            r["new$$" + prop] = JSON.parse(JSON.stringify(this[prop]));
        }
        return r;
    },
    methods: {
        configChange: function (e) {
            this.$emit("config-change", "series", this.getData());
        },
        getData: function () {
            let r = {};
            for (let prop in this._props) {
                r[prop] = this["new$$" + prop];
            }
            return r;
        }
    }
})

Vue.component('SeriesSelectList', {
    template: ` <div>
                    <label>Y轴数据：</label>
                    <br />  
                    <div v-for="(item, index) in new$$series" :key="item.name" >
                        <series-select :dimensions="dimensions" v-bind="item" @config-change="seriesSelectChange"/>
                    </div>
                </div>`,
    props: ['dimensions', 'series'],
    data() {
        let r = {};
        for (let prop in this._props) {
            r["new$$" + prop] = JSON.parse(JSON.stringify(this[prop]));
            if (prop === 'series') {
                for (const s of r["new$$series"]) {
                    s["used"] = true;
                }
                for (let i = 0; i < this.dimensions.length; i++) {
                    let dim = this.dimensions[i];
                    if (!this.exists(dim, this.series)) {
                        r["new$$series"].push({
                            type: "line",
                            name: dim.displayName,
                            encode: {
                                y: dim.name
                            },
                            itemStyle: {}
                        });
                    }
                }
            }
        }
        return r;
    },
    methods: {
        seriesSelectChange: function () {
            let r = [];
            this.$children.forEach((value, index) => {
                let d = value.getData();
                if (d.used === true) {
                    r.push(d);
                }
            });
            this.$emit("config-change", "series", r)
        },
        exists: function (dim, series) {
            for (let j = 0; j < this.series.length; j++) {
                if (dim.displayName === this.series[j].name) {
                    return true;
                }
            }
            return false;
        }
    }
})

Vue.component("LegendComponent", {
    template: ` 
        <div>
            <label>可见：</label><input type="checkbox" v-model="legend.show" @change="configChange" checked="checked"/>
            <br/>
            <label>X：</label><input type="text" v-model="legend.left" @change="configChange"/>
            <label>Y：</label><input type="text" v-model="legend.top" @change="configChange"/>
            <div v-for="(d,i) in dimensions">
                <input type="checkbox" ref="selectedLegends" :name="d.name" :displayName="d.displayName" 
                                       :checked ="legendData[d.name].checked" @change="configChange" />
                <label>{{d.displayName}}</label> 
                颜色：<input type="text" ref="colors" :name="d.name" :value="legendData[d.name].color" @change="configChange" />
            </div>
        </div>`,
    props: {
        "legend": {
            type: Object,
            default: function () {
                return {
                    data: []
                };
            }

        }, "dimensions": {type: Array}
    },
    data: function () {
        return {};
    },
    computed: {
        legendData: {
            get: function () {
                let r = {};
                for (let j = 0; j < this.dimensions.length; j++) {
                    let dim = this.dimensions[j];
                    if (this.legend && this.legend.data) {
                        for (let i = 0; i < this.legend.data.length; i++) {
                            let ld = this.legend.data[i];
                            if (ld.name === dim.displayName) {
                                r[dim.name] = {
                                    checked: true,
                                    color: ld.textStyle === undefined ? undefined : ld.textStyle.color
                                };
                            }
                        }
                    }
                    if (r[dim.name] === undefined) {
                        r[dim.name] = {checked: false};
                    }
                }
                return r;
            }
        }
    },
    methods: {
        configChange: function (e) {
            let result = this.legend;
            result.data = [];
            this.$refs.selectedLegends.forEach((selectedLegend, index) => {
                let displayName = selectedLegend.getAttribute("displayName");
                let checked = selectedLegend.checked;
                if (checked) {
                    result.data.push({name: displayName});
                }
                console.info(name, checked);
            });
            this.$emit("legend-change", "legend", result);
        }
    }
})