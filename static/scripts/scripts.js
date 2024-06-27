let inputenable = 0;
let operateenale = 1;

// 封装创建聊天元素的函数
function createChatElement(elementType, className, content, options) {
    const element = document.createElement(elementType);
    element.classList.add(className);
    if (content) {
        const textElement = document.createElement('p');
        textElement.classList.add('question-text');
        textElement.textContent = content;
        element.appendChild(textElement);
    }
    if (options) {
        Object.keys(options).forEach(key => {
            element[key] = options[key];
        });
    }
    return element;
}

// 封装综合大模型回答双击函数
function Set_answer_dblclick(answerText, newAnswer, index)
{
    answerText.addEventListener('dblclick', function(){
        fetch('http://127.0.0.1:18081/Choose_answer', {
            method: 'POST', // 假设这是一个GET请求，根据实际情况可能需要设置为POST或其他
            headers: {
                'Content-Type': 'application/json',
                // 根据需要添加其他headers
            },
            body: JSON.stringify({ choice: String(this.dataset.index) })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response;
            }).then(data=>{
                if(index == 0)
                {
                    var nextele = newAnswer.nextSibling;
                    while(nextele)
                    {
                        var tmp = nextele.nextSibling;
                        nextele.remove();
                        nextele = tmp;
                    }
                }
                else
                {
                    var nextele = newAnswer;
                    while(nextele)
                    {
                        var tmp = nextele.nextSibling;
                        if(nextele.lastChild.dataset.index != this.dataset.index)
                        {
                            nextele.remove();
                        }
                        nextele = tmp;
                    }
                }
                
            })
            operateenale = 1;
    })
}


function Choose_answer(data, answerText, newAnswer, chat_flag)
{
    var arrayLength = data.result.length;
    console.log("数组的长度是:", arrayLength);

    // 遍历数组元素
    data.result.forEach(function(item, index) {
        console.log("元素索引:", index, "元素值:", item);
        if(index == 0)
        {
            console.log(answerText);
            answerText.innerHTML = marked.parse(item);
            answerText.dataset.index = index;
            if(chat_flag)
                Set_answer_dblclick(answerText, newAnswer, index);
        }
        else
        {
            const newAns = document.createElement('div');
            newAns.classList.add('answer');
            const ansText = document.createElement('p');
            ansText.classList.add('answer-text');
            //answerText.textContent = "请稍等，正在处理中...";
            ansText.innerHTML = marked.parse(item);
            ansText.dataset.index = index;
            const avatar_a = document.createElement('img');
            //avatar_a.src = "{{ url_for('static', filename='images/ai.jpg') }}"; // 设置头像图片路径
            avatar_a.src = 'static/images/ai.jpg'; // 设置头像图片路径
            avatar_a.style.width = '50px'; // 设置宽度为50像素
            avatar_a.style.height = '50px'; // 高度自动调整，保持宽高比
            newAns.appendChild(avatar_a);
            newAns.appendChild(ansText);
            Set_answer_dblclick(ansText, newAnswer, index);
            document.getElementById('chat-window').appendChild(newAns);
        }
        // 在这里你可以访问每个数组元素，变量 item 是当前遍历到的元素
    });
}

function modify_chat_content(nextanswer, answerText, dbclickedIndex, newTitle)
{
    fetch('http://127.0.0.1:18081/modify_chat_content', {
        method: 'POST', // 假设这是一个GET请求，根据实际情况可能需要设置为POST或其他
        headers: {
            'Content-Type': 'application/json',
            // 根据需要添加其他headers
        },
        body: JSON.stringify({ chat_no: String(dbclickedIndex) , message:{role: 'user',content: newTitle} })
        })
        .then(response => {
            if (!response.ok) {
                nextanswer.lastChild.textContent = "network error";
                throw new Error('Network response was not ok');
            }
            return response.json();            
        }).then(data=>{
            if(Array.isArray(data.result))
            {
                operateenale = 0;
                Choose_answer(data, answerText, nextanswer, false);
            }
            else
            {
                nextanswer.lastChild.innerHTML = marked.parse(data.result);
            }
            var container1 = document.getElementById('chat-window');
            container1.scrollTop = container1.scrollHeight;
        }).catch(error => {
            answerText.textContent = "发生错误，请重试。"
        });
}

function modify_chat_name(dbclickedIndex, newTitle)
{
    fetch('http://127.0.0.1:18081/modify_chat_name', {
                method: 'POST', // 假设这是一个GET请求，根据实际情况可能需要设置为POST或其他
                headers: {
                    'Content-Type': 'application/json',
                    // 根据需要添加其他headers
                },
                body: JSON.stringify({ chat_no: String(dbclickedIndex) , chat_name: newTitle})
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                })
}

//1.双击chat块的标题时，修改标题内容并向后端提交修改后的标题内容
//2.双击提问块时，修改提问内容并向后端提交修改后的标题内容
function replace_text(newQuestion, questionText, func)
{
        var originalTitle = questionText.textContent;
        var dbclickedIndex = questionText.parentNode.dataset.index;
        var titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.value = originalTitle; // 设置输入框的初始值为h2的文本
        titleInput.style.width = questionText.offsetWidth + 'px'; // 设置输入框的宽度与h2相同
        titleInput.style.margin = '0'; // 重置边距
        titleInput.style.padding = '0'; // 重置内边距
        titleInput.style.backgroundColor = 'gray';
        titleInput.style.color = "white";
        // 替换h2标签为输入框
        questionText.replaceWith(titleInput);
        titleInput.focus();
        var newTitle;
        // 为输入框添加失去焦点事件，更新标题
        titleInput.addEventListener('blur', function() {
            // 更新h2标签的内容为输入框的值
            newTitle = titleInput.value.trim();
            if (newTitle) {
                questionText.textContent = newTitle;
            }
            else {
                questionText.textContent = originalTitle;
            }
            // 重新将输入框替换为h2标签
            // 检查 newChatBox 是否至少有一个子节点
            if(func == 'modify_chat_content')
                newQuestion.appendChild(questionText);
            else if(func == 'modify_chat_name')
            {
                if (newQuestion.firstChild) {
                    // 将 title 插入到第一个子节点之前
                    newQuestion.insertBefore(questionText, newQuestion.firstChild);
                } else {
                    // 如果 newChatBox 没有子节点，就直接添加 title
                    newQuestion.appendChild(questionText);
                }
            }
            titleInput.style.display = 'none';
            titleInput.value = ''; // 清空输入框
        });
        // 为输入框添加键盘事件，以便在按下Enter键时更新标题
        titleInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // 阻止表单提交默认行为
                titleInput.blur(); // 触发失去焦点事件，更新标题
                if(func == 'modify_chat_content')
                {
                    var chatwin = document.getElementById('chat-window');
                    var Index = 2 * dbclickedIndex + 1;
                    var nextanswer = chatwin.children[Index];
                    nextanswer.lastChild.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 请稍等，正在处理中...';
                    // 确保 startIndex 是有效的
                    if (Index >= 0 && Index < chatwin.children.length) {
                        // 从 startIndex 开始删除所有子元素
                        for (var i = chatwin.children.length - 1; i > Index; i--) {
                            chatwin.removeChild(chatwin.children[i]);
                        }
                    }
                    var answerText = nextanswer.lastChild;
                    modify_chat_content(nextanswer, answerText, dbclickedIndex, newTitle);
                }
            
            else if(func == 'modify_chat_name')
                modify_chat_name(dbclickedIndex, newTitle);
            }
        })
            
}

// 交互、修改
function send_handler(){
    const userInput = document.getElementById('user-input').value;
    if (userInput.trim() !== "") {
        const newQuestion = createChatElement('div', 'question', userInput);
        const newAnswer = createChatElement('div', 'answer');
        var chatwinIndex = Array.from(document.querySelectorAll('.question')).length;
        newQuestion.dataset.index = chatwinIndex;

        var questionTexts = newQuestion.getElementsByTagName('p');
        const questionText = questionTexts[0];

        questionText.addEventListener('dblclick', function(){
            replace_text(newQuestion, questionText, 'modify_chat_content');
        })
        const answerText = document.createElement('p');
        answerText.classList.add('answer-text');
        //answerText.textContent = "请稍等，正在处理中...";
        answerText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 请稍等，正在处理中...';
        const avatar_a = document.createElement('img');
        avatar_a.src = 'static/images/ai.jpg'; // 设置头像图片路径
        avatar_a.style.width = '50px'; // 设置宽度为50像素
        avatar_a.style.height = '50px'; // 高度自动调整，保持宽高比

        const avatar_q = document.createElement('img');
        avatar_q.src = 'static/images/human.jpg';
        avatar_q.style.width = '50px'; // 设置宽度为50像素
        avatar_q.style.height = '50px'; // 高度自动调整，保持宽高比
        
        newQuestion.appendChild(avatar_q);
        newQuestion.appendChild(questionText);
        
        newAnswer.appendChild(avatar_a);
        newAnswer.appendChild(answerText);
        
        document.getElementById('chat-window').appendChild(newQuestion);
        document.getElementById('chat-window').appendChild(newAnswer);
        document.getElementById('user-input').value = '';

        //自动滚动功能
        var container1 = document.getElementById('chat-window');
        container1.scrollTop = container1.scrollHeight;

        fetch('http://127.0.0.1:18081/Chat', {
            method: 'POST', // 假设这是一个GET请求，根据实际情况可能需要设置为POST或其他
            headers: {
                'Content-Type': 'application/json',
                // 根据需要添加其他headers
            },
            body: JSON.stringify({ message: {role: 'user',content: userInput} })
            })
            .then(response => {
                // console.log(response.body.value);
                console.log(response);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            }).then(data => {
                console.log(data);
                
                if(Array.isArray(data.result))
                {
                    operateenale = 0;  // 多个结果时，必须要选择回答之后才能继续提问
                    Choose_answer(data, answerText, newAnswer, true);
                }
                else
                {
                    answerText.innerHTML = marked.parse(data.result);
                    //answerText.innerHTML = data.result;
                }
                console.log(data.result);
                container1.scrollTop = container1.scrollHeight;
            }).catch(error => {
                answerText.textContent = "发生错误，请重试。"
            })

    }
}



document.getElementById('user-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.ctrlKey) {
        if(inputenable == 0 || operateenale ==0){
            showToast();
        }
        else{
            event.preventDefault(); // 阻止默认的回车键行为，如换行或表单提交
            send_handler();
        }
      }

    else if (event.key === 'Enter' && event.ctrlKey) {
        var input = document.getElementById('user-input');
        var value = input.value;
        var caretPosition = input.selectionStart;

        // 插入换行符
        input.value = value.substring(0, caretPosition) + '\n' + value.substring(caretPosition);

        // 调整光标位置，使其保持在原来的行
        input.selectionStart = input.selectionEnd = caretPosition + 1;

        event.preventDefault(); // 阻止默认的换行行为
      }
   });

document.getElementById('send-button').addEventListener('click', function(){
    if(inputenable == 0 || operateenale ==0){
        showToast();
}
    else{
        send_handler()
}
});

var chatBoxes = document.querySelectorAll('.chat-box');
document.getElementById('add-conversation').addEventListener('click', function() {
    // 创建一个新的对话框元素
    fetch('http://127.0.0.1:18081/new_chat', {
        method: 'POST', // 假设这是一个GET请求，根据实际情况可能需要设置为POST或其他
        headers: {
            'Content-Type': 'application/json',
            // 根据需要添加其他headers
        },
        body: JSON.stringify({ chat_no: '0' })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        })
    createChatBoxes("new_chat");
});


// 创建、修改、删除、重新加载
function createChatBoxes(chatname) {
        var newChatBox = document.createElement('div');
        newChatBox.classList.add('chat-box');
        var chatBoxIndex = Array.from(document.querySelectorAll('.chat-box')).length;
        newChatBox.dataset.index = chatBoxIndex;
        // 添加标题
        var title = document.createElement('h2');
        title.textContent = chatname; //TODO:放置对话内容节选
        newChatBox.appendChild(title);
        const inputBox = document.getElementById('user-input');
        title.addEventListener('click', function() {
            operateenale = 1;
            inputenable = 1;
            var clickedIndex = this.parentNode.dataset.index;
            chatBoxes.forEach(function(box) {
                box.style.backgroundColor = '';
                // 如果 box 包含标题按钮，则也重置标题按钮的背景颜色
                var titleButton = box.querySelector('button');
                if (titleButton) {
                    console.log("has button")
                    titleButton.style.backgroundColor = '';
                }
                var titletxt = box.querySelector('h2');
                if (titletxt) {
                    console.log("has txt")
                    titletxt.style.backgroundColor = '';
                }
            });
            this.style.backgroundColor = 'gray';
            newChatBox.style.backgroundColor = 'gray';
            this.parentNode.lastChild.style.backgroundColor = 'gray';
            fetch('http://127.0.0.1:18081/change_current_chat', {
                method: 'POST', // 假设这是一个GET请求，根据实际情况可能需要设置为POST或其他
                headers: {
                    'Content-Type': 'application/json',
                    // 根据需要添加其他headers
                },
                body: JSON.stringify({ current_chat_no: String(clickedIndex) })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    var chat_window = document.querySelector('#chat-window');
                    var firstChatwinele = chat_window.firstChild;
                    while (firstChatwinele) {
                    var nextEle = firstChatwinele.nextElementSibling;
                    chat_window.removeChild(firstChatwinele);
                    firstChatwinele = nextEle;
                }
                return response.json();
                })
                .then(data=>{
                    console.log(data.message);
                    data.message.forEach(element => {  
                        if (element.role == 'user'){
                            const newQuestion = createChatElement('div', 'question', element.content);

                            var chatwinIndex = Array.from(document.querySelectorAll('.question')).length;
                            newQuestion.dataset.index = chatwinIndex;
                            
                            var questionTexts = newQuestion.getElementsByTagName('p');
                            const questionText = questionTexts[0];

                            const avatar_q = document.createElement('img');
                            avatar_q.src = 'static/images/human.jpg'; // 设置头像图片路径
                            avatar_q.style.width = '50px'; // 设置宽度为50像素
                            avatar_q.style.height = '50px'; // 高度自动调整，保持宽高比
                            newQuestion.appendChild(avatar_q);
                            newQuestion.appendChild(questionText);

                            questionText.addEventListener('dblclick', function(){
                                replace_text(newQuestion, questionText, 'modify_chat_content');
                            })
                            document.getElementById('chat-window').appendChild(newQuestion);
                        }
                        else
                        {
                            const newAnswer = document.createElement('div');
                            newAnswer.classList.add('answer'); 
                            const answerText = document.createElement('p');
                            answerText.classList.add('answer-text');
                            answerText.innerHTML = marked.parse(element.content);   
                            const avatar_a = document.createElement('img');
                            avatar_a.src = 'static/images/ai.jpg'; // 设置头像图片路径
                            avatar_a.style.width = '50px'; // 设置宽度为50像素
                            avatar_a.style.height = '50px'; // 高度自动调整，保持宽高比
                            newAnswer.appendChild(avatar_a);
                            newAnswer.appendChild(answerText);
                            document.getElementById('chat-window').appendChild(newAnswer);
                        }
                        var container1 = document.getElementById('chat-window');
                        container1.scrollTop = container1.scrollHeight;
                    });
                })
        });
    
        // 为chat-box添加双击事件监听器
        title.addEventListener('dblclick', function() {
            replace_text(newChatBox, title, 'modify_chat_name');
        });

        // 添加关闭按钮
        var closeButton = document.createElement('button');
        closeButton.textContent = '×';
        
        closeButton.addEventListener('click', function() {
            var closedIndex = this.parentNode.dataset.index;
            console.log(this.parentNode.dataset.index);
            fetch('http://127.0.0.1:18081/delete_chat', {
                method: 'POST', // 假设这是一个GET请求，根据实际情况可能需要设置为POST或其他
                headers: {
                    'Content-Type': 'application/json',
                    // 根据需要添加其他headers
                },
                body: JSON.stringify({ chat_no: String(closedIndex) })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                var nextchatbox = newChatBox.nextSibling;
                while(nextchatbox){
                    nextchatbox.dataset.index = nextchatbox.dataset.index - 1;
                    nextchatbox = nextchatbox.nextSibling;
                }
                newChatBox.remove(); 
                })

                if(clickedIndex == closedIndex){
                    // 删除聊天界面中的内容，并设置inputenable为0
                    var chatwin = document.getElementById('chat-window');
                    var chatwin_children = chatwin.firstChild;
                    while(chatwin_children) {
                        chatwin.removeChild(chatwin_children);
                        chatwin_children = chatwin.firstChild;
                    } 
                    inputenable = 0;
                }
                
                
        });
        title.appendChild(closeButton);
        // // 添加关闭按钮
        newChatBox.appendChild(closeButton);
        // 获取 <div class="sidebar-section2"> 元素并将新建的对话框添加为其子元素
        var sidebarSection2 = document.querySelector('.sidebar-section2');
        sidebarSection2.appendChild(newChatBox);
        chatBoxes = document.querySelectorAll('.chat-box');
}

function showToast() {
    if(inputenable == 0){alert('请选择模型和对话！');}
    if(operateenale == 0){alert('请选择回答！');}
    
}