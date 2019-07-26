<template>
    <div  id="wrapper" >

        <div style="-webkit-app-region: drag" class="titleBar" ><span @click="minimize()" style="-webkit-app-region: no-drag" class="closebt"></span><span class="titleName">hostadmin</span></div>
        <main>
            <div class="left-side">
                <system-information :domainMapList="domainMapList" :groupArr="groupArr" :domainMap="domainMap"></system-information>
            </div>
            <div class="right-side">
                <div class="doc">
                    <div class="head-left title">host edit</div>
                    <div class="head-right"><button class="tips" @click="tips()">提示</button></div>
                    <textarea wrap="off" id="hostTextarea" v-model="hostText" :placeholder='textareaPlaceholder'></textarea>
                    <br><button @click="removeAll()">重置</button>
                    <button @click="save()">保存</button>
                </div>
            </div>
        </main>
    </div>
</template>
<script>
import SystemInformation from './LandingPage/SystemInformation'
const { remote, ipcRenderer } = window.require('electron')

let vm = {
    name: 'landing-page',
    components: { SystemInformation },
    data() {
        return {
            textareaPlaceholder: "#==== groupName(组名)\n127.0.0.1 www.baidu.com\n127.0.0.1 www.sina.com\n#====\n\n\n★：选中\n✩：部分选中",
            hostText: '',
            groupArr: [],
            hostModelArr: [],
            domainMapList: [],
            domainMap: new Map()
        }
    },
    created() {
        this.refresh()
        ipcRenderer.on('hostsChange', (event, message) => {
            this.refresh()
        })
    },
    methods: {
        refresh() {
            this.hostText = remote.app.readHost()
            buildHostModel(this)
        },
        save() {
            remote.app.saveHost(this.hostText)
        },
        tips() {
            alert(this.textareaPlaceholder);
        },
        minimize() {
            remote.app.myMinimize()
        },
        removeAll() {
            let fileContent = remote.app.readHost()
            let arr = fileContent.split(/[\n]/)
            for (let i = 0; i < this.hostModelArr.length; i++) {
                let index = this.hostModelArr[i].index
                arr[index] = cancelLine(arr[index].trim())
            }
            remote.app.saveHost(arr.join('\n'))
        }
    }
}

export default vm

function buildHostModel(vm) {
    let hostText = vm.hostText
    let groupArr = vm.groupArr
    let hostModelArr = vm.hostModelArr
    let domainMapList = vm.domainMapList
    let domainMap = vm.domainMap
    groupArr.splice(0, groupArr.length)
    hostModelArr.splice(0, hostModelArr.length)
    domainMapList.splice(0, domainMapList.length)
    domainMap.clear()
    let arr = hostText.split(/[\n]/)
    for (var i = 0; i < arr.length; i++) {
        var item = arr[i].trim()
        if (item.startsWith('#====')) {
            buildHostGroup(item, groupArr, i)
        } else if (item.startsWith('#')) {
            var subsItem = item.substring(1)
            buildhostModel(subsItem, hostModelArr, i, false)
        } else {
            buildhostModel(item, hostModelArr, i, true)
        }
    }

    for (let i = 0; i < hostModelArr.length; i++) {
        addToGroup(hostModelArr[i], groupArr)
        addToDomainMap(hostModelArr[i], domainMap)
    }
    buildGroupArrView(groupArr)
    for (let [key, value] of domainMap) {
        let domainModel = {}
        domainModel['domain'] = key
        domainModel['view'] = true
        domainModel['itemList'] = value
        domainMapList.push(domainModel)
    }
}

function buildGroupArrView(groupArr) {
    if (groupArr.length === 0) {
        return
    }
    for (let i = 0; i < groupArr.length; i++) {
        let groupItem = groupArr[i]
        let hostList = groupItem['hostList']
        groupItem['view'] = true
        groupItem['halfView'] = false
        for (let i = 0; i < hostList.length; i++) {
            let host = hostList[i]
            let hostView = host['view']
            if (!hostView) {
                groupItem['view'] = false
                //break
            } else {
                groupItem['halfView'] = true
            }
        }
    }
}

function addToDomainMap(item, domainMap) {
    let itemDomainList = item['domainList']
    for (let i = 0; i < itemDomainList.length; i++) {
        let itemList = domainMap.get(itemDomainList[i])
        if (!itemList) {
            itemList = []
            domainMap.set(itemDomainList[i], itemList)
        }
        itemList.push(item)
    }
}

function addToGroup(item, groupArr) {
    if (groupArr.length === 0) {
        return
    }
    let hostIndex = item['index']
    for (let i = 0; i < groupArr.length; i++) {
        let groupItem = groupArr[i]
        let start = groupItem['start']
        let end = groupItem['end']
        if (hostIndex > start && hostIndex < end) {
            let hostList = groupItem['hostList']
            hostList.push(item)
        }
    }
}

function buildHostGroup(item, groupArr, index) {
    let groupName = item.substring(6).trim()
    if (groupName === '') { // 组尾
        let groupLast = groupArr[groupArr.length - 1]
        groupLast['end'] = index
        // console.log(groupLast)
    } else { // 新组
        let groupNew = {}
        groupNew['name'] = groupName
        groupNew['start'] = index
        groupNew['hostList'] = []
        groupArr.push(groupNew)
    }
}

function buildhostModel(subsItem, hostModelArr, index, view) {
    let ipArr = getIp(subsItem)
    if (ipArr && ipArr.length > 0) {
        let ip = ipArr[0]
        if (subsItem.startsWith(ip)) {
            let end = subsItem.indexOf('#')
            if (end < 0) {
                end = subsItem.length
            }
            let domain = subsItem.substring(ip.length, end).trim()
            if (domain === '') {
                return
            }
            let hostModelNew = {}
            hostModelNew['ip'] = ip
            hostModelNew['index'] = index
            hostModelNew['domainList'] = domain.split(/\s+/)
            hostModelNew['view'] = view
            hostModelArr.push(hostModelNew)
        }
    }
}

function getIp(str) {
    return str.match(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g)
}

function cancelLine(line) {
    if (!line.startsWith('#')) {
        line = '#' + line
    }
    return line
}
</script>
<style>
@import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: 'Source Sans Pro', sans-serif;
}

.right-side {
    margin-left: 10px;
}

#wrapper {
    background:
        radial-gradient(ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%);
    height: 100vh;
    padding: 22px 60px;
    width: 100vw;
    /*margin-top: -30px;
    margin-left: -50px;*/
}

#hostTextarea {
    height: 610px;
    width: 300px;
}

#logo {
    height: auto;
    margin-bottom: 20px;
    width: 420px;
}

main {
    display: flex;
    justify-content: space-between;
}

main>div {
    flex-basis: 50%;
}

.left-side {
    display: flex;
    flex-direction: column;
}

.welcome {
    color: #555;
    font-size: 23px;
    margin-bottom: 10px;
}

.title {
    color: #2c3e50;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 6px;
}

.title.alt {
    font-size: 18px;
    margin-bottom: 10px;
}

.doc p {
    color: black;
    margin-bottom: 10px;
}

.doc button {
    font-size: .8em;
    cursor: pointer;
    outline: none;
    padding: 0.75em 2em;
    border-radius: 2em;
    display: inline-block;
    color: #fff;
    background-color: #4fc08d;
    transition: all 0.15s ease;
    box-sizing: border-box;
    border: 1px solid #4fc08d;
}

.doc button.tips {
    padding: 0.2em 0.6em;
    background-color: #4fc08d;
}

.doc button.alt {
    color: #42b983;
    background-color: transparent;
}

.head-left {
    float: left;
}

.head-right {
    float: right;
}
.titleBar{
    position:absolute;
    left:0px;
    top:0px;
    height: 20px;
    width: 100%;
    background: rgb(215,215,215);

}
.closebt {
    background: red;
    color: black;
    border-radius: 100%;
    line-height: 13px;
    text-align: center;
    height: 12px;
    width: 12px;
    font-size: 11px;
    display: block;
    margin-top: 4px;
    margin-left: 6px;
    /*top: 4px;*/
    /*left: 0px;*/
    /*position: absolute;*/
}
/* use cross as close button */
.closebt::before {
    content: "\2716";
}
.titleName{
    position: absolute;
    left: 265px;
    top: 0px;
}
</style>