
## EN: Title
# Fitness Tracker with Geolocation

# Description:
This is a web application designed to track fitness activities, built using the Object-Oriented Programming (OOP) paradigm. The app leverages geolocation and an interactive map to save and display running and cycling workouts. It’s a user-friendly tool for monitoring fitness progress, equipped with advanced features and a clean design.

############# Key Features: ###############
# 1. Geolocation:

Automatically detects the user's location using the browser's Geolocation API.
Falls back to a default location if geolocation is unavailable or permission is denied.

# 2. Error Handling:

Dynamically displays clear error messages when invalid data is entered.
Handles geolocation errors such as permission denial or service unavailability.

# 3. Interactive Map:

- Integrates an interactive map using Leaflet.js.
- Allows users to mark workout locations with customized markers.
- Enables navigation to workout locations by clicking on the workout list.

# 4. Workout Management:

- Add running or cycling workouts using an interactive form.
- Automatically calculates key metrics:
- Running: Pace and cadence.
- Cycling: Speed and elevation gain.
- Generates a summary for each workout, displayed both in a list and on the map.

# 5. Data Persistence:

- Saves user workouts in localStorage, ensuring they persist between sessions.
- Includes a reset button to clear all data and refresh the app.

# 6. Object-Oriented Programming (OOP):

- Utilizes JavaScript classes for clean, modular, and scalable code.
- Separate classes for workout types (Running, Cycling) and app logic (App).
- Inherits and extends functionality between classes to reduce redundancy.

# 7. Enhanced User Experience (UX):

Dynamic form that adjusts fields based on the selected workout type.
Auto-hiding error messages after a set duration.
Intuitive and clean interface for easy navigation.

# Technologies Used:

HTML, CSS, and JavaScript (ES6+): For structure, styling, and functionality.
- Leaflet.js: For interactive maps and custom markers.
- LocalStorage API: For saving and managing workout data.
- Geolocation API: For detecting the user’s position.
- OOP Paradigm: Structured the app into classes with inheritance and encapsulation.
