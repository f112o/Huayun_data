
let jsonFiles = [];
let currentIndex = 0;

// 加载"文件夹"下拉菜单
fetch('/get-folders')
    .then(response => response.json())
    .then(folders => {
        const folderDropdown = document.getElementById('folderDropdown');
        folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder;
            option.textContent = folder;
            folderDropdown.appendChild(option);
        });
    });

// 选择文件夹时，加载对应文件列表
document.getElementById('folderDropdown').addEventListener('change', function () {
    const folder = this.value;
    const fileDropdown = document.getElementById('fileDropdown');
    fileDropdown.innerHTML = '<option value="">请选择文件</option>';
    fileDropdown.disabled = true;

    if (folder) {
        fetch(`/get-files/${folder}`)
            .then(response => response.json())
            .then(files => {
                files.forEach(file => {
                    const option = document.createElement('option');
                    option.value = file;
                    option.textContent = file;
                    fileDropdown.appendChild(option);
                });
                fileDropdown.disabled = false;
            });
    }
});

// 选择文件时，iframe加载PDF并获取JSON
document.getElementById('fileDropdown').addEventListener('change', function () {
    const folder = document.getElementById('folderDropdown').value;
    const file = this.value;
    const pdfIframe = document.getElementById('pdfIframe');
    const jsonContent = document.getElementById('jsonContent');
    const nextButton = document.getElementById('nextButton');

    // 清空 PDF 区域
    pdfIframe.src = '';

    if (folder && file) {
        // 设置 iframe 加载 PDF
        const pdfUrl = `/view-pdf/${folder}/${file}?_ts=${Date.now()}`;
        pdfIframe.src = pdfUrl;

        // 根据文件名获取 JSON
        const keyword = file.split('-')[0];
        fetch(`/get-json-by-keyword/${keyword}`)
            .then(response => response.json())
            .then(files => {
                jsonFiles = files;
                currentIndex = 0;
                if (jsonFiles.length > 0) {
                    loadJsonFile(0);
                    updateNextButton();
                } else {
                    jsonContent.innerHTML = '<p>未找到匹配的 JSON 文件</p>';
                    nextButton.textContent = '下一个 JSON';
                }
            });
    } else {
        jsonContent.innerHTML = '<p>请选择 PDF 文件</p>';
        nextButton.textContent = '下一个 JSON';
    }
});

/* ==================== JSON 相关函数 ==================== */

function checkTagClosed(str) {
// 匹配所有 <标签> 和 </标签>
const tagRegex = /<\/?([\u4e00-\u9fa5a-zA-Z0-9]+)>/g;
let stack = [];
let match;
const filename = (typeof jsonFiles !== 'undefined' && jsonFiles.length > 0) ? jsonFiles[currentIndex] : '';
while ((match = tagRegex.exec(str)) !== null) {
const tag = match[1];
if (match[0][1] !== '/') {
    // 开始标签
    stack.push(tag);
} else {
    // 结束标签
    if (stack.length === 0 || stack[stack.length - 1] !== tag) {
        alert(`标签 <${tag}> 未正确闭合！\n当前栈：${stack.join(' > ')}`);
        fetch('/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: filename, problem: `标签<${tag}>缺失起始标签或标签 <${stack[stack.length - 1]}>缺失结束标签` })
        });
        return false;
    }
    stack.pop();
}
}
if (stack.length > 0) {
alert(`标签 <${stack[stack.length - 1]}> 未闭合！`);
fetch('/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: filename, problem: `标签 <${stack[stack.length - 1]}>缺失结束标签！` })
        });
return false;
}
return true;
}

// 在 renderWithLineBreaks 前调用
function renderWithLineBreaks(str) {
    checkTagClosed(str);
    console.log('原文:', str);

    // 判断是否为英语内容
    if (str.includes('英语')) {
        // 转义所有英文标签 <xxx>
        str = str.replace(/(<\/?[a-zA-Z_]+>)/g, function(m) {
            return '<span style="color:blue;">' + m.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';
        });
    } else {
        // 只转义和高亮 <> 里含有中文的标签
        str = str.replace(/(<\/?[\u4e00-\u9fa5]+>)/g, function(m) {
            return '<span style="color:blue;">' + m.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';
        });
    }

    // 图片链接转 img
    str = str.replace(/https:\/\/minio-file\.hwzxs\.com\/[^\s\]\)]+/g, function(url) {
        return `<img src="${url}" style="max-width:100%;">`;
    });
    // 换行转 <br>
    str = str.replace(/\n/g, '<br>');

    return str;
}

function loadJsonFile(index) {
const jsonContent = document.getElementById('jsonContent');
// 添加淡出动画
jsonContent.classList.add('fade-out');
setTimeout(() => {
if (index >= 0 && index < jsonFiles.length) {
    const filename = jsonFiles[index];
    fetch(`/get-json/${filename}`)
        .then(response => response.json())
        .then(data => {
            const tokenInfo = document.getElementById('tokenInfo');
            if (typeof data.content === 'string') {
                jsonContent.innerHTML = `<div style="font-family:monospace;">${renderWithLineBreaks(data.content)}</div>`;
                // 确保 MathJax 重新渲染
                if (window.MathJax) {
                    MathJax.typesetPromise([jsonContent]).catch((err) => console.log('MathJax error:', err));
                }
            } else {
                // ... 其他代码 ...
            }
            if (data.num_tokens !== undefined) {
                tokenInfo.textContent = `Token 数量: ${data.num_tokens}`;
            }
            updateNextButton();
            // 动画淡入
            jsonContent.classList.remove('fade-out');
        })
        .catch(e => {
            console.error(e);
            jsonContent.classList.remove('fade-out');
        });
} else {
    jsonContent.classList.remove('fade-out');
}
}, 300);
}

function renderJsonAsHtml(data) {
    if (typeof data === 'object' && data !== null) {
        let html = '<div>';
        for (const key in data) {
            if (typeof data[key] === 'object') {
                html += `<div><span class="json-key">${key}:</span>${renderJsonAsHtml(data[key])}</div>`;
            } else {
                html += `<div><span class="json-key">${key}:</span> <span class="json-value">${data[key]}</span></div>`;
            }
        }
        html += '</div>';
        return html;
    } else {
        return `<div class="json-value">${data}</div>`;
    }
}

document.getElementById('prevButton').addEventListener('click', function () {
    if (jsonFiles.length > 0) {
        currentIndex = (currentIndex - 1 + jsonFiles.length) % jsonFiles.length;
        loadJsonFile(currentIndex);
    }
});

async function hasFeedback(filename) {
    const res = await fetch('/get-feedback-entries');
    const data = await res.json();
    return (data.entries || []).some(item => item.filename === filename);
}

document.getElementById('nextButton').addEventListener('click', async function () {
    if (jsonFiles.length > 0) {
        const filename = jsonFiles[currentIndex];
        // 查表：如果没有反馈，自动提交“无问题”
        if (!(await hasFeedback(filename))) {
            fetch('/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, problem: '无问题' })
            });
        }
        currentIndex = (currentIndex + 1) % jsonFiles.length;
        loadJsonFile(currentIndex);
    }
});

// 显示弹窗
document.getElementById('feedbackButton').addEventListener('click', () => {
    const modal = document.getElementById('feedbackModal');
    const filenameInput = document.getElementById('feedbackFilename');
    if (jsonFiles.length > 0) {
        filenameInput.value = jsonFiles[currentIndex] || '';
    }
    modal.classList.remove('animate__fadeOut');
    modal.style.display = 'block';
    modal.classList.add('animate__fadeIn');
});

// 隐藏弹窗
document.getElementById('feedbackCancel').addEventListener('click', () => {
    const modal = document.getElementById('feedbackModal');
    modal.classList.remove('animate__fadeIn');
    modal.classList.add('animate__fadeOut');
    setTimeout(() => { modal.style.display = 'none'; }, 200);
});

// 提交反馈
document.getElementById('feedbackConfirm').addEventListener('click', () => {
    const filename = document.getElementById('feedbackFilename').value || '';
    const problem = document.getElementById('feedbackProblem').value || '';
    fetch('/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, problem })
    })
    .then(res => res.json())
    .then(res => alert(res.message || '反馈完成'))
    .catch(err => console.error(err));

    // 隐藏弹窗并清空内容
    document.getElementById('feedbackModal').style.display = 'none';
    document.getElementById('feedbackProblem').value = '';
});

// 点击"导出"按钮：显示弹窗并获取反馈数据
document.getElementById('exportButton').addEventListener('click', () => {
    const exportModal = document.getElementById('exportModal');
    exportModal.style.display = 'block';

    fetch('/get-feedback-entries')
        .then(res => res.json())
        .then(data => {
            const tableContainer = document.getElementById('feedbackTable');
            tableContainer.innerHTML = renderFeedbackTable(data.entries || []);
        })
        .catch(err => console.error(err));
});

// "下载"按钮 -> 打开 /download-feedback
document.getElementById('downloadFeedback').addEventListener('click', () => {
    window.location.href = '/download-feedback';
});

// 关闭弹窗
document.getElementById('closeExportModal').addEventListener('click', () => {
    document.getElementById('exportModal').style.display = 'none';
});

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderFeedbackTable(entries) {
    if (!entries || entries.length === 0) {
        return '<p>暂无反馈内容</p>';
    }
    let html = '<table style="width:100%; border-collapse: collapse;"><thead><tr><th style="border:1px solid #999; padding:5px;">文件名</th><th style="border:1px solid #999; padding:5px;">问题描述</th><th>操作</th></tr></thead><tbody>';
    entries.forEach(item => {
        html += `<tr>
            <td style="border:1px solid #999; padding:5px;">${escapeHtml(item.filename || '')}</td>
            <td style="border:1px solid #999; padding:5px;">${escapeHtml(item.problem || '')}</td>
            <td><button class="delete-feedback-btn" data-filename="${encodeURIComponent(item.filename)}" data-problem="${encodeURIComponent(item.problem)}">删除</button></td>
        </tr>`;
    });
    html += '</tbody></table>';
    return html;
}

// 事件委托，监听删除按钮
document.getElementById('feedbackTable').onclick = function(e) {
    if (e.target.classList.contains('delete-feedback-btn')) {
        const filename = decodeURIComponent(e.target.getAttribute('data-filename'));
        const problem = decodeURIComponent(e.target.getAttribute('data-problem'));
        if (confirm('确定要删除这条反馈吗？')) {
            fetch('/delete-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, problem })
            })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    // 重新加载反馈表
                    fetch('/get-feedback-entries')
                        .then(res => res.json())
                        .then(data => {
                            document.getElementById('feedbackTable').innerHTML = renderFeedbackTable(data.entries || []);
                        });
                } else {
                    alert('删除失败');
                }
            });
        }
    }
};

function updateNextButton() {
    const nextButton = document.getElementById('nextButton');
    if (jsonFiles.length > 0) {
        nextButton.textContent = `下一个 JSON (${currentIndex + 1}/${jsonFiles.length})`;
    } else {
        nextButton.textContent = '下一个 JSON';
    }
}

function loadCurrentFileProblems() {
    // 只取文件名部分，保证和反馈表一致
    let filename = jsonFiles && jsonFiles.length > 0 ? jsonFiles[currentIndex] : '';
    filename = filename.split('/').pop();
    fetch(`/get-problems/${filename}`)
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById('problemList');
            if (data && data.length > 0) {
                list.innerHTML = data.map(item => `
                    <div style="margin-bottom:8px;display:flex;align-items:center;">
                        <span style="flex:1;">• ${escapeHtml(item)}</span>
                        <button class="delete-problem-btn" data-filename="${encodeURIComponent(filename)}" data-problem="${encodeURIComponent(item)}" style="margin-left:8px;">删除</button>
                    </div>
                `).join('');
            } else {
                list.innerHTML = '<div style="color:#aaa;">暂无问题</div>';
            }
        });
}
// 鼠标移入时加载
document.getElementById('problemSidebar').addEventListener('mouseenter', loadCurrentFileProblems);

document.getElementById('problemList').onclick = function(e) {
    if (e.target.classList.contains('delete-problem-btn')) {
        const filename = decodeURIComponent(e.target.getAttribute('data-filename'));
        const problem = decodeURIComponent(e.target.getAttribute('data-problem'));
        if (confirm('确定要删除这条反馈吗？')) {
            fetch('/delete-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, problem })
            })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    loadCurrentFileProblems(); // 删除后刷新
                } else {
                    alert('删除失败');
                }
            });
        }
    }
};