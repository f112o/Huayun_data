# 数据校验工具

这是一个基于 Flask 框架开发的**数据校验与反馈工具**，主要用于批量校验 JSON 文件、展示 PDF 文档、收集和导出用户反馈。适用于数据标注、内容审核等场景。

## Docker 部署

你可以直接使用已构建好的镜像进行部署，无需本地安装 Python 及依赖。

### 1. 拉取镜像

```bash
docker pull 13724510610/data-tool:V2
```

### 2. 运行容器

```bash
docker run -d -p 5002:5002 --name data-tool 13724510610/data-tool:V2
```

如需将本地数据目录挂载到容器（推荐持久化数据），可加 `-v` 参数，例如：

```bash
docker run -d -p 5002:5002 -v /your/local/data:/app/data --name data-tool 13724510610/data-tool:V2
```

### 3. 访问服务

浏览器访问 [http://localhost:5002](http://localhost:5002) 或服务器对应 IP 地址和端口。

## 使用可执行文件

```
your_project/
├── dist/
│   ├── app.exe           ← 你要运行的可执行文件
│   ├── static/           ← 前端静态资源目录（必须和 exe 同级）
│   ├── templates/        ← HTML 模板目录（必须和 exe 同级）
│   ├── data/             ← 数据目录（必须和 exe 同级）
│   │   ├── True1/        ← 你的 JSON 文件目录
│   │   └── feedback.xlsx ← 反馈 Excel 文件
│   └── config.py         ← 配置文件（如有）
```

## 项目结构

```
├── app/                    # 后端主目录
│   ├── data_show.py        # PDF文档展示接口
│   ├── json_process.py     # JSON数据处理与校验接口
│   └── res_collection.py   # 反馈收集与导出接口
├── static/                 # 前端静态资源（JS/CSS/图片）
│   └── js/
│       └── view_pdf.js     # 前端主逻辑脚本
├── templates/              # HTML模板
├── data/                   # 数据存储目录
│   ├── feedback.xlsx       # 用户反馈Excel
│   └── True1/              # 需校验的JSON文件目录
├── app.py                  # 应用入口
├── config.py               # 配置文件
└── requirements.txt        # 依赖包
```

## 主要功能

1. **PDF文档展示**
   - 支持在线预览PDF文件
   - 按文件夹分类浏览

2. **JSON数据校验与反馈**
   - 自动检测JSON内容中的标签闭合等问题
   - 支持人工反馈问题（如内容错误、格式问题等）
   - 每个JSON文件可多次反馈不同问题

3. **侧边栏问题查看与删除**
   - 实时显示当前JSON文件的所有反馈问题
   - 支持一键删除单条反馈

4. **反馈导出**
   - 支持导出所有反馈为Excel
   - 同一文件的多条问题自动合并为一行（以换行分隔）
   - 未被反馈的文件自动标记为“未查看”

## 技术栈

- 后端：Flask
- 前端：HTML、CSS、JavaScript
- 数据存储：文件系统（Excel、JSON）
- 依赖：openpyxl、filelock 等

## 运行环境要求

- Python 3.6+
- Flask
- 依赖包见 requirements.txt

## 安装和运行

1. 克隆项目到本地
2. 安装依赖：
   ```bash
   pip install -r requirements.txt
   ```
3. 启动服务：
   ```bash
   python app.py
   ```
4. 浏览器访问 [http://localhost:5002](http://localhost:5002)

## 配置说明

- `config.py` 可配置 PDF/JSON 根目录、端口等参数
- 需将待校验的 JSON 文件放在 `data/True1/` 目录下

## 使用说明

1. **PDF/JSON浏览**  
   - 首页选择文件夹和文件，支持PDF预览和JSON内容查看

2. **问题反馈**  
   - 可对每个JSON文件提交问题反馈
   - 支持侧边栏查看和删除反馈

3. **自动校验**  
   - 系统自动检测标签闭合等基础问题，发现问题自动记录反馈

4. **反馈导出**  
   - 点击“导出反馈”可下载所有反馈Excel，未反馈文件自动标记为“未查看”

## 注意事项

- 请确保 `data/True1/` 目录下有待校验的JSON文件
- 反馈数据保存在 `data/feedback.xlsx`，建议定期备份
- 若有权限或端口问题，请检查 config.py 配置

---

如需二次开发或功能扩展，请参考 `app/` 目录下各模块源码。