# WaterApp Questions Template Guide

## Excel Template Structure

The Excel template is designed to help manage and review WaterApp questions with your team. Here's how to use it:

### Column Descriptions

1. **ID** (Required)
   - Unique identifier for each question
   - Must be a number
   - Questions with multiple options share the same ID

2. **Category** (Required)
   - Question category (e.g., DISHWASHING, SHOWER, PLUMBING)
   - Must match categoryIds from categories.js

3. **Question Text** (Required)
   - The actual question shown to users
   - Keep it clear and concise

4. **Option Text** (Required)
   - The text for each answer option
   - Each option gets its own row with the same Question ID

5. **Value Saving** (Required)
   - Water savings in liters
   - Use positive numbers for savings
   - Use 0 or negative numbers for increased usage

6. **Value Total** (Required)
   - Total water usage in liters
   - Must be a positive number

7. **Task Message** (Required)
   - Message shown when this option is selected
   - Should be motivational and informative

8. **Category ID** (Required)
   - Must match the Category column
   - Used for internal categorization

9. **Type** (Required)
   - Either "Achievement" or "Task"
   - Use null for filtering questions (like vehicle ownership)

10. **Training Text** (Required)
    - Educational text about the question topic
    - Shared across all options of the same question

11. **Content Message** (Required)
    - Brief message for the content section
    - Shared across all options of the same question

12. **Image** (Required)
    - Image filename for the question
    - Must exist in assets folder

13. **Video URL** (Required)
    - YouTube video URL for additional information
    - Shared across all options of the same question

14. **Additional Info** (Required)
    - Extra information about the topic
    - Shared across all options of the same question

### Validation Rules

1. Each question (same ID) must have:
   - Same Category
   - Same Training Text
   - Same Content Message
   - Same Image
   - Same Video URL
   - Same Additional Info

2. Value rules:
   - Value Total must be ≥ 0
   - Value Saving can be negative or positive
   - Achievement type should generally have positive Value Saving
   - Task type should generally have 0 Value Saving

3. Type rules:
   - Must be either "Achievement", "Task", or null
   - null is only used for filtering questions

### How to Use

1. Fill in all required columns
2. Keep the same ID for all options of the same question
3. Ensure all shared content (training text, videos, etc.) is identical for the same question ID
4. Double-check value calculations
5. Verify all image files exist in the assets folder
6. Test video URLs to ensure they work

### Converting to Code

After reviewing and finalizing questions in Excel:
1. Export as CSV
2. Use the provided conversion script (to be created) to convert to questions.js format
3. Test the new questions in the app

### Available Categories

The WaterApp uses the following predefined categories to organize questions. Each category has a unique ID, title, icon, color theme, and specific focus area:

1. **DISHWASHING** (ID: dishwashing)
   - Title: Dishwashing
   - Color Theme: #4FC3F7 (Light Blue)
   - Description: Optimize your dishwashing habits
   - Examples: dishwasher usage, pre-rinsing, load size

2. **SHOWER** (ID: shower)
   - Title: Shower & Bath
   - Color Theme: #81C784 (Green)
   - Description: Improve shower water efficiency
   - Examples: shower duration, water usage methods

3. **LAUNDRY** (ID: laundry)
   - Title: Laundry
   - Color Theme: #7986CB (Indigo)
   - Description: Optimize laundry water usage
   - Examples: load size, washing frequency

4. **PLUMBING** (ID: plumbing)
   - Title: Plumbing
   - Color Theme: #FFB74D (Orange)
   - Description: Maintain efficient plumbing
   - Examples: flow regulators, leaking pipes

5. **DAILY** (ID: daily)
   - Title: Daily Activities
   - Color Theme: #BA68C8 (Purple)
   - Description: Improve daily water habits
   - Examples: teeth brushing, hand washing

6. **CAR** (ID: car)
   - Title: Car Washing
   - Color Theme: #4DB6AC (Teal)
   - Description: Efficient vehicle cleaning
   - Examples: car washing methods, cleaning frequency

Note: All questions MUST use one of these predefined categories to maintain consistency and proper organization within the app.

### Best Practices

1. Keep questions clear and concise
2. Ensure task messages are motivational
3. Verify all values make logical sense
4. Test all video links
5. Review content with team members
6. Update assets folder with any new images
7. Always use predefined categories from the list above
