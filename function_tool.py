import re
def calculate_tokens(content):
    chinese_tokens = len(re.findall(r'[\u4e00-\u9fff]', content)) * (3 / 1.7)
    english_tokens = len(re.findall(r'\b[a-zA-Z]+\b', content)) * (1.5 / 1)  # 按单词计算
    other_tokens = len(re.findall(r'[^\u4e00-\u9fffa-zA-Z]', content)) * (1 / 1)
    return chinese_tokens + english_tokens + other_tokens

def chinese_to_number(chinese):
    """将字符串中的中文数字转换为阿拉伯数字"""
    mapping = {
        "一": 1, "二": 2, "三": 3, "四": 4, "五": 5,
        "六": 6, "七": 7, "八": 8, "九": 9, "十": 10
    }

    def convert(match):
        """将匹配的中文数字转换为阿拉伯数字"""
        chinese_num = match.group()
        result = 0
        unit = 1
        for char in reversed(chinese_num):
            if char in mapping:
                result += mapping[char] * unit
            elif char == "十":
                unit = 10
            else:
                unit = 1
        return str(result)

    # 使用正则表达式提取中文数字并替换为阿拉伯数字
    return re.sub(r'[一二三四五六七八九十]+', convert, chinese)