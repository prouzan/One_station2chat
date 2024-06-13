document.getElementById('send-button').addEventListener('click', function() {
    const userInput = document.getElementById('user-input').value;
    if (userInput.trim() !== "") {
        const newQuestion = document.createElement('div');
        newQuestion.classList.add('question');
        
        const questionText = document.createElement('p');
        questionText.classList.add('question-text');
        questionText.textContent = userInput;
        
        const answerText = document.createElement('p');
        answerText.classList.add('answer-text');
        answerText.textContent = "请稍等，正在处理中...";
        
        newQuestion.appendChild(questionText);
        newQuestion.appendChild(answerText);
        
        document.getElementById('chat-window').appendChild(newQuestion);
        
        document.getElementById('user-input').value = '';
        
        // Here you can add the functionality to send the question to the backend and get the answer
        // For example:
        // fetch('/api/getAnswer', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ question: userInput })
        // }).then(response => response.json())
        // .then(data => {
        //     answerText.textContent = data.answer;
        // }).catch(error => {
        //     answerText.textContent = "发生错误，请重试。";
        // });
    }
});
/*

document.getElementById('add-model').addEventListener('click', function() {
    const modelSection = document.getElementById('model-section');
    
    const modelBox = document.createElement('div');
    modelBox.classList.add('model-box');
    
    const modelInput = document.createElement('input');
    modelInput.type = 'text';
    modelInput.value = '新模型';
    modelInput.readOnly = true;
    
    const editButton = document.createElement('button');
    editButton.textContent = '修改';
    editButton.addEventListener('click', function() {
        modelInput.readOnly = !modelInput.readOnly;
        if (modelInput.readOnly) {
            editButton.textContent = '修改';
        } else {
            editButton.textContent = '保存';
        }
    });
    
    modelBox.appendChild(modelInput);
    modelBox.appendChild(editButton);
    modelSection.appendChild(modelBox);
});*/
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
    var newChatBox = document.createElement('div');
    newChatBox.classList.add('chat-box');
    var chatBoxIndex = Array.from(document.querySelectorAll('.chat-box')).length;
    newChatBox.dataset.index = chatBoxIndex;
    // 添加标题
    var title = document.createElement('botton');
    title.textContent = 'new_chat'; //TODO:放置对话内容节选
    newChatBox.appendChild(title);
    
    title.addEventListener('click', function() {
        var clickedIndex = this.parentNode.dataset.index;
        chatBoxes.forEach(function(box) {
            box.style.backgroundColor = '';
            // 如果 box 包含标题按钮，则也重置标题按钮的背景颜色
            var titleButton = box.querySelector('botton');
            if (titleButton) {
                console.log("has title")
                titleButton.style.backgroundColor = '';
            }
        });
        this.style.backgroundColor = 'gray';
        newChatBox.style.backgroundColor = 'gray';
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
            })
    });

    // 添加关闭按钮
    var closeButton = document.createElement('button');
    closeButton.textContent = '×';
    
    closeButton.addEventListener('click', function() {
        var closedIndex = this.parentNode.parentNode.dataset.index;
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
            newChatBox.remove(); 
            })
    });
    title.appendChild(closeButton);
    
    // 获取 <div class="sidebar-section2"> 元素并将新建的对话框添加为其子元素
    var sidebarSection2 = document.querySelector('.sidebar-section2');
    sidebarSection2.appendChild(newChatBox);
    chatBoxes = document.querySelectorAll('.chat-box');
});



document.getElementById('send-button').addEventListener('click', function() {
    const userInput = document.getElementById('user-input').value;
    if (userInput.trim() !== "") {
        const newQuestion = document.createElement('div');
        newQuestion.classList.add('question');
        
        const questionText = document.createElement('p');
        questionText.classList.add('question-text');
        questionText.textContent = userInput;
        
        const answerText = document.createElement('p');
        answerText.classList.add('answer-text');
        answerText.textContent = "请稍等，正在处理中...";
        
        newQuestion.appendChild(questionText);
        newQuestion.appendChild(answerText);
        
        document.getElementById('chat-window').appendChild(newQuestion);
        
        document.getElementById('user-input').value = '';
        
        // Here you can add the functionality to send the question to the backend and get the answer
        // For example:
        // fetch('/api/getAnswer', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ question: userInput })
        // }).then(response => response.json())
        // .then(data => {
        //     answerText.textContent = data.answer;
        // }).catch(error => {
        //     answerText.textContent = "发生错误，请重试。";
        // });
    }
});
