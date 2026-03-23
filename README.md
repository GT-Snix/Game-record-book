# 🏆 The Official Gaming Record Book

## 📌 Project Overview
The Official Gaming Record Book is a web application designed to track and display verified video game speedrun world records. Styled after prestigious record-keeping institutions like the Guinness Book of World Records, this application allows users to browse, search, and analyze the fastest completion times across various gaming titles.

## ⚙️ API Integration
This project utilizes the official **Speedrun.com API** to fetch real-time data regarding games, categories, and world-record runs.
* **API Endpoint:** `https://www.speedrun.com/api/v1`
* **Documentation:** [Speedrun.com API Docs](https://github.com/speedruncomorg/api)
* **Authentication:** No authentication/API key required for fetching public run data.

## 🚀 Planned Features & Technical Requirements
This project will demonstrate proficiency in vanilla JavaScript, specifically utilizing the `fetch` API and Higher-Order Functions (HOFs) to manipulate the data:

* **Public API Integration:** Data will be fetched asynchronously using `fetch()` to populate the record book dynamically.
* **Search:** Users can search for specific games (e.g., "Super Mario 64") or specific record holders using an interactive search bar.
* **Filter (`.filter()`):** Users can filter the record categories (e.g., viewing only "Glitchless" runs or filtering out runs played on emulators).
* **Sort (`.sort()`):** Users can sort the world records by the date the record was achieved, or sort leaderboards by completion time (fastest to slowest).
* **UI/UX Design:** A custom, responsive user interface built with CSS (potentially utilizing Tailwind CSS for layout structure) featuring a classic, prestigious aesthetic (navy blue and gold themes, official verified badges).

## 🛠️ Technologies Used
* **HTML5:** Semantic structuring of the record dashboard.
* **CSS3 / Tailwind CSS:** Custom styling to achieve the "World Record Book" aesthetic.
* **Vanilla JavaScript (ES6+):** DOM manipulation, API fetching, and data processing.

## 🏁 Setup and Installation
To run this project locally:
1. Clone this repository to your local machine: `git clone [your-repo-link-here]`
2. Navigate into the project directory.
3. Open the `index.html` file in any modern web browser.
4. (Optional) Run a local development server like VS Code's "Live Server" extension for hot reloading. 

*Note: This project runs entirely in the browser and requires no backend setup or package installation.*
