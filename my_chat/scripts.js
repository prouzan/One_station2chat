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
});

document.getElementById('add-conversation').addEventListener('click', function() {
    alert('新建对话模块功能待实现');
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
