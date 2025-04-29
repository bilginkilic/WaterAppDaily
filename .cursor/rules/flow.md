Application Flow
This document outlines the general flow of the application, detailing the navigation and user experience based on login status and survey completion.
Flow Overview
1. User Attempts Login

Action: User submits login credentials (e.g., email and password).
Outcome:
Success: Proceed to the next step based on user status.
Failure: User is denied access and remains on the login screen.
Display an error message (e.g., "Invalid credentials. Please try again.").





2. Successful Login

Action: The data service is called to set the following:
Email: User's email address.
LoggedIn: true.
SurveyTaken: false (if not previously set).


Condition: Check if this is the user's first login (based on SurveyTaken status or absence of prior data).

2.1. First Login

Flow:
Intro Screen:
Display an introductory screen (e.g., welcome message, app overview).
Provide a button or action to proceed.


Survey Screen:
Redirect to the survey section where the user completes the survey.
Survey responses are recorded via the data service (as per the service rules).


Main Tabs:
After survey completion, redirect to the main interface with three tabs:
Challenges: Displays available tasks and challenges.
Achievements: Shows earned achievements.
Profile: Displays user information and settings.







2.2. Returning User (Survey Already Taken)

Condition: If SurveyTaken is true (indicating the user has previously completed the survey).
Flow:
Skip the intro and survey screens.
Redirect directly to the Main Tabs:
Challenges: Displays available tasks and challenges.
Achievements: Shows earned achievements.
Profile: Displays user information and settings.





Notes

Existing Screens: The Challenges, Achievements, and Profile tabs are already implemented.
Data Consistency: All data interactions (e.g., setting SurveyTaken, recording survey responses) are handled through the centralized data service.
Error Handling: Ensure robust handling for failed logins (e.g., network issues, invalid credentials) with clear user feedback.
Navigation: Ensure smooth transitions between screens, with loading states if data fetching is required.
Survey Status: The SurveyTaken flag in the data service determines whether to show the intro/survey or skip to the main tabs.

Flow Diagram
graph TD
    A[Login Attempt] -->|Success| B{Check First Login}
    A -->|Failure| C[Login Screen: Error Message]
    B -->|First Login| D[Intro Screen]
    D --> E[Survey Screen]
    E --> F[Main Tabs: Challenges, Achievements, Profile]
    B -->|Survey Taken| F

