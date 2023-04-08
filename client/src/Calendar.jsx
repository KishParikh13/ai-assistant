import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import axios from 'axios';
import { useState, useEffect } from 'react';

function Calendar (props) {

    const [apiKey, setApiKey] = useState(null);

    const loadAPIKey = async () => {
        return await axios.get('/api/calendar/apikey');
    }

    useEffect(() => {
        loadAPIKey().then(res => {
            setApiKey(res.data);
        })
    }, [])

    return (
        <>
        {
            apiKey &&
            <FullCalendar
                height={"100%"}
                // get current time, subtract 1 hour, and format it as HH:MM:SS and set it as the scroll time
                scrollTime={new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" }).split(':').map((x, i) => i === 0 ? x - 1 : x).join(':')}
                eventClick={function(info) {
                    info.jsEvent.preventDefault(); // don't navigate on click
                }}
                slotDuration={"00:05:00"}
                nowIndicator={true}
                nowIndicatorClassNames={""}
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, googleCalendarPlugin]}
                googleCalendarApiKey= { apiKey }
                initialView="timeGridDay"
                eventDisplay="block"
                eventSources= {[
                    {
                        googleCalendarId: 'kishparikh18@gmail.com',
                        color: 'purple',
                        className: 'p-2',
                    },
                    {
                        googleCalendarId: '125rsiih89gregb0ffera4rfs8@group.calendar.google.com',
                        color: 'green',
                        className: 'p-2',
                    },
                    {
                        googleCalendarId: 'f2tsja9r7ad5feu73gh9t5ai5s@group.calendar.google.com',
                        color: 'blue',
                        className: 'p-2',
                    },
                    {
                        googleCalendarId: 'covpast5nonv2t1pq2ep489fq8@group.calendar.google.com',
                        color: 'blue',
                        className: 'p-2',
                    }
                ]}
            />
        }
        </>
    )
}

export default Calendar;