# 📚 Joshua's Book & Notes Vault

**Author:** Joshua Mulongo
**GitHub:** https://github.com/gunnogere/book_and_notes_vault
**Email:** [j.mulongo@alustudent.com](mailto:j.mulongo@alustudent.com)

---

## 🚀 Project Overview

Joshua's Book & Notes Vault is a privacy-focused, modular personal library manager designed to help users organize books, notes, and reading progress in a distraction-free environment.

Built with a mobile-first philosophy, the application emphasizes simplicity, accessibility, and performance while maintaining a clean and responsive user experience.

### 🛠 Technology Stack

* **Architecture:** Vanilla JavaScript (ES6 Modules)
* **Programming Style:** Functional approach to state management
* **UI/UX:** Modern CSS3 with Custom Properties (CSS Variables)
* **Layout:** Responsive Grid and Flexbox system
* **Persistence:** Native LocalStorage
* **Performance:** Zero external dependencies
* **Security:** HTML escaping and safe regex handling to prevent XSS during search highlighting

---

## 📁 Directory Structure

```text
.
├── assets/
│   ├── docs/
│   └── images/
│       └── logo.jpg
├── image/
│   └── screenshots/
├── scripts/
│   ├── app.js
│   ├── add_book.js
│   ├── search.js
│   └── storage.js
├── styles/
│   └── site.css
├── index.html
├── add_book.html
├── records.html
├── settings.html
├── tests.html
├── seed.json
└── README.md
```

---

## 🏁 Getting Started

### Clone the Repository

```bash
git clone https://github.com/gunnogere/book_and_notes_vault.git
```

### Run Locally

Since the project is built with vanilla HTML, CSS, and JavaScript, no build tools are required.

Simply open:

```text
index.html
```

in any modern browser.

### No Installation Required

```text
npm install ❌
build step ❌
framework setup ❌
```

---

## 🎨 Core Features

### 📖 Library Management

* Add new books and notes
* Edit existing records
* Automatically update duplicate entries
* Track reading progress

### 🔍 Regex-Powered Search

* Advanced searching using regular expressions
* Real-time result filtering
* Match highlighting
* Safe regex compilation

### 💾 Persistent Storage

* LocalStorage-based data persistence
* Automatic state saving
* Theme preference persistence

### 🌗 Theme Engine

* Light Mode
* Dark Mode
* Persistent theme memory

### 📱 Responsive Experience

* Mobile-first design
* Desktop table view
* Mobile card view
* Adaptive layouts across devices

### 📂 Import & Export

* JSON-based bulk import
* Data export support
* Record synchronization

### 📊 Dashboard Analytics

* Total books
* Author statistics
* Tag statistics
* Reading summaries

---

## 🔍 Validation & Regex Rules

| Field               | Pattern                                              | Purpose                                  |
| ------------------- | ---------------------------------------------------- | ---------------------------------------- |
| Title / Author      | `/^\S(?:.*\S)?$/`                                    | Prevents leading and trailing spaces     |
| Numeric Values      | `/^(0\|[1-9]\d*)(\.\d{1,2})?$/`                      | Validates positive integers and decimals |
| Date                | `/^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$/` | Enforces ISO date format                 |
| Tags                | `/^[A-Za-z-]+(?:,[A-Za-z-]+)*$/`                     | Comma-separated tags                     |
| Duplicate Detection | `/\b(\w+)\s+\1\b/i`                                  | Detects repeated consecutive words       |

---

## ⌨️ Accessibility Features

The application follows accessibility-first principles.

### Navigation

* Skip-to-content links
* Keyboard-only navigation support
* Focus management

### Screen Reader Support

* Semantic HTML structure
* ARIA live regions
* Accessible status messages

### Keyboard Shortcuts

| Key         | Action                            |
| ----------- | --------------------------------- |
| Tab         | Move focus forward                |
| Shift + Tab | Move focus backward               |
| Enter       | Activate buttons and submit forms |

### Visual Accessibility

* High-contrast theme palette
* Responsive typography
* Consistent spacing system

---

## 📊 Data Model

Example application record:

```json
[
  {
    "id": "rec_0001",
    "title": "How to Code - Intro for firsttimers",
    "author": "Joshua Mulongo",
    "pages": 23,
    "tag": "firsttimercoder,newbieDev",
    "dateAdded": "2026-06-17",
    "updatedAt": "2026-06-18T12:55:25.984Z"
  }
]
```

### State Management

```javascript
const KEY = "app:data";

export const load = () =>
  JSON.parse(localStorage.getItem(KEY) || "[]");

export const save = (data) =>
  localStorage.setItem(KEY, JSON.stringify(data));
```

---

## 🗺️ Application Pages

### 🏠 Dashboard (`index.html`)

Displays:

* Overview statistics
* Reading summaries
* Quick navigation

### ➕ Add Book (`add_book.html`)

Provides:

* Book creation form
* Validation engine
* Bulk import functionality

### 📚 Records (`records.html`)

Provides:

* Search interface
* Sorting functionality
* Record management

### ⚙️ Settings (`settings.html`)

Provides:

* Theme configuration
* Application preferences
* Storage controls

### 🧪 Tests (`tests.html`)

Provides:

* Validation testing
* Regex verification
* Storage logic testing
* Pass/fail reporting

---

## 🧪 Testing

The project includes an integrated testing suite.

### Running Tests

1. Open `tests.html`
2. Execute the test suite
3. Review pass/fail results

The suite validates:

* Regex patterns
* Form validation
* LocalStorage functionality
* Data processing logic

---

## 📖 Project Documentation

Additional project planning documents are available in:

```text
assets/docs/
```

Including:

* Accessibility (A11Y) Plan
* Data Model Documentation
* UI/UX Wireframes
* User Flow Diagrams

---

## 🧪 Testing

The project includes an integrated testing suite.

### Running Tests

1. Open `tests.html`
2. Execute the test suite
3. Review pass/fail results

The suite validates:

- Regex patterns
- Form validation
- LocalStorage functionality
- Data processing logic

### ♿ Accessibility (A11Y) Testing Results

The application was manually tested against core accessibility requirements to ensure an inclusive user experience.

| Check | Result |
|--------|--------|
| Keyboard navigation | ✅ Passed |
| Visible focus states | ✅ Passed |
| Form labels | ✅ Passed |
| Color contrast | ✅ Passed |
| Screen reader semantics | ✅ Passed |
| ARIA live regions | ✅ Passed |

#### Accessibility Features Verified

- All interactive elements are reachable using keyboard-only navigation.
- Focus indicators remain visible throughout navigation flows.
- Form controls are associated with descriptive labels.
- Color combinations meet readability and contrast requirements.
- Semantic HTML landmarks improve screen reader navigation.
- Dynamic status and validation messages are announced through ARIA live regions.

---

## 🤖 AI Assistance & Attribution

This project was designed, developed, and submitted by **Joshua Mulongo**.

Generative AI tools were used as productivity aids for documentation, testing support, refinement, and technical review.

### AI-Generated & AI-Assisted Files

| File         | Description                                                                                     | Conversation Reference                                     |
| ------------ | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `README.md`  | Project documentation, architecture overview, feature descriptions, and repository presentation | https://chatgpt.com/c/6a340384-cc80-83ea-ab3c-a5eb2a7c974a |
| `tests.html` | Test suite structure, validation scenarios, and testing workflow generation                     | https://chatgpt.com/c/6a3403be-c638-83ea-8e0b-036b32b9edf7 |

### Disclaimer

The files listed above were generated or substantially refined using AI assistance based on project requirements, implementation details, and design decisions provided by the author.

All application logic, architectural decisions, source code integration, testing, validation of outputs, and final submission remain the responsibility of the project author.

AI was used as a development and documentation assistant to improve productivity, consistency, and clarity. All generated content was reviewed, verified, and adapted before inclusion in this repository.

### Transparency Statement

In accordance with academic integrity and professional software development practices, AI-assisted artifacts are explicitly identified and attributed within this repository.

The use of AI tools does not diminish the author's ownership of the project, its implementation, or its final deliverables.

---

## 👨‍💻 Author

**Joshua Mulongo**

* GitHub: https://github.com/gunnogere
* Email: [j.mulongo@alustudent.com](mailto:j.mulongo@alustudent.com)

---

© 2026 Joshua's Book & Notes Vault

Built for the ALU Summative Assignment.

**AI Attribution:** Portions of the documentation (`README.md`) and testing artifacts (`tests.html`) were generated or refined with AI assistance. See the **AI Assistance & Attribution** section above for details.
