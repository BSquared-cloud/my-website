document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CONFIGURATION & INITIAL DATA ---
    const GOAL_DEFINITIONS = [ // Replicate GoalsDefinition from your DB
        { id: 1, name: "Drink Water", type: "daily", target_value: 100, unit: "oz", is_active: 1 },
        { id: 2, name: "Reading", type: "daily", target_value: 30, unit: "minutes", is_active: 1 },
        { id: 3, name: "Workout", type: "daily", target_value: 30, unit: "minutes", is_active: 1 },
        { id: 4, name: "Stretch", type: "daily", target_value: 15, unit: "minutes", is_active: 1 },
        { id: 5, name: "Personal Work", type: "daily", target_value: 60, unit: "minutes", is_active: 1 },
        { id: 6, name: "Sleep", type: "daily", target_value: 7, unit: "hours", is_active: 1 }
        // Add more goals as defined in your original database
    ];

    const activeGoals = GOAL_DEFINITIONS.filter(g => g.is_active === 1);
    const NUM_TOTAL_GOALS = activeGoals.length;

    // --- State variables for calendar ---
    let currentDisplayDate = new Date(); // Defaults to today

    // --- DOM Elements ---
    const goalsGridContainer = document.getElementById('goals-grid-container');
    const noGoalsMessage = document.getElementById('no-goals-message');
    const calendarBodyContainer = document.getElementById('calendar-body-container');
    const currentMonthYearDisplay = document.getElementById('current-month-year-display');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');

    // --- 2. SESSION STORAGE HELPERS ---
    function getSessionData(key, defaultValue = {}) {
        const data = sessionStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    }

    function setSessionData(key, value) {
        sessionStorage.setItem(key, JSON.stringify(value));
    }

    // Initialize/Load data from sessionStorage
    // goalsProgress: { goalId: current_progress, ... }
    let goalsProgress = getSessionData('demoGoalsProgress', 
        activeGoals.reduce((acc, goal) => {
            acc[goal.id] = 0;
            return acc;
        }, {})
    );

    // dailyEntries: { 'YYYY-MM-DD': { goalId: logged_value_for_day, ... }, ... }
    let dailyEntries = getSessionData('demoDailyEntries', {});


    // --- 3. RENDERING FUNCTIONS ---

    function renderGoals() {
        goalsGridContainer.innerHTML = ''; // Clear existing goals
        if (activeGoals.length === 0) {
            noGoalsMessage.style.display = 'block';
            return;
        }
        noGoalsMessage.style.display = 'none';

        activeGoals.forEach(goal => {
            const currentProgress = goalsProgress[goal.id] || 0;
            const targetValue = goal.target_value;
            let progressPercent = 0;
            if (targetValue > 0) {
                progressPercent = (currentProgress / targetValue) * 100;
            }
            const progressPercentDisplay = Math.min(progressPercent, 100).toFixed(0);

            const radius = 50;
            const circumference = 2 * Math.PI * radius;
            const visualProgressPercent = Math.min(progressPercent, 100);
            const progressDash = (visualProgressPercent / 100) * circumference;

            const goalCard = document.createElement('div');
            goalCard.className = 'goal-card';
            goalCard.innerHTML = `
                <h3>${goal.name}</h3>
                <div class="goal-progress-circle-container">
                    <svg class="progress-ring" width="120" height="120">
                        <circle class="progress-ring-track" stroke-width="10" fill="transparent" r="${radius}" cx="60" cy="60"/>
                        <circle class="progress-ring-indicator" id="indicator-${goal.id}"
                                stroke-width="10" fill="transparent" r="${radius}" cx="60" cy="60"
                                stroke-dasharray="${progressDash} ${circumference}"
                                transform="rotate(-90 60 60)"/>
                    </svg>
                    <div class="progress-percentage" id="percentage-${goal.id}">${progressPercentDisplay}%</div>
                </div>
                <div class="goal-details">
                    <p>Current: <span id="currentval-${goal.id}">${currentProgress}</span> / ${targetValue} ${goal.unit}</p>
                </div>
                <div class="log-form">
                    <input type="number" id="input-${goal.id}" placeholder="${goal.unit}" step="any">
                    <button data-goal-id="${goal.id}" class="log-button">➤</button>
                </div>
            `;
            goalsGridContainer.appendChild(goalCard);
        });

        // Add event listeners to newly created log buttons
        document.querySelectorAll('.log-button').forEach(button => {
            button.addEventListener('click', handleLogProgress);
        });
    }

    function renderCalendar(year, month) { // month is 0-indexed for JS Date
        calendarBodyContainer.innerHTML = ''; // Clear existing calendar
        currentMonthYearDisplay.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;

        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Adjust for week starting on Monday (0=Mon, 6=Sun for our display)
        let dayOfWeekAdjusted = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

        let date = 1;
        for (let i = 0; i < 6; i++) { // Max 6 weeks in a month view
            const row = document.createElement('tr');
            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                cell.className = 'calendar-day-cell';
                if (i === 0 && j < dayOfWeekAdjusted) {
                    // Empty cell before the first day
                } else if (date > daysInMonth) {
                    // Empty cell after the last day
                } else {
                    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                    const dayCircle = document.createElement('div');
                    dayCircle.className = 'day-circle';
                    dayCircle.textContent = date;
                    dayCircle.id = `day-${dayStr}`; // ID for easy targeting

                    // Highlight today
                    const today = new Date();
                    if (date === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
                        dayCircle.classList.add('today');
                    }
                    
                    // Add completion status
                    const status = getDailyCompletionStatus(dayStr);
                    if (status) {
                        dayCircle.classList.add(status);
                    }

                    cell.appendChild(dayCircle);
                    date++;
                }
                row.appendChild(cell);
            }
            calendarBodyContainer.appendChild(row);
            if (date > daysInMonth && i < 5) { // Optimization: if all days rendered, break early if not the last potential week
                 let allCellsEmptyInRow = true;
                 for(let k=0; k < row.children.length; k++){
                     if(row.children[k].innerHTML !== ""){
                         allCellsEmptyInRow = false;
                         break;
                     }
                 }
                 if(allCellsEmptyInRow && i < 4) break; // if row is empty and not the potential 5th week with content
            }
        }
    }

    // --- 4. LOGIC FUNCTIONS ---
    function getDailyCompletionStatus(dateStr) { // dateStr is 'YYYY-MM-DD'
        if (NUM_TOTAL_GOALS === 0) return '';

        const entriesForDay = dailyEntries[dateStr] || {};
        let goalsMetToday = 0;
        let goalsWithAnyProgressToday = 0;

        activeGoals.forEach(goalDef => {
            const loggedValue = entriesForDay[goalDef.id] || 0;
            if (loggedValue > 0) {
                goalsWithAnyProgressToday++;
            }
            if (loggedValue >= goalDef.target_value) {
                goalsMetToday++;
            }
        });

        if (goalsMetToday === NUM_TOTAL_GOALS) return "green";
        const percentageGoalsMet = (goalsMetToday / NUM_TOTAL_GOALS) * 100;
        if (percentageGoalsMet >= 50) return "yellow";
        if (goalsWithAnyProgressToday > 0) return "red";
        return ""; // No progress or no goals defined
    }

    function updateGoalVisuals(goalId, newProgress) {
        const goalDef = activeGoals.find(g => g.id === goalId);
        if (!goalDef) return;

        const targetValue = goalDef.target_value;
        let progressPercent = 0;
        if (targetValue > 0) {
            progressPercent = (newProgress / targetValue) * 100;
        }
        const progressPercentDisplay = Math.min(progressPercent, 100).toFixed(0);

        const radius = 50;
        const circumference = 2 * Math.PI * radius;
        const visualProgressPercent = Math.min(progressPercent, 100);
        const progressDash = (visualProgressPercent / 100) * circumference;

        document.getElementById(`indicator-${goalId}`).setAttribute('stroke-dasharray', `${progressDash} ${circumference}`);
        document.getElementById(`percentage-${goalId}`).textContent = `${progressPercentDisplay}%`;
        document.getElementById(`currentval-${goalId}`).textContent = newProgress;
    }


    // --- 5. EVENT HANDLERS ---
    function handleLogProgress(event) {
        const goalId = parseInt(event.target.dataset.goalId);
        const inputElement = document.getElementById(`input-${goalId}`);
        const amountStr = inputElement.value;

        if (!amountStr) {
            alert("Please enter an amount.");
            return;
        }
        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a positive number.");
            inputElement.value = '';
            return;
        }

        // Update goalsProgress (for overall today's view)
        goalsProgress[goalId] = (goalsProgress[goalId] || 0) + amount;
        setSessionData('demoGoalsProgress', goalsProgress);
        updateGoalVisuals(goalId, goalsProgress[goalId]);
        
        // Update dailyEntries (for calendar dots)
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        if (!dailyEntries[todayStr]) {
            dailyEntries[todayStr] = {};
        }
        dailyEntries[todayStr][goalId] = (dailyEntries[todayStr][goalId] || 0) + amount;
        setSessionData('demoDailyEntries', dailyEntries);

        // Update calendar dot for today
        const todayDot = document.getElementById(`day-${todayStr}`);
        if (todayDot) {
            const status = getDailyCompletionStatus(todayStr);
            todayDot.className = 'day-circle'; // Reset classes
             if (today.getDate() === currentDisplayDate.getDate() && 
                today.getFullYear() === currentDisplayDate.getFullYear() && 
                today.getMonth() === currentDisplayDate.getMonth()) {
                 if (today.getDate() === (new Date()).getDate() && 
                     today.getFullYear() === (new Date()).getFullYear() && 
                     today.getMonth() === (new Date()).getMonth()) {
                    todayDot.classList.add('today'); // Re-add today if it is today
                 }
            }
            if (status) {
                todayDot.classList.add(status);
            }
        }
        
        inputElement.value = ''; // Clear input
    }

    prevMonthBtn.addEventListener('click', (e) => {
        e.preventDefault();
        currentDisplayDate.setMonth(currentDisplayDate.getMonth() - 1);
        renderCalendar(currentDisplayDate.getFullYear(), currentDisplayDate.getMonth());
    });

    nextMonthBtn.addEventListener('click', (e) => {
        e.preventDefault();
        currentDisplayDate.setMonth(currentDisplayDate.getMonth() + 1);
        renderCalendar(currentDisplayDate.getFullYear(), currentDisplayDate.getMonth());
    });

    // --- 6. INITIALIZATION ---
    function initApp() {
        renderGoals();
        renderCalendar(currentDisplayDate.getFullYear(), currentDisplayDate.getMonth());
    }

    initApp();
});