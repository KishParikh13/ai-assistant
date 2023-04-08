import React, { useState } from 'react';
import axios from 'axios';
import Calendar from './Calendar';

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

  const [calendar, setCalendar] = useState([]);
  const loadCalendar = async () => {
    console.log(process.env.REACT_APP_GOOGLE_API_KEY)
  };

  return (
    <div className=' min-h-screen p-8 grid grid-cols-3 gap-8'>
      <section className=' col-span-2 flex flex-col '>
        <h1  className='font-bold text-2xl mb-2'>AI Calendar Chat App</h1>
        <p className=' mb-8  text-sm '>Use the OpenAI API to chat with an AI assistant.</p>
        
        <div className=''>
          <p className='font-bold text-md mb-4'>{new Date().toLocaleString()}</p>
          <div className=' '>
            {
              messages.map((message, index) => {
                return (
                  <p className='mb-2' key={index}><span style={{backgroundColor: (message.role === "user" ? "yellow" : "lightGreen")}}>{message.role}</span>: {message.content}</p>
                );
              })
            }
          </div>
        </div>

        <div className=' mt-auto'>
          <form onSubmit={e => getChat(e)} className='relative flex flex-col gap-2 mt-auto'>
              <textarea className=' flex-grow resize-none border-2 border-gray-200 p-4 pr-32' id="prompt" value={newMessage} onChange={(event) => setNewMessage(event.target.value)} />
              <button type="submit" className=' absolute right-2 bottom-2 ml-auto px-4 py-2 rounded-md bg-indigo-600 text-white' onClick={getChat}>Submit</button>
          </form>
        </div>
      </section>
      <section className='bg-slate-100 p-4 col-span-1'>
        <Calendar events={calendar} />
      </section>

      

    </div>
  );
}

export default App;