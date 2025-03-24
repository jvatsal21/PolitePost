let state = {
    editable: null,
    echoBox: null,
    listener: null,
    commentText: ''
  };
  let debounceTimer;
  
  async function getChatGPTResponse(draftText, originalComment) {
    
    // TODO: Replace API key
    const apiKey = 'OPENAI_API_KEY';
    const url = 'https://api.openai.com/v1/chat/completions';
    const requestBody = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a reddit moderator bot. You are a helpful assistant that reviews users comments and suggests better replies.' },
        {
          role: 'user',
          content: `
  Provide a revised reply that is more polite, constructive, or humorous. Output only the revised comment text without any additional labels, explanations, or quotation marks.

  Lets say a thread looks like this:

  User1: "I got an A on my exam"

  User2: "I bet that exam was easy"

  User1 looks to comment "I bet you have no friends". You should respond with something like "Easy or not, I got an A"

  End of example.
  
  Here is the comment: "${originalComment}"
  
  This is the user's draft reply: "${draftText}"
          `.trim()
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    };
  
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
  
    if (data.error) {
      console.error('OpenAI API Error:', data.error);
      throw new Error(data.error.message);
    }
    
    return data.choices[0].message.content
           .trim()
           .replace(/^"+|"+$/g, '');
  }
  
  function getParentCommentText(editable) {
    let current = editable;

    while (current && current.nodeName.toLowerCase() !== 'shreddit-comment-action-row') {
        current = current.parentElement;
    }

    if (!current) {
        console.warn("shreddit-comment-action-row not found");
        return null;
    }

    console.log(current.nodeName);

    let previousSibling = current.previousElementSibling;
    previousSibling = previousSibling.previousElementSibling;

    if (!previousSibling) {
        console.warn("Previous sibling not found");
        return null;
    }
    console.log(previousSibling.nodeName);


    const paragraphs = previousSibling.querySelectorAll('p');
    let textContents = "";

    paragraphs.forEach(p => {
        textContents += p.textContent.trim() + " ";
      });

    console.log(textContents);
    return textContents;
  }
  
  document.addEventListener('focusin', (e) => {
    const editable = e.composedPath().find((el) =>
      el.nodeType === 1 &&
      (el.getAttribute('contenteditable') === 'true' || el.tagName === 'TEXTAREA')
    );
    if (!editable || editable === state.editable) return;
    cleanup();
  
    const commentText = getParentCommentText(editable);
  
    const echoBox = document.createElement('div');
    echoBox.tabIndex = 0;
    Object.assign(echoBox.style, {
      display: 'block',
      minHeight: '1.2em',
      margin: '8px 0',
      padding: '8px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontStyle: 'italic',
      color: '#555',
      backgroundColor: '#fafafa',
      width: '100%',
      cursor: 'pointer',
    });
  
    echoBox.addEventListener('click', () => {
      const refinedText = echoBox.textContent;
  
      if (editable.tagName === 'TEXTAREA') {
        editable.value = refinedText;
      } else if (editable.isContentEditable) {
        const span = editable.querySelector('[data-lexical-text="true"]');
        if (span) {
          span.textContent = refinedText;
        } else {
          editable.innerText = refinedText;
        }
      }
  
      editable.focus();
      editable.dispatchEvent(new InputEvent('input', { bubbles: true }));
      cleanup();
    });
  
    editable.parentElement.insertAdjacentElement('afterend', echoBox);
  
    const update = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
  
      const content = editable.matches('textarea') ? editable.value : editable.innerText;
  
      echoBox.textContent = "";
  
      debounceTimer = setTimeout(() => {
        echoBox.textContent = 'Thinking...';
        const currentContent = editable.matches('textarea') ? editable.value : editable.innerText;
  
        getChatGPTResponse(currentContent, commentText)
          .then((response) => {
            echoBox.textContent = response;
          })
          .catch((err) => {
            echoBox.textContent = 'Error fetching response';
            console.error(err);
          });
      }, 1000);
    };
  
    editable.addEventListener('input', update);
    editable.addEventListener('keyup', update);
    update();
  
    state = { editable, echoBox, listener: update, commentText };
  });
  
  document.addEventListener('focusout', (e) => {
    if (state.editable && e.composedPath().includes(state.editable)) {
      if (e.relatedTarget === state.echoBox) return;
      cleanup();
    }
  });
  
  function cleanup() {
    if (state.editable) {
      state.editable.style.border = '';
      state.editable.removeEventListener('input', state.listener);
      state.editable.removeEventListener('keyup', state.listener);
    }
    if (state.echoBox?.parentNode) state.echoBox.remove();
    if (debounceTimer) clearTimeout(debounceTimer);
    state = { editable: null, echoBox: null, listener: null, commentText: '' };
  }
  