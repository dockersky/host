<template>
    <div>
        <div class="title">host group</div>
        <div class="groupArea">
            <span v-for="group in groupArr">
                <div class="item" :name="group.name" @click="chooseGroup(group)">{{group.name}}<span v-if="group.view" class="myicon">★</span><span v-if="!group.view && group.halfView" class="myicon half">✩</span></div>
            </span>
        </div>
        <div class="title">host search</div>
        <input class="searchInput" @input="searchInput" v-model="searchWord" placeholder="请输入域名 如：baidu">
        <div class="itemDomainList">
            <div v-for="itemDomain in domainMapList" v-if="itemDomain.view"><span class="itemDomain">{{itemDomain.domain}}</span>
                <span v-for="host in itemDomain.itemList">
                    <div class="hostIp item" :name="itemDomain.domain" @click="chooseRadio(host.index,itemDomain.itemList,host.view)">{{host.ip}}<span v-if="host.view" class="myicon">★</span></div>
                </span>
            </div>
        </div>
    </div>
</template>
<script>
    const {remote} = window.require('electron')
export default {
    props: ['domainMapList', 'groupArr', 'domainMap'],
    data () {
      return {
        searchWord: ''
      }
    },
    watch: {
      domainMapList: function (newQuestion, oldQuestion) {
        this.searchInput()
      }
    },
    methods: {
      chooseGroup (group) {
        let clickHostList = group.hostList;
        let view = group.view;
        let halfView = group.halfView;
        //console.log(this.groupArr)
        let fileContent = remote.app.readHost()
        let arr = fileContent.split(/[\n]/)

        if (view || halfView) { // 选中情况仅取消选中
          for (let i = 0; i < clickHostList.length; i++) {
            let clickIndex = clickHostList[i].index
            arr[clickIndex] = cancelLine(arr[clickIndex].trim())
          }
        } else { // 未选中情况先取消所有再选中当前
          for (let i = 0; i < clickHostList.length; i++) {
            let domainList = clickHostList[i].domainList
            for (let i = 0; i < domainList.length; i++) {
              let hostList = this.domainMap.get(domainList[i])
              for (let i = 0; i < hostList.length; i++) {
                let index = hostList[i].index
                arr[index] = cancelLine(arr[index].trim())
              }
            }
          }
          for (let i = 0; i < clickHostList.length; i++) {
            let clickIndex = clickHostList[i].index
            arr[clickIndex] = arr[clickIndex].trim().substring(1)
          }
        }
        remote.app.saveHost(arr.join('\n'))
      },
      chooseRadio (clickIndex, itemList, choose) {
        //console.log(this.groupArr)
        let fileContent = remote.app.readHost()
        let arr = fileContent.split(/[\n]/)
        let clickLine = arr[clickIndex].trim()
        if (choose) { // 选中情况仅取消选中
          arr[clickIndex] = cancelLine(clickLine)
        } else { // 未选中情况先取消所有再选中当前
          for (let i = 0; i < itemList.length; i++) {
            let lineIndex = itemList[i].index
            arr[lineIndex] = cancelLine(arr[lineIndex].trim())
          }
          arr[clickIndex] = clickLine.substring(1)
        }
        remote.app.saveHost(arr.join('\n'))
      },
      searchInput () {
        let domainMapList = this.domainMapList
        let inputStr = this.searchWord
        let filterItemArr = domainMapList.filter(item => item.domain.indexOf(inputStr) >= 0)
        for (let i = domainMapList.length - 1; i >= 0; i--) {
          domainMapList[i].view = false
        }
  
        for (let i = filterItemArr.length - 1; i >= 0; i--) {
          filterItemArr[i].view = true
        }
      }
    }
  }

  function cancelLine (line) {
    if (!line.startsWith('#')) {
      line = '#' + line
    }
    return line
  }
</script>
<style type="text/css">
/**绿色勾*/
.myicon {
    border-radius: 50%;
    color: #FF0000;
    font-size: 13px;
}

.myicon.half {
    font-size: 16px;
}

.hostIp {
    margin-left: 10px;
}

.itemDomain {
    white-space: nowrap;
    font-size: 15px;
    font-weight: bold;
}

.itemDomainList {
    overflow: auto;
    width: 200px;
    height: 380px;
    border: 1px solid gray;
}

.groupArea {
    overflow: auto;
    width: 200px;
    height: 200px;
    border: 1px solid gray;
}

.searchInput {
    width: 200px;
    height: 30px;
    margin-bottom: 10px;
}

.item:hover {
    background-color: #c1bebe;
    cursor: pointer;
}
</style>