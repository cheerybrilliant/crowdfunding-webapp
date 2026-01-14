# Study Guide - Crowdfunding Platform

## For Beginners: How to Study This Code

### Step 1: Understanding HTML Structure

**Start with index.html** - This is the simplest page to understand.

#### Key HTML Elements to Learn:
```html
<!DOCTYPE html>           <!-- Tells browser this is HTML5 -->
<html lang="en">          <!-- Root element, language is English -->
<head>                    <!-- Contains metadata -->
  <meta charset="UTF-8">  <!-- Character encoding -->
  <title>Page Title</title>
  <link rel="stylesheet" href="styles.css">  <!-- Links CSS file -->
</head>
<body>                    <!-- Visible content goes here -->
  <nav>                   <!-- Navigation menu -->
  <section>               <!-- Section of content -->
  <div>                   <!-- Generic container -->
  <footer>                <!-- Footer section -->
</body>
</html>
```

### Step 2: Understanding CSS Styling

**Open styles.css** - This controls how everything looks.

#### Key CSS Concepts:

1. **Selectors** - Target HTML elements
```css
body { }              /* Targets <body> tag */
.navbar { }           /* Targets class="navbar" */
#myId { }             /* Targets id="myId" */
```

2. **Properties** - Define styles
```css
color: #333;          /* Text color */
background-color: #fff;  /* Background color */
padding: 1rem;        /* Space inside element */
margin: 1rem;         /* Space outside element */
```

3. **Layout** - Position elements
```css
display: flex;        /* Flexible box layout */
display: grid;        /* Grid layout */
```

### Step 3: Understanding JavaScript

**Open script.js** - This adds interactivity.

#### Key JavaScript Concepts:

1. **Variables** - Store data
```javascript
const userName = 'John';     // Cannot be changed
let userAge = 25;            // Can be changed
```

2. **Functions** - Reusable code blocks
```javascript
function showAlert(message, type) {
    // Code here runs when function is called
}
```

3. **Event Listeners** - Respond to user actions
```javascript
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();  // Stop form from submitting normally
    // Your code here
});
```

4. **Local Storage** - Save data in browser
```javascript
localStorage.setItem('key', 'value');    // Save
localStorage.getItem('key');             // Get
localStorage.removeItem('key');          // Delete
```

## File-by-File Study Plan

### Week 1: Basic Pages
- **Day 1**: Study `index.html` and understand the structure
- **Day 2**: Study `styles.css` - focus on navbar and hero section
- **Day 3**: Study `create-account.html` and form elements
- **Day 4**: Study `login.html` and understand forms
- **Day 5**: Study `script.js` - validation functions

### Week 2: Advanced Pages
- **Day 1**: Study `campaigns.html` - dynamic content loading
- **Day 2**: Study `campaign-details.html` - URL parameters
- **Day 3**: Study `donate.html` - form handling
- **Day 4**: Study `events.html` - calendar generation
- **Day 5**: Study `hospital-dashboard.html` - complex layout

## Common Code Patterns

### 1. Navigation Bar (Used in all pages)
```html
<nav class="navbar">
    <a href="index.html" class="logo">CancerCare</a>
    <ul class="nav-links">
        <li><a href="index.html">Home</a></li>
        <!-- More links -->
    </ul>
</nav>
```

### 2. Form Structure
```html
<form id="myForm">
    <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" required>
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>
</form>
```

### 3. Card Layout
```html
<div class="card">
    <h3>Card Title</h3>
    <p>Card content goes here</p>
    <a href="#" class="btn btn-primary">Button</a>
</div>
```

### 4. JavaScript Form Handling
```javascript
document.getElementById('myForm').addEventListener('submit', function(e) {
    e.preventDefault();  // Stop default form submission
    
    // Get form values
    const email = document.getElementById('email').value;
    
    // Validate
    if (!validateEmail(email)) {
        showAlert('Invalid email', 'error');
        return;
    }
    
    // Process form
    showAlert('Success!', 'success');
});
```

## Exercises to Try

### Beginner Level:
1. Change the platform name from "CancerCare" to your own name
2. Change the color scheme (edit colors in styles.css)
3. Add a new link to the navigation bar
4. Change the text in the hero section

### Intermediate Level:
1. Add a new campaign to the sampleCampaigns array
2. Create a new event in the sampleEvents array
3. Add a new page and link it in the navigation
4. Modify the form validation rules

### Advanced Level:
1. Add a search feature to filter campaigns
2. Create a donation history page
3. Add more fields to the patient verification form
4. Create a statistics page showing total donations

## Understanding the Flow

### User Registration Flow:
1. User visits `create-account.html`
2. Fills out the form
3. JavaScript validates the input
4. Data is saved to localStorage
5. User is redirected based on account type

### Donation Flow:
1. User clicks "Donate" on a campaign
2. Redirected to `donate.html?campaign=1`
3. JavaScript reads the campaign ID from URL
4. Shows campaign information
5. User fills donation form
6. JavaScript validates and processes

### Hospital Admin Flow:
1. Admin visits `hospital-login.html`
2. Enters credentials (HOSP001 / hospital123)
3. JavaScript validates credentials
4. Redirected to `hospital-dashboard.html`
5. Can manage patients and events

## Tips for Learning

1. **Use Browser Developer Tools**
   - Press F12 to open
   - Inspect elements
   - See console messages
   - Debug JavaScript

2. **Make Small Changes**
   - Change one thing at a time
   - Refresh browser to see changes
   - If something breaks, undo and try again

3. **Read Comments**
   - All code has helpful comments
   - Comments explain what code does
   - Use them to understand logic

4. **Experiment**
   - Don't be afraid to break things
   - You can always restore from backup
   - Learning by doing is best

## Common Mistakes to Avoid

1. **Forgetting to link CSS/JS files**
   - Always check `<link>` and `<script>` tags

2. **Typos in IDs and classes**
   - JavaScript won't find elements if names don't match

3. **Not using browser console**
   - Errors show in console (F12)
   - Use `console.log()` to debug

4. **Forgetting preventDefault()**
   - Forms will reload page without it

## Resources for Further Learning

- **HTML**: W3Schools HTML Tutorial
- **CSS**: CSS-Tricks, Flexbox Froggy (game)
- **JavaScript**: JavaScript.info, FreeCodeCamp

## Questions to Ask Yourself

As you study each file, ask:
1. What does this element/code do?
2. Why is it structured this way?
3. How does it connect to other files?
4. What happens if I change this?
5. Can I create something similar?

---

**Remember**: Everyone starts as a beginner. Take your time, practice regularly, and don't hesitate to experiment!

Good luck with your learning journey! 🚀

