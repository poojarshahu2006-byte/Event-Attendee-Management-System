// =====================================
// GLOBAL DATA
// =====================================

let events = [];
let attendees = [];


// =====================================
// TOAST MESSAGE
// =====================================

function showMessage(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
}


// =====================================
// LOAD EVENTS
// =====================================

async function loadEvents() {

    const response =
        await fetch("/api/events");

    events = await response.json();

    displayEvents();
    updateEventDropdown();
    updateStatistics();
}


// =====================================
// DISPLAY EVENTS
// =====================================

function displayEvents() {

    const table =
        document.getElementById("eventsTable");

    table.innerHTML = "";

    if (events.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6">
                    No events found
                </td>
            </tr>
        `;

        return;
    }


    events.forEach(event => {

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>${event.id}</td>

            <td>
                <strong>${event.event_name}</strong>
            </td>

            <td>${formatDate(event.event_date)}</td>

            <td>${event.venue}</td>

            <td>👥 ${event.registered}</td>

            <td>

                <button
                    class="actionBtn editBtn"
                    onclick="editEvent(${event.id})"
                >
                    ✎
                </button>

                <button
                    class="actionBtn deleteBtn"
                    onclick="deleteEvent(${event.id})"
                >
                    🗑
                </button>

            </td>
        `;

        table.appendChild(row);

    });
}


// =====================================
// FORMAT DATE
// =====================================

function formatDate(date) {

    if (!date) return "";

    const d = new Date(date);

    return d.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// =====================================
// EVENT DROPDOWN
// =====================================

function updateEventDropdown() {

    const select =
        document.getElementById("eventSelect");

    select.innerHTML =
        `<option value="">Select Event</option>`;

    events.forEach(event => {

        const option =
            document.createElement("option");

        option.value = event.id;

        option.textContent =
            event.event_name;

        select.appendChild(option);

    });
}


// =====================================
// ADD / UPDATE EVENT
// =====================================

document
    .getElementById("eventForm")
    .addEventListener(
        "submit",
        async function(e) {

            e.preventDefault();

            const id =
                document.getElementById(
                    "editEventId"
                ).value;

            const eventName =
                document.getElementById(
                    "eventName"
                ).value.trim();

            const eventDate =
                document.getElementById(
                    "eventDate"
                ).value;

            const venue =
                document.getElementById(
                    "venue"
                ).value.trim();


            const url = id
                ? `/api/events/${id}`
                : "/api/events";

            const method =
                id ? "PUT" : "POST";


            const response =
                await fetch(url, {

                    method: method,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        event_name: eventName,
                        event_date: eventDate,
                        venue: venue
                    })

                });


            const data =
                await response.json();


            if (response.ok) {

                showMessage(data.message);

                newEvent();

                loadEvents();

            } else {

                showMessage(data.message);

            }

        }
    );


// =====================================
// NEW EVENT
// =====================================

function newEvent() {

    document
        .getElementById("eventForm")
        .reset();

    document
        .getElementById("editEventId")
        .value = "";

    document
        .getElementById("eventSubmit")
        .textContent = "＋ Add Event";
}


// =====================================
// EDIT EVENT
// =====================================

function editEvent(id) {

    const event =
        events.find(e => e.id == id);

    if (!event) return;


    document
        .getElementById("editEventId")
        .value = event.id;

    document
        .getElementById("eventName")
        .value = event.event_name;

    document
        .getElementById("eventDate")
        .value = event.event_date;

    document
        .getElementById("venue")
        .value = event.venue;

    document
        .getElementById("eventSubmit")
        .textContent = "✓ Update Event";


    document
        .getElementById("addEvent")
        .scrollIntoView({
            behavior: "smooth"
        });
}


// =====================================
// DELETE EVENT
// =====================================

async function deleteEvent(id) {

    if (!confirm(
        "Are you sure you want to delete this event?"
    )) {
        return;
    }


    const response =
        await fetch(`/api/events/${id}`, {
            method: "DELETE"
        });


    const data =
        await response.json();


    showMessage(data.message);

    loadEvents();
    loadAttendees();
}


// =====================================
// REGISTER ATTENDEE
// =====================================

document
    .getElementById("attendeeForm")
    .addEventListener(
        "submit",
        async function(e) {

            e.preventDefault();

            const name =
                document.getElementById(
                    "attendeeName"
                ).value.trim();

            const email =
                document.getElementById(
                    "attendeeEmail"
                ).value.trim();

            const eventId =
                document.getElementById(
                    "eventSelect"
                ).value;

            const ticketType =
                document.getElementById(
                    "ticketType"
                ).value;


            const response =
                await fetch("/api/attendees", {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        name: name,
                        email: email,
                        event_id: eventId,
                        ticket_type: ticketType

                    })

                });


            const data =
                await response.json();


            if (response.ok) {

                showMessage(data.message);

                document
                    .getElementById("attendeeForm")
                    .reset();

                loadAttendees();
                loadEvents();

            } else {

                showMessage(data.message);

            }

        }
    );


// =====================================
// LOAD ATTENDEES
// =====================================

async function loadAttendees() {

    const response =
        await fetch("/api/attendees");

    attendees =
        await response.json();

    displayAttendees();

    updateStatistics();
}


// =====================================
// DISPLAY ATTENDEES
// =====================================

function displayAttendees() {

    const table =
        document.getElementById(
            "attendeesTable"
        );

    table.innerHTML = "";


    if (attendees.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6">
                    No attendees found
                </td>
            </tr>
        `;

        return;
    }


    attendees.forEach(attendee => {

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>${attendee.id}</td>

            <td>
                <strong>${attendee.name}</strong>
            </td>

            <td>${attendee.email}</td>

            <td>${attendee.event_name}</td>

            <td>
                <span class="ticket ${attendee.ticket_type}">
                    ${attendee.ticket_type}
                </span>
            </td>

            <td>

                <button
                    class="actionBtn deleteBtn"
                    onclick="deleteAttendee(${attendee.id})"
                >
                    🗑
                </button>

            </td>

        `;

        table.appendChild(row);

    });
}


// =====================================
// DELETE ATTENDEE
// =====================================

async function deleteAttendee(id) {

    if (!confirm(
        "Delete this attendee?"
    )) {
        return;
    }


    const response =
        await fetch(
            `/api/attendees/${id}`,
            {
                method: "DELETE"
            }
        );


    const data =
        await response.json();

    showMessage(data.message);

    loadAttendees();
    loadEvents();
}


// =====================================
// SEARCH
// =====================================

async function searchAttendees() {

    const q =
        document.getElementById(
            "searchInput"
        ).value.trim();


    if (!q) {

        loadAttendees();

        return;
    }


    const response =
        await fetch(
            `/api/attendees/search?q=${encodeURIComponent(q)}`
        );


    attendees =
        await response.json();

    displayAttendees();
}


// =====================================
// GLOBAL SEARCH
// =====================================

document
    .getElementById("globalSearch")
    .addEventListener(
        "keyup",
        function() {

            const value =
                this.value.toLowerCase();

            const filtered =
                attendees.filter(a =>
                    a.name
                        .toLowerCase()
                        .includes(value) ||

                    a.email
                        .toLowerCase()
                        .includes(value) ||

                    a.event_name
                        .toLowerCase()
                        .includes(value)
                );


            if (value) {

                attendees =
                    filtered;

                displayAttendees();

            } else {

                loadAttendees();

            }

        }
    );


// =====================================
// STATISTICS
// =====================================

function updateStatistics() {

    document
        .getElementById("totalEvents")
        .textContent = events.length;

    document
        .getElementById("totalAttendees")
        .textContent = attendees.length;

    document
        .getElementById("quickEvents")
        .textContent =
        `${events.length} ↑`;

    document
        .getElementById("quickAttendees")
        .textContent =
        `${attendees.length} ↑`;

    document
        .getElementById("recentRegistrations")
        .textContent =
        Math.min(attendees.length, 5);


    const today =
        new Date();

    today.setHours(0, 0, 0, 0);


    const upcoming =
        events.filter(event => {

            const date =
                new Date(event.event_date);

            return date >= today;

        });


    document
        .getElementById("upcomingEvents")
        .textContent =
        upcoming.length;
}


// =====================================
// START
// =====================================

loadEvents();

loadAttendees();