let state = {
    editable: null,
    echoBox: null,
    listener: null,
    commentText: '',
    titleText: '',
    titlePost: ''
  };
  let debounceTimer;
  
  async function getChatGPTResponse(draftText, originalComment, titleText, titlePost) {
    // TODO: Replace API key
    const apiKey = 'OPENAI_API_KEY';
    const url = 'https://api.openai.com/v1/chat/completions';
    const requestBody = {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `
      You are a helpful assistant that revises user-submitted Reddit comment drafts. You do NOT reply to the original post or comment; you only produce a redrafted version of the user’s text. You aim to remove or reduce hateful, rude, or confrontational language while preserving the user’s original intent. Output only the revised text without any additional commentary, labels, or quotation marks.
          `
          },
          {
            role: 'user',
            content: `
      A user has typed a draft reply to a Reddit comment or post. Your job is to provide a revised version that is more polite, constructive, or humorous, in order to reduce potential harm or negativity.
      
      Remember:
      1. **Do not** reply directly to the original comment.
      2. **Do not** produce anything beyond the revised text.
      3. **Do not** change the user’s original intention.
      4. **Do not** include any extra explanations, disclaimers, or quotation marks in your output.
      
      Here is the context (you may use it for background only, but do not respond to it):
      - Post title: "${titleText}"
      - Post text: "${titlePost}"
      - Original comment on post: "${originalComment}"
      
      User's draft reply that needs revision:
      "${draftText}"
      
      Now, provide the edited version (and nothing else):
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

  function getPost() {
    const title = document.querySelector('shreddit-title');
    const titleText = title.getAttribute('title');
    console.log(titleText);
    return titleText;
  }

  function getPostText() {
    const postObject = document.querySelector('shreddit-post');
    const neutralDiv = postObject.querySelector('div.text-neutral-content');

    const paragraphs = neutralDiv.querySelectorAll('p');
    let allText = '';

    paragraphs.forEach((p) => {
        allText += p.textContent + ' ';
    });

    console.log(allText.trim());
    return allText;
  }
  
  document.addEventListener('focusin', (e) => {
    const editable = e.composedPath().find((el) =>
      el.nodeType === 1 &&
      (el.getAttribute('contenteditable') === 'true' || el.tagName === 'TEXTAREA')
    );
    if (!editable || editable === state.editable) return;
    cleanup();
    
    const titleText = getPost()
    const titlePost = getPostText()
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
  
        getChatGPTResponse(currentContent, commentText, titleText, titlePost)
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
  