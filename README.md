1.pm build出安装包成功安装后，界面如图：\n
  ![image](https://raw.githubusercontent.com/dockersky/host/master/1.bmp)\n
2.在界面上“提示”，是对配置的一个帮忙。
  #==== groupName(组名)
   127.0.0.1 www.baidu.com
  127.0.0.1 www.sina.com
   #====
  ★：“选中”
  ✩：“部分选中"
    备注：#和groupName之间一定要空格，★和✩是对host group全部选中或部分选中不同的展示）
3.我们一起来添加三套不同环境的host配置：
  #==== uat
  127.0.0.1 www.google.cn
  127.0.0.2 uat.google.cn
  #====

  #==== pre
  #128.0.0.1 www.google.cn
  #128.0.0.2 uat.google.cn
  #====
  
  #==== online
  #129.0.0.1 www.google.cn
  #129.0.0.2 uat.google.cn
  #====
4.击保存后，配置会更新到window和mac的hosts配置文件中，同时页面如图：
  Windows目录：C:\Windows\System32\drivers\etc\hosts
  Mac和Linux目录：/etc/hosts
  ![image](https://raw.githubusercontent.com/dockersky/host/master/2.bmp)
  ![image](https://raw.githubusercontent.com/dockersky/host/master/3.bmp)
5.通过host group 来进行组和部分ip切换，在观察hosts配置文件和界面，发现已经变化。
 ![image](https://raw.githubusercontent.com/dockersky/host/master/4.bmp)
 ![image](https://raw.githubusercontent.com/dockersky/host/master/5.bmp)
