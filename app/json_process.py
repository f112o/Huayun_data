from flask import Blueprint, jsonify, current_app
import os
import json
from function_tool import *

json_bp = Blueprint('json_process', __name__)

@json_bp.route('/get-json-by-keyword/<keyword>')
def get_json_by_keyword(keyword):
    """根据关键字获取匹配的 JSON 文件，并返回其中的 20%，从随机起始点开始"""
    json_dir = os.path.join(current_app.config['DATA_FOLDER'], 'True1')  # 假设 JSON 文件存储在 data/test 目录下
    try:
        # 获取包含关键字的 JSON 文件
        matching_files = [
            f for f in os.listdir(json_dir)
            if os.path.isfile(os.path.join(json_dir, f)) and keyword in f and f.endswith('.json')
        ]

        # 对文件名进行排序（按自然顺序）
        matching_files.sort(key=lambda x: chinese_to_number(x))

        # 分组处理包含分片信息的文件
        grouped_files = {}
        for file in matching_files:
            # 检查是否包含分片信息
            if '【第' in file and '部分共' in file:
                # 提取分片的公共前缀（去掉分片信息）
                prefix = file.split('【第')[0]
                if prefix not in grouped_files:
                    grouped_files[prefix] = []
                grouped_files[prefix].append(file)
            else:
                # 不包含分片信息的文件直接加入分组
                grouped_files[file] = [file]

        # 展平分组后的文件列表
        flattened_files = []
        for group in grouped_files.values():
            flattened_files.extend(group)

        # 计算返回的文件数量（20%）
        num_to_return = max(1, int(len(flattened_files) * 0.2))  # 至少返回 1 个文件

        # 随机选择起始点
        import random
        start_index = random.randint(0, int(len(flattened_files) * 0.8))  # 随机起始点，范围为 0 到 80% 的位置

        # 从起始点按顺序选择文件
        selected_files = []
        selected_set = set()
        for i in range(start_index, start_index + len(flattened_files)):
            file = flattened_files[i % len(flattened_files)]  # 循环选择文件
            # 如果文件属于分片组，确保整个组都被选中
            if '【第' in file and '部分共' in file:
                prefix = file.split('【第')[0]
                if prefix not in selected_set:
                    selected_files.extend(grouped_files[prefix])
                    selected_set.add(prefix)
            else:
                if file not in selected_set:
                    selected_files.append(file)
                    selected_set.add(file)
            if len(selected_files) >= num_to_return:
                break

        return jsonify(selected_files)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@json_bp.route('/get-json/<filename>')
def get_json(filename):
    """获取指定 JSON 文件的内容"""
    json_path = os.path.join('data', 'True1', filename)  
    if os.path.exists(json_path):
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                content = json.load(f)
                to_return = {}
                data = content['content']
                num_tokens = calculate_tokens(data)
                data = fix_latex_slash(data)
                #print(f"文件 {filename} 的 token 数量: {num_tokens}")
                to_return['num_tokens'] = num_tokens
                #print(repr(data))
                to_return['content'] = data
                
            return jsonify(to_return)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "文件未找到"}), 404
# @json_bp.route('/get-json/<filename>')
# def get_json(filename):
#     """获取指定 JSON 文件的内容，保留原始转义"""
#     import re
#     json_path = os.path.join('data', 'True1', filename)
#     if os.path.exists(json_path):
#         try:
#             with open(json_path, 'r', encoding='utf-8') as f:
#                 raw = f.read()
#                 # 用正则提取 content 字段的原始字符串
#                 match = re.search(r'"content"\s*:\s*"((?:[^"\\]|\\.)*)"', raw)
#                 if match:
#                     content_raw = match.group(1)
#                     # 将所有转义还原为原始字符串（如 \\n -> \n），但 LaTeX 相关的 \\ 保留
#                     # 这里不做 decode，直接传递原始字符串给前端
#                     data = fix_latex_slash(content_raw)
#                     num_tokens = calculate_tokens(data)
#                     to_return = {
#                         'num_tokens': num_tokens,
#                         'content': data
#                     }
#                     return jsonify(to_return)
#                 else:
#                     return jsonify({"error": "content 字段未找到"}), 400
#         except Exception as e:
#             return jsonify({"error": str(e)}), 500
#     return jsonify({"error": "文件未找到"}), 404
    

@json_bp.route('/get-folders')
def get_folders():
    """获取文件夹名称"""
    base_path = current_app.config['PDF_ROOT']
    try:
        folders = [f for f in os.listdir(base_path) if os.path.isdir(os.path.join(base_path, f))]
        return jsonify(folders)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@json_bp.route('/get-files/<folder>')
def get_files(folder):
    """获取指定文件夹下的文件名"""
    base_path = os.path.join(current_app.config['PDF_ROOT'], folder)
    try:
        files = [f for f in os.listdir(base_path) if os.path.isfile(os.path.join(base_path, f))]
        return jsonify(files)
    except Exception as e:
        return jsonify({"error": str(e)}), 500