# 📄 CollabWrite — Real-Time Collaborative Document Editor

**CollabWrite** is a real-time collaborative text editor that allows multiple users to create, edit, and manage documents simultaneously.  
It includes authentication, role-based permissions, autosaving, a responsive UI, and live collaboration—similar to Google Docs (light version).

* * *

## 🚀 Features

### 📝 Real-Time Editing

*   Multiple users can edit the same document at once
    
*   Live cursor sync (optional future enhancement)
    
*   Auto-save using Firestore real-time listeners
    

### 👥 Role-Based Access

*   **Owner**, **Editor**, and **Viewer** roles
    
*   Permission-based editing
    
*   Secure Firestore rules (strong access control)
    

### 📂 Document Management

*   Create, rename, delete documents
    
*   Collaborative sharing via email
    
*   Organized dashboard view
    

### 🔐 Authentication

*   Firebase Email/Password Auth
    
*   Protected routes
    
*   Auto-redirect based on login state
    

### 🎨 Modern UI

*   Clean and responsive
    
*   Dark/Light theme toggle
    
*   Hero landing page + feature showcase
    

### 🧩 Tech Stack

*   **React (Vite)**
    
*   **Firebase Authentication**
    
*   **Firebase Firestore (real-time database)**
    
*   **Bootstrap / Custom CSS**
    
*   **Lucide Icons**
    

* * *

## 🏗️ Project Structure

`collabwrite/ │── src/ │   ├── components/ │   │   ├── Navbar.jsx │   │   ├── ProtectedRoute.jsx │   │   └── EditorTools.jsx (optional) │   ├── pages/ │   │   ├── LandingPage.jsx │   │   ├── Login.jsx │   │   ├── Signup.jsx │   │   ├── Dashboard.jsx │   │   └── Editor.jsx │   ├── firebase.js │   ├── App.jsx │   └── main.jsx │ │── public/ │── index.html │── package.json │── README.md`

* * *

## 🔥 Firebase Setup

### 1️⃣ Create Firebase Project

[https://console.firebase.google.com/](https://console.firebase.google.com/)

### 2️⃣ Enable Services

*   Authentication → Email/Password
    
*   Firestore Database → Start in production mode
    

### 3️⃣ Firestore Rules

Use secure role-based rules:

`rules_version = '2'; service cloud.firestore {   match /databases/{database}/documents {     match /documents/{docId} {       allow read: if request.auth != null         && (resource.data.ownerId == request.auth.uid         || (request.auth.token.email in resource.data.permissions));        allow write: if request.auth != null         && (resource.data.ownerId == request.auth.uid         || (           (request.auth.token.email in resource.data.permissions)           && resource.data.permissions[request.auth.token.email] == "editor"         ));     }   } }`

* * *

## ⚙️ Installation & Setup

### 1️⃣ Clone Repo

`git clone https://github.com/your-username/collabwrite.git cd collabwrite`

### 2️⃣ Install Packages

`npm install`

### 3️⃣ Add Firebase Config

Create **src/firebase.js**:

`import { initializeApp } from "firebase/app"; import { getAuth } from "firebase/auth"; import { getFirestore } from "firebase/firestore";  const firebaseConfig = {   apiKey: "YOUR_KEY",   authDomain: "YOUR_URL",   projectId: "YOUR_ID",   storageBucket: "",   messagingSenderId: "",   appId: "" };  const app = initializeApp(firebaseConfig); export const auth = getAuth(app); export const db = getFirestore(app);`

### 4️⃣ Start App

`npm run dev`

* * *

## 🧪 Upcoming Enhancements

🔹 Real-time chat inside editor  
🔹 Collaborative cursors  
🔹 Document version history  
🔹 Export as PDF / DOCX  
🔹 Offline editing mode  
🔹 Team folders & workspace management

* * *

## 📸 Screenshots (Add your images)

`/screenshots  ├── landing-page.png  ├── dashboard.png  ├── editor.png  ├── login.png`

To embed in README:

`![Landing Page](./screenshots/landing-page.png)`

* * *

## 📦 Deployment

### 🔹 Deploy on Vercel

`npm run build`

Upload **dist** folder to Vercel.

### 🔹 Firebase Hosting (Optional)

`firebase init hosting firebase deploy`

* * *

## 🙌 Credits

Built with ❤️ by **Vardan Singhal**  
If you like this project, ⭐ star the repo and follow for more!

* * *

## 📜 License

MIT License – free to use & modify.