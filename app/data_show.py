from flask import current_app,blueprints,send_file, jsonify, render_template
import os

bp = blueprints.Blueprint('data_show', __name__, url_prefix='/')

@bp.route('/', methods=['GET', 'POST'])
def pdf_viewer():
    """渲染 PDF 查看页面"""
    return render_template('view_pdf.html')

@bp.route('/view-pdf/<folder>/<filename>')
def view_pdf(folder, filename):
    """根据文件夹和文件名提供 PDF 文件"""
    pdf_path = os.path.join(current_app.config['PDF_ROOT'], folder, filename)
    if os.path.exists(pdf_path):
        return send_file(pdf_path, as_attachment=False)
    return render_template('error.html', error="PDF 文件未找到"), 404

