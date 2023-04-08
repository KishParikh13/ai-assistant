import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [completionPrompt, setCompletionPrompt] = useState('');
  const [completion, setCompletion] = useState('');

  const getCompletion = async () => {
    try {
      const response = await axios.post('/api/completion', { prompt: completionPrompt });
      setCompletion(response.data.result);
    } catch (error) {
      console.log(error);
    }
  };

  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([
    {"role": "system", "content": "You are a helpful assistant."},
  ]);

  const getChat = async (e) => {
    e.preventDefault();
    let newMessages = [...messages, { role: 'user', content: newMessage }]
    setMessages(newMessages)
    setNewMessage('');
    try {
      const response = await axios.post('/api/chat', { messages: newMessages });
      setMessages([...newMessages, { role: 'assistant', content: response.data.result.content }]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='p-8'>
      <h1  className='font-bold text-2xl mb-2'>AI Calendar Chat App</h1>
      <p className=' mb-8  text-sm '>Use the OpenAI API to chat with an AI assistant.</p>
      <div className=''>
        <p className='font-bold text-md mb-4'>{new Date().toLocaleString()}</p>
        <div className=' mb-32'>
          {
            messages.map((message, index) => {
              return (
                <p className='mb-2' key={index}><span style={{backgroundColor: (message.role === "user" ? "yellow" : "lightGreen")}}>{message.role}</span>: {message.content}</p>
              );
            })
          }
        </div>
        <form onSubmit={e => getChat(e)} className='fixed bottom-0 left-0 right-0 p-4 bg-slate-200 flex gap-2 items-end mt-auto'>
          <textarea className=' flex-grow  border-2 border-gray-200 p-4' id="prompt" value={newMessage} onChange={(event) => setNewMessage(event.target.value)} />
          <button type="submit" className='px-4 py-2 rounded-md bg-indigo-600 text-white' onClick={getChat}>Submit</button>
      </form>
      </div>
    </div>
  );
}

export default App;

{/* <div className=' hidden'>
<h2>Get a completion</h2>
<label htmlFor="prompt">Enter a prompt:</label>
<input type="text" id="prompt" value={completionPrompt} onChange={(event) => setCompletionPrompt(event.target.value)} />
<button onClick={getCompletion}>Submit</button>
<p>{completion}</p>
</div> */}