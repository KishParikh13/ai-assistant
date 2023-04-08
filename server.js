require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { google } = require('googleapis');
const { OAuth2 } = google.auth;
const oAuth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

app.get('/api/calendar/apikey', async (req, res) => {
  res.send(process.env.GOOGLE_API_TOKEN)
});

// app.get('/api/calendar/list/:count', async (req, res) => {
//   var numResults = req.params.count;

//   let allEvents = [];

//   // for (let i = 0; i < calendarIds.length; i++) {
//     // Call the calendar api to retrieve the events from the calendar.
//     // console.log("loading calendar " + (i+1) + ": " + calendarIds[i])
//     calendar.events.list({
//       calendarId: 'primary', // calendarIds[i],
//       timeMin: (new Date()).toISOString(),
//       maxResults: numResults,
//       singleEvents: true,
//       orderBy: 'startTime',
//     }, (err, response) => {
//       if (err) return console.log('The API returned an error: ', err);
//       const events = response.data.items;
//       if (events.length) {
//         allEvents = allEvents.concat(events);
//         res.send(events)
//       } else {
//         console.log('No upcoming events found.');
//       }
//     });
//   // }

// });

app.get('/api/calendar/insert', async (req, res) => {

    // Create a new event start date instance for temp uses in our calendar.
  const eventStartTime = new Date()
  eventStartTime.setDate(eventStartTime.getDay() + 2)
  
  // Create a new event end date instance for temp uses in our calendar.
  const eventEndTime = new Date()
  eventEndTime.setDate(eventEndTime.getDay() + 1)
  eventEndTime.setMinutes(eventEndTime.getMinutes() + 45)
  
  // Create a dummy event for temp uses in our calendar
  const event = {
    summary: `Test meeting`,
    location: `3595 California St, San Francisco, CA 94118`,
    description: `Meet with David to talk about the new client project and how to integrate the calendar for booking.`,
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
  
  // Check if we a busy and have an event on our calendar for the same time.
  calendar.freebusy.query(
    {
      resource: {
        timeMin: eventStartTime,
        timeMax: eventEndTime,
        timeZone: 'America/California',
        items: [{ id: 'primary' }],
      },
    },
    (err, res) => {
      // Check for errors in our query and log them if they exist.
      if (err) return console.error('Free Busy Query Error: ', err)
  
      // Create an array of all events on our calendar during that time.
      const eventArr = res.data.calendars.primary.busy
  
      // Check if event array is empty which means we are not busy
      if (eventArr.length === 0)
        // If we are not busy create a new calendar event.
        return calendar.events.insert(
          { calendarId: 'primary', resource: event },
          err => {
            // Check for errors and log them if they exist.
            if (err) return console.error('Error Creating Calender Event:', err)
            // Else log that the event was created.
            return console.log('Calendar event successfully created.')
          }
        )
  
      // If event array is not empty log that we are busy.
      return console.log(`Sorry I'm busy...`)
    }
  )
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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
    console.log(error.message);
  }
});

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
    });
    res.json({ result: response.data.choices[0].message });
  } catch (error) {
    console.log("api key", process.env.REACT_APP_OPENAI_API_KEY);
    console.log(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});