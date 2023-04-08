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
  let systemMessages = [
{
"role": "system",
"content": `You are my calendar assistant.
You interpret my natural language statements
and manage my calendar events based on that.
You only respond in JSON.
`
},
{
"role": "user",
"content": `If I ask you something that does not require an action,
respond in the folllowing JSON format:
{
  "content": "I'm sorry, I don't understand."
}`
},
{
"role": "user",
"content": `If I ask you to create an event,
format the start and end times in ISO 8601 format,
choose a type from the following list: Work, Personal, Projects, or Volunteering,
and respond in the following JSON format:
{
  "startTime": "4pm on April 8th 2023",
  "endTime": "5pm on April 8th 2023",
  "summary": "Test meeting",
  "location": "3595 California St, San Francisco, CA 94118",
  "description": "Meet with David to talk about the new client project and how to integrate the calendar for booking.",
  type: "Work",
}`
},
{
"role": "user",
"content": `Only reply in JSON,
your responses should ONLY start with an opening curly bracket
and end with a closing curly bracket, no extra quotes or conversational text.`
}
]

  const [messages, setMessages] = useState(systemMessages);

  const clearChat = () => {
    setMessages(systemMessages);
    // update session storage
    sessionStorage.clear('messages', JSON.stringify(messages))
  }

  const handleIncomingChatMessage = (message) => {
    console.log(message)
    let jsonMessage = {}
    try {
      jsonMessage = JSON.parse(message);
    } catch(e) {
      jsonMessage = {
        content: message
      }
    }
    if (jsonMessage.content) {
      message = jsonMessage.content
    } else if (jsonMessage.summary) {
      message = "Succesfully created the following event: " + jsonMessage.summary
    } else {
      message = "I'm sorry, I don't understand. Try again with more specific command"
    }
    return message
  }


  const getChat = async (e) => {
    e.preventDefault();
    let newMessages = [...messages, { role: 'user', content: newMessage }]
    setMessages(newMessages)
    setNewMessage('');
    try {
      const response = await axios.post('/api/chat', { messages: newMessages });
      let incomingMessage = handleIncomingChatMessage(response.data.result.content)
      let allMessages = [...newMessages, { role: 'assistant', content: incomingMessage }]

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
              messages.filter((message, index) => index > (systemMessages.length-1)).map((message, index) => {
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
        {/* <Calendar /> */}
      </section>

      

    </div>
  );
}

export default App;