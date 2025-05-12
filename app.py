from flask import Flask
import config
from app.data_show import bp as pdf_bp
from app.json_process import json_bp
from app.res_collection import res_bp
app = Flask(__name__)
app.config.from_object(config)

app.register_blueprint(pdf_bp)
app.register_blueprint(json_bp)
app.register_blueprint(res_bp)
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5002, debug=True)