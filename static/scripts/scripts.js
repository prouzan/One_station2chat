function send_handler(){
    const userInput = document.getElementById('user-input').value;
    if (userInput.trim() !== "") {
        const newQuestion = document.createElement('div');
        newQuestion.classList.add('question');
        var chatwinIndex = Array.from(document.querySelectorAll('.question')).length;
        newQuestion.dataset.index = chatwinIndex;

        const newAnswer = document.createElement('div');
        newAnswer.classList.add('answer');

        const questionText = document.createElement('p');
        questionText.classList.add('question-text');
        questionText.textContent = userInput;
        questionText.addEventListener('dblclick', function(){
            var originalTitle = questionText.textContent;
            var dbclickedIndex = this.parentNode.dataset.index;
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
                newQuestion.appendChild(questionText);
                titleInput.style.display = 'none';
                titleInput.value = ''; // 清空输入框
            });
            // 为输入框添加键盘事件，以便在按下Enter键时更新标题
            titleInput.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
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
                event.preventDefault(); // 阻止表单提交默认行为
                titleInput.blur(); // 触发失去焦点事件，更新标题
                fetch('http://127.0.0.1:18081/modify_chat_content', {
                method: 'POST', // 假设这是一个GET请求，根据实际情况可能需要设置为POST或其他
                headers: {
                    'Content-Type': 'application/json',
                    // 根据需要添加其他headers
                },
                body: JSON.stringify({ chat_no: String(dbclickedIndex) , message:{role: 'user',content:newTitle} })
                })
                .then(response => {
                    if (!response.ok) {
                        nextanswer.lastChild.textContent = "network error";
                        throw new Error('Network response was not ok');
                    }
                    return response.json();            
                }).then(data=>{
                    nextanswer.lastChild.textContent = data.result;
                })
                }
            });
        })
        const answerText = document.createElement('p');
        answerText.classList.add('answer-text');
        //answerText.textContent = "请稍等，正在处理中...";
        answerText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 请稍等，正在处理中...';
        const avatar_a = document.createElement('img');
        //avatar_a.src = "{{ url_for('static', filename='images/ai.jpg') }}"; // 设置头像图片路径
        avatar_a.src = 'static/images/ai.jpg'; // 设置头像图片路径
        avatar_a.style.width = '50px'; // 设置宽度为50像素
        avatar_a.style.height = '50px'; // 高度自动调整，保持宽高比

        const avatar_q = document.createElement('img');
        //avatar_q.src = "{{ url_for('static', filename='images/human.jpg') }}"; // 设置头像图片路径
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
                //let text = data.result;

                // 替换换行符和制表符
                //text = text.replace(/\n/g, '<br>'); // 将换行符替换为 <br> 标签
                //text = text.replace(/\t/g, '&emsp;'); // 将制表符替换为 HTML 实体或空格

                // 设置文本内容到 HTML 元素
                //answerText.innerHTML = text;
                answerText.textContent = data.result;
            }).catch(error => {
                answerText.textContent = "发生错误，请重试。"
            })
    }
}

document.getElementById('send-button').addEventListener('click', send_handler());
document.getElementById('user-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.ctrlKey) {
        event.preventDefault(); // 阻止默认的回车键行为，如换行或表单提交
        send_handler();
      }

    if (event.key === 'Enter' && event.ctrlKey) {
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

function createChatBoxes(chatname) {
        var newChatBox = document.createElement('div');
        newChatBox.classList.add('chat-box');
        var chatBoxIndex = Array.from(document.querySelectorAll('.chat-box')).length;
        newChatBox.dataset.index = chatBoxIndex;
        // 添加标题
        var title = document.createElement('h2');
        title.textContent = chatname; //TODO:放置对话内容节选
        newChatBox.appendChild(title);

        title.addEventListener('click', function() {
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
                            const newQuestion = document.createElement('div');
                            newQuestion.classList.add('question');

                            var chatwinIndex = Array.from(document.querySelectorAll('.question')).length;
                            newQuestion.dataset.index = chatwinIndex;

                            const questionText = document.createElement('p');
                            questionText.classList.add('question-text');
                            questionText.textContent = element.content;
                            const avatar_q = document.createElement('img');
                            avatar_q.src = 'static/images/human.jpg'; // 设置头像图片路径
                            avatar_q.style.width = '50px'; // 设置宽度为50像素
                            avatar_q.style.height = '50px'; // 高度自动调整，保持宽高比
                            //avatar_q.style.alignSelf = 'flex-end';
                            //newQuestion.appendChild(questionText);
                            newQuestion.appendChild(avatar_q);
                            newQuestion.appendChild(questionText);

                            questionText.addEventListener('dblclick', function(){
                                var originalTitle = questionText.textContent;
                                var dbclickedIndex = this.parentNode.dataset.index;
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
/*                                    if (newTitle.classList.firstChild) {
                                        // 将 title 插入到第一个子节点之前
                                        newTitle.classList.insertBefore(questionText, newTitle.classList.firstChild);
                                    } else {
                                        // 如果 newChatBox 没有子节点，就直接添加 title
                                        newTitle.classList.appendChild(questionText);
                                    }*/
                                    // 隐藏输入框
                                    newQuestion.appendChild(questionText);
                                    titleInput.style.display = 'none';
                                    titleInput.value = ''; // 清空输入框
                                });
                                
                                // 为输入框添加键盘事件，以便在按下Enter键时更新标题
                                titleInput.addEventListener('keydown', function(event) {
                                    if (event.key === 'Enter') {
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
                                    event.preventDefault(); // 阻止表单提交默认行为
                                    titleInput.blur(); // 触发失去焦点事件，更新标题
                                    fetch('http://127.0.0.1:18081/modify_chat_content', {
                                    method: 'POST', // 假设这是一个GET请求，根据实际情况可能需要设置为POST或其他
                                    headers: {
                                        'Content-Type': 'application/json',
                                        // 根据需要添加其他headers
                                    },
                                    body: JSON.stringify({ chat_no: String(dbclickedIndex) , message:{role: 'user',content:newTitle} })
                                    })
                                    .then(response => {
                                        if (!response.ok) {
                                            nextanswer.lastChild.textContent = "network error";
                                            throw new Error('Network response was not ok');
                                        }
                                        return response.json();
                                    }).then(data=>{
                                        console.log(data);
                                        nextanswer.lastChild.textContent = data.result;
                                    })
                                    }
                                });
                            })
                            document.getElementById('chat-window').appendChild(newQuestion);
                        }
                        else
                        {
                            const newAnswer = document.createElement('div');
                            newAnswer.classList.add('answer'); 
                            const answerText = document.createElement('p');
                            answerText.classList.add('answer-text');
                            answerText.textContent = element.content;   
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
            var originalTitle = title.textContent;
            var dbclickedIndex = this.parentNode.dataset.index;
            var titleInput = document.createElement('input');
            titleInput.type = 'text';
            titleInput.value = originalTitle; // 设置输入框的初始值为h2的文本
            titleInput.style.width = title.offsetWidth + 'px'; // 设置输入框的宽度与h2相同
            titleInput.style.margin = '0'; // 重置边距
            titleInput.style.padding = '0'; // 重置内边距
            titleInput.style.backgroundColor = 'gray';
            titleInput.style.color = "white";
            // 替换h2标签为输入框
            title.replaceWith(titleInput);
            var newTitle;
            // 为输入框添加失去焦点事件，更新标题
            titleInput.addEventListener('blur', function() {
                // 更新h2标签的内容为输入框的值
                newTitle = titleInput.value.trim();
                if (newTitle) {
                    title.textContent = newTitle;
                }
                else {
                    title.textContent = originalTitle;
                }
                // 重新将输入框替换为h2标签
                // 检查 newChatBox 是否至少有一个子节点
                if (newChatBox.firstChild) {
                    // 将 title 插入到第一个子节点之前
                    newChatBox.insertBefore(title, newChatBox.firstChild);
                } else {
                    // 如果 newChatBox 没有子节点，就直接添加 title
                    newChatBox.appendChild(title);
                }
                // 隐藏输入框
                titleInput.style.display = 'none';
                titleInput.value = ''; // 清空输入框
            });
            
            // 为输入框添加键盘事件，以便在按下Enter键时更新标题
            titleInput.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                event.preventDefault(); // 阻止表单提交默认行为
                titleInput.blur(); // 触发失去焦点事件，更新标题
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
            });
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
        });
        title.appendChild(closeButton);
        // // 添加关闭按钮
        // var chan_name_Button = document.createElement('button');
        // chan_name_Button.textContent = '×';
        newChatBox.appendChild(closeButton);
        // 获取 <div class="sidebar-section2"> 元素并将新建的对话框添加为其子元素
        var sidebarSection2 = document.querySelector('.sidebar-section2');
        sidebarSection2.appendChild(newChatBox);
        chatBoxes = document.querySelectorAll('.chat-box');
}