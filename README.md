### AiT 
AiT 是一个基于国内大模型实现的一个沉浸式翻译插件，可以在Chrome浏览器中使用。
相比于市面的翻译插件，AiT 的优势在于：
1. 翻译结果更沉浸，更自然。这点借鉴于 沉浸式翻译插件 的设计思想
2. 使用国内主流的大模型翻译，并支持补充promt，翻译会结合上下文去翻译，更加精准
3. 需要用户自行去各个大模型平台注册账号，填写相关的秘钥信息才可以使用
4. 使用大模型上下文翻译，速度会慢一点

#### 简述
本插件遵循MIT协议，欢迎大家fork和PR。

本插件的技术栈采用了tailwindcss，nextUI，rsbuild,react 。

本插件目前实现星火3.5的完整链路支持，后续会实现对kimi,通义，扣子的支持。


### 开发
#### 调试pop 部分
``` 
    pnpm run dev:pop 
```
#### 调试set页面

 ``` 
    pnpm run dev:set 
```
#### 调试build
``` 
    pnpm run build
```
