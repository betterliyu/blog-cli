---
title: chrome-devtool 远程调试iOS网页
tags:
  - chrome devtool
  - 移动端
  - debug
categories: 开发工具
lede: 记录一下如何在windows下使用chrome devtool远程调试移动真机设备上的web页面。
date: 2018-09-22 15:34:29
featured:
---


## 使用 chrome devtool 上调试 iOS Safari 网页

#### 1. 安装 [iTunes][1]     
  安装 iTunes 时会同时安装驱动程序。不是在 Window App Store 中安装。点击直接[下载][2]。
  ![iTunes驱动程序][3]

#### 2. 安装 [Node.js][4]    
  需要勾选安装 npm。

#### 3. 安装 remotedebug-ios-webkit-adapter
  前往 [remotedebug-ios-webkit-adapter][5] 按照步骤安装各个依赖包。    
  Scoop 安装参考 [Scoop 主页][6]。 

#### 4. 设置 iphone。     
  打开 设置 》 Safari浏览器 》 高级，开启 Web检查器。将 iphone 使用数据线连接到电脑。如果是第一次连接，需要在 iphone 和 电脑上信任设备。 

#### 5. 启动 iosAdapter
  确保连接成功之后，打开 PowerShell 并执行命令 `remotedebug_ios_webkit_adapter --port=9000`。 如果 windows 询问是否允许访问网络，点击允许即可。   
  > 如果你安装的 remotedebug_ios_webkit_adapter 是0.3.2及以前的版本，同时安装scoop时修改了默认安装路径，在启动后会提示:        
    `remotedebug-ios-webkit-adapter failed to run with the following error: ios_webkit_debug_proxy.exe not found. Please install 'scoop install ios-webkit-debug-proxy'`    
    参照这个修改 [fix(iosAdapter): fixed issue when user has custom scoop path #131][7]。    

  启动成功出现如下界面：    
  ![启动 iosAdapter][8]

#### 6. 设置 Target discovery settings    
  打开 chrome://inspect/#devices，点击 configure，将 localhost:9000 添加到列表中。
  ![chrome://inspect/#devices][9]
  此时在手机上打开 Safari，访问要测试的网页，稍等片刻，chrome 会出现手机上访问的网页。点击inspect 即可调试。
  ![手机打开的网页][10]

#### 7. 遇到的问题
  - 升级 ios 12.2 调试有问题，Remote target 不会出现网页列表。暂时(2019/04/13)没有找到解决方法。
  - 如果打开 devtool 出现 404 或者空白，需要科学上网。
    


[1]: https://www.apple.com/itunes/download/
[2]: https://secure-appldnld.apple.com/itunes12/041-44313-20190325-EF444F04-4E71-11E9-8702-7A4824A43337/iTunes64Setup.exe
[3]: ./chrome-devtool-远程调试iOS网页/apple-install.png
[4]: https://nodejs.org/en/download/
[5]: https://github.com/RemoteDebug/remotedebug-ios-webkit-adapter
[6]: https://github.com/lukesampson/scoop
[7]: https://github.com/RemoteDebug/remotedebug-ios-webkit-adapter/pull/131
[8]: ./chrome-devtool-远程调试iOS网页/ps.png
[9]: ./chrome-devtool-远程调试iOS网页/chrome-inspect.png
[10]: ./chrome-devtool-远程调试iOS网页/remote-target.png