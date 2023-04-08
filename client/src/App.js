import React, { useEffect, useState } from 'react';
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
  let systemMessage = {
    "role": "system",
    "content": `
    You are my calendar assistant.
    You interpret my natural language statements
    and create calendar events based on that.
    If I don't specify a date, assume it's today.
    If I don't provide a location, assume there is none.
    Only respond in the following JSON format, no extra quotes or conversational prose:
    {
      summary: "Test meeting",
      location: "3595 California St, San Francisco, CA 94118",
      description: "Meet with David to talk about the new client project and how to integrate the calendar for booking.",
      colorId: 1,
      start: {
        dateTime: eventStartTime,
        timeZone: 'America/California',
      },
      end: {
        dateTime: eventEndTime,
        timeZone: 'America/California',
      },
    }
    `
  }
  const [messages, setMessages] = useState([systemMessage]);

  const clearChat = () => {
    setMessages([systemMessage]);
    // update session storage
    sessionStorage.clear('messages', JSON.stringify(messages))
  }

  const getChat = async (e) => {
    e.preventDefault();
    let newMessages = [...messages, { role: 'user', content: newMessage }]
    setMessages(newMessages)
    setNewMessage('');
    try {
      const response = await axios.post('/api/chat', { messages: newMessages });
      let allMessages = [...newMessages, { role: 'assistant', content: response.data.result.content }]

      // save messages to session storage
      setMessages(allMessages);
      sessionStorage.setItem('messages', JSON.stringify(allMessages));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // load messages from session storage
    const messages = sessionStorage.getItem('messages');
    if (messages) {
      setMessages(JSON.parse(messages));
    }
  }, []);


  return (
    <div className=' min-h-screen p-8 grid lg:grid-cols-3 gap-8'>
      <section className=' col-span-2 flex flex-col '>
        <div className='flex justify-between items-start'>
        <div>
          <h1  className='font-bold text-2xl mb-2'>AI Calendar Chat App</h1>
          <p className=' mb-8  text-sm '>Use the OpenAI API to chat with an AI assistant.</p>

        </div>
        {/*  clear chat button */}
        <button className='px-4 py-2 rounded-md bg-gray-600 text-white' onClick={() => clearChat()}>
          Clear Chat
        </button>

        </div>
        
        <div className=''>
          <p className='font-bold text-md mb-4'>{new Date().toLocaleString()}</p>
          <div className=' '>
            {
              messages.map((message, index) => {
                return (
                  <p className='mb-2 whitespace-pre-wrap' key={index}><span style={{backgroundColor: (message.role === "user" ? "yellow" : "lightGreen")}}>{message.role}</span>: {message.content}</p>
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
      <section className='bg-slate-100 p-4 lg:block hidden col-span-1 max-h-[90vh] sticky top-8'>
        <Calendar />
      </section>

      

    </div>
  );
}

export default App;