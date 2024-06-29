from flask import Flask, request, render_template
import requests
import json
from http import HTTPStatus
import dashscope
import openai
from flask_cors import CORS
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
app = Flask(__name__)
online_module_name = {"online_module_name": []}
online_module = []
# [0,1,2]
current_module_no = 0
current_chat_no = 0
current_chat_list = []
current_ask = {}
current_response = ["","",""]
'''[
    {
        "chat_name":"chat_1",
        "message":[
            {
                "role": "user",
                "content": "hi gz"
            },
            {
                "role": "assistant",
                "content": "im gz"
            },
            {
                "role": "user",
                "content": "hi gz"
            }
        ]
    }
]'''


class ChatFileManager():
    def __init__(self):
        self.path = os.path.dirname(os.path.abspath(__file__)) + "\\"

    def write_list_to_disk(self):   
        global current_chat_list
        global online_module_name
        global current_module_no
        try:
            with open(self.path + online_module_name["online_module_name"][current_module_no] + ".dat", 'w') as file:
                file.write(json.dumps(current_chat_list))
                print("Write Back Success To" + self.path + online_module_name["online_module_name"][current_module_no])
        except IOError as e:
            print(f"An IOError occurred: {e}")

    # 从文件中读取列表
    def read_list_from_file(self, module_no):
        global current_chat_list
        try:
            with open(self.path + online_module_name["online_module_name"][module_no] + ".dat", 'r') as file:
                current_chat_list = json.load(file)
        except FileNotFoundError:
            # 如果文件不存在，设置 current_chat_list 为空列表
            current_chat_list = []
        except json.JSONDecodeError:
            # 如果文件存在但内容不是有效的 JSON，也设置为空列表
            current_chat_list = []
        except Exception as e:
            # 其他异常，打印错误信息
            print(f"An unexpected error occurred: {e}")
            # 可以选择再次设置为空列表，或者根据需要进行其他错误处理
            current_chat_list = []


class WenXinYiYan():
    def __init__(self):
        self.AppID = "请输入自己申请的appid"
        self.API_Key = "请输入自己申请的api-key"
        self.Secret_Key = "请输入自己申请的密钥"
        self.access_token = self.access_token()

    def access_token(self):
        url = "https://aip.baidubce.com/oauth/2.0/token"
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        payload = {
            'grant_type': 'client_credentials',
            'client_id': self.API_Key,
            'client_secret': self.Secret_Key
        }
        response = requests.request("POST",  url, headers=headers, data=payload)
        if response.status_code == HTTPStatus.OK:
            data = response.json()
            return data["access_token"]
        print("Wen get access token error")
        return None
    
    def communicate(self, context):
        url = "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie_speed?access_token=" + self.access_token
        payload = json.dumps({"messages": context})
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.request("POST", url, headers=headers, data=payload)
        if response.status_code == HTTPStatus.OK:
            data = response.json()
            return data["result"]
        print("Wen communicate error")
        return None
# {
#     "messages": [
#        {
#             "role": "user",
#             "content": "介绍一下北京"
#         }
#    ]
# }
# 以上为context示例
# 其他可调参数请见https://cloud.baidu.com/doc/WENXINWORKSHOP/s/clntwmv7t


class TongYiQianWen():
    def __init__(self):
        self.API_KEY = "请输入自己的API-KEY"
        dashscope.api_key = self.API_KEY

    def communicate(self, context):
        response = dashscope.Generation.call(
            dashscope.Generation.Models.qwen_turbo,
            messages=context,
            result_format='message',  # 将返回结果格式设置为 message
        )
        if response.status_code == HTTPStatus.OK:
            data = response["output"]["choices"][0]["message"]["content"]
            return data
        print('Request id: %s, Status code: %s, error code: %s, error message: %s' % (
            response.request_id, response.status_code,
            response.code, response.message
        ))
        return None
# [{'role': 'user', 'content': '请介绍一下通义千问'}]
# 以上为context示例
# 更多设置请见https://help.aliyun.com/zh/dashscope/developer-reference/api-details?spm=a2c4g.11186623.0.0.3463fa70fmQOVD


class Chat_Gpt():
    def __init__(self):
        self.API_KEY = "请输入自己的API-KEY"

    def communicate(self, context):
        openai.api_key = self.API_KEY
        openai.base_url = "https://free.gpt.ge/v1/"
        openai.default_headers = {"x-foo": "true"}
        chat_completion = openai.chat.completions.create(model="gpt-3.5-turbo", messages=context,)
        return chat_completion.choices[0].message.content
# [
#     {
#         "role": "user",
#         "content": "Say this is a test",
#     }
# ]
# 以上为context示例
# 具体参数见https://www.openaidoc.com.cn/api-reference/chat


@app.route('/get_online_module_name', methods=['GET'])
def get_online_module_name():
    return online_module_name

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/change_current_module', methods=['POST'])
def change_current_module():
    data = request.json
    global local_chat_file_manager
    global current_module_no
    global current_chat_no
    if "current_module_no" in data:
        if data["current_module_no"] == "0" or "1" or "2" or "3":      
            local_chat_file_manager.write_list_to_disk()
            local_chat_file_manager.read_list_from_file(int(data["current_module_no"]))
            current_module_no = int(data["current_module_no"])
            current_chat_no = 0
            return {"current_chat_list": current_chat_list}
    return "find error in body"


'''{
    "current_module_no": "0"
}'''


@app.route('/change_current_chat', methods=['POST'])
def change_current_chat():
    data = request.json
    global current_chat_no
    if "current_chat_no" in data:
        if int(data["current_chat_no"]) <= len(current_chat_list) - 1:
            current_chat_no = int(data["current_chat_no"])
            return current_chat_list[current_chat_no]##modify
    return "find error in body"


'''{
    "current_chat_no": "0"
}'''


@app.route('/Chat', methods=['POST'])
def Chat():
    global current_module_no
    global current_chat_list
    global current_chat_no
    global current_ask
    data = request.json
    body = list(current_chat_list[current_chat_no]["message"])
    body.append(data["message"])
    if current_module_no == 0:
        result = local_Wen.communicate(body)
        if result:
            current_chat_list[current_chat_no]["message"].append(data["message"])
            current_chat_list[current_chat_no]["message"].append({"role": "assistant","content": result})
            return {"result": result}
        return "connection error"
    elif current_module_no == 1:
        result = local_Tong.communicate(body)
        if result:
            current_chat_list[current_chat_no]["message"].append(data["message"])
            current_chat_list[current_chat_no]["message"].append({"role": "assistant","content": result})
            return {"result": result}
        return "connection error"
    elif current_module_no == 2:
        result = local_Gpt.communicate(body)
        if result:
            current_chat_list[current_chat_no]["message"].append(data["message"])
            current_chat_list[current_chat_no]["message"].append({"role": "assistant","content": result})
            return {"result": result}
        return "connection error"
    elif current_module_no == 3:
        results = {
            "result": ["", "", ""]
        }
        # result = local_Gpt.communicate(body)
        future_to_index = {}
        current_ask = data
        with ThreadPoolExecutor(max_workers=3) as executor:
            future_to_index[executor.submit(local_Gpt.communicate, body)] = 2
            future_to_index[executor.submit(local_Tong.communicate, body)] = 1
            future_to_index[executor.submit(local_Wen.communicate, body)] = 0
            for future in as_completed(future_to_index):
                index = future_to_index[future]
                result = future.result()
                if result:
                    results["result"][index] = result
                    current_response[index] = result
        return results

#        if result:
#            results["result"].append(result)
#            current_response.append(result)
#        result = local_Tong.communicate(body)
#       if result:
#            results["result"].append(result)
#            current_response.append(result)
#        result = local_Wen.communicate(body)
#        if result:
#            results["result"].append(result)
#            current_response.append(result)
#        current_ask = data
        

    else:
        return "module not found"
# {
#     "message":{
#         "role":"user"，
#         "content":""
#     }
# }


@app.route('/Choose_answer', methods=['POST'])
def Choose_answer():
    global current_ask
    global current_response
    global current_chat_list
    global current_chat_no
    if current_ask != {}:
        data = request.json
        if int(data["choice"]) <= len(current_response) - 1:
            print(current_ask)
            current_chat_list[current_chat_no]["message"].append(current_ask["message"])
            current_chat_list[current_chat_no]["message"].append({"role": "assistant", "content": current_response[int(data["choice"])]})
            current_ask = {}
            current_response.clear()
            current_response.append("")
            current_response.append("")
            current_response.append("")
            return "choose success"
        return "choose failed"
    else:
        return "ok"
# {"choice" : "0"}


@app.route('/new_chat', methods=['POST'])
def new_chat():
    current_chat_list.append({"chat_name": "new_chat", "message": []})
    return "ok"


@app.route('/delete_chat', methods=['POST'])
def delete_chat():
    global current_chat_no
    data = request.json
    if int(data["chat_no"]) >= len(current_chat_list):
        return "error"
    if current_chat_no > int(data["chat_no"]):
        current_chat_no = current_chat_no - 1
    elif current_chat_no == int(data["chat_no"]):
        current_chat_no = 0
    del (current_chat_list[int(data["chat_no"])])
    return "ok"
# {
#     "chat_no":"1"
# }


@app.route('/modify_chat_name', methods=['POST'])
def modify_chat_name():
    data = request.json
    if int(data["chat_no"]) >= len(current_chat_list):
        return "error"
    current_chat_list[int(data["chat_no"])]["chat_name"] = data["chat_name"]
    return "ok"
# {
#     "chat_no":"1"
#     "chat_name":""
# }


@app.route('/modify_chat_content', methods=['POST'])
def modify_chat_content():
    data = request.json
    global current_chat_no
    global current_chat_list
    global current_module_no
    global current_ask
    header = {
        "Content-Type": "application/json"
    }
    if (2 * int(data["chat_no"]) + 1) >= len(current_chat_list[current_chat_no]["message"]):
        return "error"
    current_chat_list[current_chat_no]["message"] = current_chat_list[current_chat_no]["message"][0:(2 * int(data["chat_no"]))]
    del data["chat_no"]
    response = requests.post(url="http://127.0.0.1:18081/Chat", data=json.dumps(data), headers=header)
    if current_module_no == 3:
        current_ask = data
    return response.json()
# {
#     "chat_no":"1"
#     "message": [{"role":"","content":""}]
# }


local_Wen = WenXinYiYan()
online_module_name["online_module_name"].append("文心一言")
online_module.append(local_Wen)
local_Tong = TongYiQianWen()
online_module_name["online_module_name"].append("通义千问")
online_module.append(local_Tong)
local_Gpt = Chat_Gpt()
online_module_name["online_module_name"].append("Chat-GPT 3.5")
online_module.append(local_Tong)
online_module_name["online_module_name"].append("综合大模型")
local_chat_file_manager = ChatFileManager()
if __name__ == "__main__":
    CORS(app)
    app.run(host='0.0.0.0', port=18081)
