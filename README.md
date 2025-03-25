# PolitePost: Your AI-Powered Reddit Reply Buddy
This Chrome extension seamlessly integrates with Reddit, providing suggested replies to help users write kinder, more considerate comments in real-time.

## Overview
This extension monitors the comments or replies you're typing on Reddit. If your comment might appear potentially negative, confrontational, or hurtful, the extension quickly generates a polite, corrected alternative suggestion using GPT-4o-mini. You can easily replace your original comment with the suggested one by clicking on it.

## Demo
Here is a link to a demo: [View Demo](https://drive.google.com/file/d/1lb3FHTpF1QsMIUEyIYyrET16jwwtznFB/view?usp=sharing)

## Features
- Real-time, context-aware reply suggestions
- Easy-to-use UI integrated directly into Reddit's interface
- Dynamic suggestions that adapt instantly as you edit your comment

## Why Use This Extension?
- **Avoid Unintentional Negativity:** Make sure your replies don't unintentionally come across as mean or confrontational
- **Improve Clarity and Grammar:** Receive instant grammar corrections to enhance the readability and professionalism of your comments
- **Promote Positive Online Interactions:** Foster healthier and more respectful discussions on Reddit by consistently choosing kinder responses.

## Setup Instructions
### Prerequisites
- Google Chrome Browser
### Installation
1. **Clone the repository:**
```
$ git clone https://github.com/jvatsal21/PolitePost
```
2. **Navigate to the project directory:**
```
$ cd PolitePost
```
3. **Replace the API Key:**
   - Open `extension/content.js`
   - Replace `OPENAI_API_KEY` with your own OpenAI API Key
4. **Load the extension into Chrome:**
   - Go to `chrome://extensions` in your Chrome browser
   - Enable "Developer mode" (toggle in the top right corner)
   - Click "Load unpacked" and select the extension folder (`extension`)
## Usage
- Navigate to Reddit and start typing a comment or reply
- A suggested reply box will appear in real-time below your comment
- Click on the suggestion to replace your current draft with a kinder alternative

## Contributors

- Vatsal Joshi, M.S. University of Michigan ([link](https://github.com/jvatsal21))
- Omkar Yadav, M.S. University of Michigan ([link](https://github.com/omkar-yadav-12))
- Lohit Kamatham, M.S. University of Michigan ([link](https://github.com/lohitk1))
