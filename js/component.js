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
                    <input type="checkbox" v-model="used" @change="$emit('series-select-change')" />{{displayName}}
                    <select v-model="type"  @change="$emit('series-select-change')">
                        <option value="line">线</option>
                        <option value="bar">柱</option>
                    </select>
                </div>`,
    props: {
        name: String,
        displayName: String,
        index: Number,
        checked: Boolean,
        used: Boolean,
        type: String
    },
    data() {
        return {}
    }
})

Vue.component('SeriesSelectList', {
    template: ` <div>
                    <label>X轴数据：</label>
                    <select ref="xDimSelect" :value="xDim" @change="seriesSelectChange">
                        <option v-for="(item, index) in dimensions" :value="item.name">{{item.displayName}}</option>
                    </select>
                    <br />
                    <label>Y轴数据：</label>
                    <br />  
                    <div v-for="(item, index) in dimensions" :key="item.name" >
                        <series-select 
                        @series-select-change="seriesSelectChange" 
                        :display-name="item.displayName" 
                        :name="item.name"
                        :index="index" 
                        :used="useds[item.displayName]" 
                        :type="types[item.displayName]"/>
                    </div>
                </div>`,
    props: ['dimensions', 'series', 'xDim'],
    data() {
        return {}
    },
    computed: {
        useds: function () {
            let result = {};
            for (let i = 0; i < this.series.length; i++) {
                let s = this.series[i];
                result[s.name] = true;
            }
            return result;
        },
        types: function () {
            let result = {};
            for (let i = 0; i < this.dimensions.length; i++) {
                let d = this.dimensions[i];
                result[d.displayName] = "line";
            }
            for (let i = 0; i < this.series.length; i++) {
                let s = this.series[i];
                result[s.name] = s.type;
            }
            return result;
        }
    },
    methods: {
        seriesSelectChange: function () {
            let series = [];
            let xDim = this.$refs.xDimSelect.value;
            this.$children.forEach((seriesSelect, index) => {
                if (seriesSelect.used) {
                    series.push({
                        type: seriesSelect.type,
                        name: seriesSelect.displayName,
                        encode: {
                            y: seriesSelect.name,
                            x: xDim,
                            tooltip: [0, 1, 2, 3]
                        }
                    });
                }
            });
            this.$emit("series-change", series);
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
    props: ["legend", "dimensions"],
    data: function () {
        return {};
    },
    computed: {
        legendData: {
            get: function () {
                let r = {};
                for (let j = 0; j < this.dimensions.length; j++) {
                    let dim = this.dimensions[j];
                    for (let i = 0; i < this.legend.data.length; i++) {
                        let ld = this.legend.data[i];
                        if (ld.name === dim.displayName) {
                            r[dim.name] = {
                                checked: true,
                                color: ld.textStyle === undefined ? undefined : ld.textStyle.color
                            };
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
            this.$emit("legend-change", result);
        }
    }
})