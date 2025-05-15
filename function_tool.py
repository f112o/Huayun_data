import re
def fix_latex_slash(text):
    # 只替换 LaTeX 命令前的单斜杠，不替换 \n \t \r 等 JSON 合法转义
    #text = re.sub(r'\\(?![ntlrfe"\\/])([a-zA-Z])', r'\\\\\1', text)
    text = fix_broken_begin(text)
    #text = fix_cases_backslash(text)
    return text

def fix_cases_backslash(text):
    # 只修复 \begin{cases} ... \end{cases} 里的单斜杠
    def repl(m):
        s = m.group(0)
        # 把所有不是 \\ 的 \ 换成 \\
        return re.sub(r'([^\\])\\([^\\])', r'\1\\\\\2', s)
    return re.sub(r'(\\begin\{cases\}.*?\\end\{cases\})', repl, text, flags=re.DOTALL)

def fix_broken_begin(text):
    # 修复 \x08egin、\x08end、\x0crac
    text = re.sub(r'[\x00-\x1f\u200b\xa0]+riangle', r'\\triangle', text)
    text = re.sub(r'\reft', r'\\left', text)
    text = re.sub(r'\right', r'\\right', text)
    text = re.sub(r'\rin', r'\\in', text)
    text = re.sub(r'[\x00-\x1f\u200b\xa0]+orall', r'\\forall', text)
    
    text = re.sub(r'[\x00-\x1f\u200b\xa0]+tan', r'\\tan', text)
    text = re.sub(r'[\x00-\x1f\u200b\xa0]+sin', r'\\sin', text)
    text = re.sub(r'[\x00-\x1f\u200b\xa0]+cos', r'\\cos', text)
    text = re.sub(r'[\x00-\x1f\u200b\xa0]+cot', r'\\cot', text)
    text = re.sub(r'[\x00-\x1f\u200b\xa0]+sec', r'\\sec', text)
    text = re.sub(r'[\x00-\x1f\u200b\xa0]+csc', r'\\csc', text)
    text = re.sub(r'[\x00-\x1f\u200b\xa0]+ext', r'\\text', text) 
    text = re.sub(r'[\x00-\x1f\u200b\xa0]+eta', r'\\beta', text)
    text = re.sub(r'[\x00-\x1f\u200b\xa0]+ar', r'\\bar', text) 
    text = re.sub(r'\x08acksim', r'\\backsim', text) 
    text = re.sub(r'\x08ecause', r'\\because', text)
    text = re.sub(r'\x08egin', r'\\begin', text)
    text = re.sub(r'\x08end', r'\\end', text)
    text = re.sub(r'\x0crac', r'\\frac', text)
    text = re.sub(r'\x08oldsymbol', r'\\boldsymbol', text)
    # 修复常见的被破坏的 LaTeX 命令
    broken_cmds = [
        'boldsymbol', 'alpha', 'beta', 'mu', 'lambda', 'in', 'ext', 'cdot', 'overrightarrow', 'mathbf', 'overline', 'sqrt'
    ]
    for cmd in broken_cmds:
        # 修复退格符（\x08）+命令
        text = re.sub(r'[\x00-\x1f\u200b\xa0]+' + cmd, r'\\' + cmd, text)
    #text = re.sub(r'(?<!\\)[\x00-\x1f\u200b\xa0]+([a-zA-Z]+)', r'\\\1', text)
    return text

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