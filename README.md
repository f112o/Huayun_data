<<<<<<< HEAD
# Huayun_data
=======
# 数据校验工具

这是一个基于Flask框架开发的数据校验和展示工具，主要用于处理和展示PDF文档、JSON数据以及资源文件。

## 项目结构

```
├── app/                    # 应用主目录
│   ├── data_show.py       # PDF文档展示模块
│   ├── json_process.py    # JSON数据处理模块
│   └── res_collection.py  # 资源文件管理模块
├── static/                # 静态资源文件
├── templates/             # HTML模板文件
├── data/                  # 数据存储目录
├── app.py                 # 应用入口文件
├── config.py             # 配置文件
└── function_tool.py      # 功能工具模块
```

## 主要功能

1. **PDF文档展示**
   - 支持PDF文件的在线预览
   - 按文件夹组织PDF文件
   - 提供友好的PDF查看界面

2. **JSON数据处理**
   - JSON数据的解析和验证
   - 数据格式转换
   - 数据可视化展示

3. **资源文件管理**
   - 资源文件的收集和整理
   - 文件分类管理
   - 资源访问控制

## 技术栈

- 后端框架：Flask
- 前端技术：HTML, CSS, JavaScript
- 数据存储：文件系统
- 开发语言：Python

## 运行环境要求

- Python 3.6+
- Flask
- 其他依赖包（详见requirements.txt）

## 安装和运行

1. 克隆项目到本地
2. 安装依赖：
   ```bash
   pip install -r requirements.txt
   ```
3. 运行应用：
   ```bash
   python app.py
   ```
4. 访问地址：http://localhost:5002

## 配置说明

在`config.py`中可以配置以下参数：
- PDF文件根目录
- 服务器端口
- 其他应用配置

## 使用说明

1. PDF查看：
   - 访问首页即可查看PDF文件列表
   - 点击文件名即可在线预览

2. JSON处理：
   - 上传JSON文件进行处理
   - 查看处理结果和可视化展示

3. 资源管理：
   - 上传和管理资源文件
   - 按类别组织文件

## 注意事项

- 请确保有足够的磁盘空间存储PDF和资源文件
- 建议定期备份重要数据
- 注意文件访问权限的设置


>>>>>>> origin/master
