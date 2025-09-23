# WaterApp Questions Data

[Previous questions content remains the same...]

---

# Question Template and Calculation Guide

## Empty Question Template
```markdown
## Question [NUMBER]: [SHORT_TITLE]
**Category:** [CATEGORY_ID from categories.js]
**Question:** [Your question text here]
**Training Text:** [Educational text about the topic]
**Content Message:** [Brief motivational message]
**Image:** [image_name.jpg]
**Video:** [YouTube URL]
**Additional Info:** [Detailed information about the topic]

Options:
1. **[Option 1 Text]**
   - Value Saving: [Water saved in liters, positive for good habits]
   - Value Total: [Total water usage in liters]
   - Task Message: [Motivational message based on choice]
   - Type: [Achievement/Task/null]

2. **[Option 2 Text]**
   - Value Saving: [Water saved in liters]
   - Value Total: [Total water usage in liters]
   - Task Message: [Motivational message based on choice]
   - Type: [Achievement/Task/null]
```

## Value Calculation Guidelines

### Value Total (Water Usage)
- Must be a positive number
- Represents the total water usage for this behavior
- Examples:
  - Dishwasher: ~15L per cycle
  - Manual washing: ~126L per load
  - 5-min shower: ~70L
  - 15-min shower: ~250L
  - Tap with aerator: ~76L per day
  - Tap without aerator: ~120L per day
  - Full laundry load: ~180L
  - Car manual wash: ~200L
  - Car pressure wash: ~80L

### Value Saving (Water Savings)
- Can be positive or negative
- Positive: indicates water saved compared to worst option
- Negative: indicates additional water used compared to best option
- Calculate as: Best practice usage - Current usage
- Examples:
  - Dishwasher vs Manual: 126L - 15L = 111L saving
  - 5-min vs 15-min shower: 250L - 70L = 180L saving
  - Aerator vs No aerator: 120L - 76L = 44L saving

### Type Guidelines
1. **Achievement Type**
   - Best practice behaviors
   - Usually has positive Value Saving
   - Used when the behavior is optimal
   - Examples:
     - Using dishwasher (saves water vs manual)
     - Short showers (saves water vs long showers)
     - Using aerators (saves water vs regular taps)

2. **Task Type**
   - Behaviors that need improvement
   - Usually has 0 Value Saving
   - Used when there's room for improvement
   - Examples:
     - Manual dish washing
     - Long showers
     - No aerators installed

3. **null Type**
   - Used for filtering questions only
   - Both Value Saving and Value Total are 0
   - No Task Message needed
   - Examples:
     - Vehicle ownership question
     - Appliance ownership questions

### Task Message Guidelines
1. **For Achievements:**
   - Use congratulatory tone
   - Mention specific water savings
   - Keep it positive and motivating
   - Examples:
     - "Well done, you've saved X litres of water!"
     - "Great job! You're saving X liters per [time period]"
     - "Congratulations on saving X liters by [action]!"

2. **For Tasks:**
   - Use encouraging tone
   - Mention potential savings
   - Include "take the necessary action"
   - Make it educational
   - Examples:
     - "You could save X liters by [action]. Please take necessary action!"
     - "Did you know you can save X liters by [action]? Take the necessary action!"
     - "X liters more with [current behavior], take the necessary action!"

### Categories
Remember to use only these predefined categories:
- **DISHWASHING**: Dishwasher usage, washing habits
- **SHOWER**: Shower duration, bathing methods
- **LAUNDRY**: Washing machine usage, load sizes
- **PLUMBING**: Taps, pipes, water fixtures
- **DAILY**: Regular habits like teeth brushing
- **CAR**: Vehicle cleaning methods

### Image and Video Guidelines
- Images should be relevant and clear
- Place images in the assets folder
- Use .jpg or .png format
- Videos should be educational
- Prefer short, focused video content
- Use YouTube URLs for videos