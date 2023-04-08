const express = require('express');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const port = process.env.PORT || 8080;

const credentials = require('./credentials.json');
const calendar = google.calendar({
  version: 'v3',
  auth: new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ['https://www.googleapis.com/auth/calendar']
  )
});

const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/api/completion', async (req, res) => {
  const { prompt } = req.body;
  // handle errors if openai fails
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0,
      max_tokens: 60,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });
    res.json({ result: response.data.choices[0].text });
  } catch (error) {
    console.log(error);
  }
});

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  // handle errors if openai fails
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
    });
    res.json({ result: response.data.choices[0].message });
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});