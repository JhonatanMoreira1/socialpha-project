# Socialpha

#### Video Demo: <https://youtu.be/pOljmMz9SSg>

#### Description:
Socialpha is a comprehensive full-stack social networking platform designed to provide an intuitive and engaging experience for users. With a strong emphasis on interactivity and real-time communication, Socialpha allows users to create, share, and interact with content seamlessly. It offers a variety of features including the ability to create posts, like and comment on posts, upload images, and receive instant notifications, enhancing the overall social interaction experience.

Built using modern web technologies, Socialpha ensures optimal performance and scalability. The platform leverages Next.js for efficient server-side rendering and dynamic interactivity. This allows for an optimized, fast-loading experience, particularly when interacting with real-time updates, such as notifications and user-generated content. By utilizing PostgreSQL, a powerful relational database management system, the platform can scale efficiently while maintaining a structured and secure data storage system. Prisma, the chosen ORM, provides a seamless interface for database interactions, simplifying data management while ensuring high performance and scalability.

For user authentication, Socialpha integrates Clerk, a modern identity management solution. Clerk not only simplifies the process of user sign-ups and logins, but also ensures that each user’s session is secure, making login flows smooth and hassle-free. The integration of Clerk enhances security by providing tools for managing user sessions, and supporting authentication strategies like social logins.

The platform’s design focuses on providing a modern and responsive user interface, which is achieved using Tailwind CSS and Shadcn. Tailwind CSS ensures that the platform is visually appealing and easy to maintain, while Shadcn enhances the design with its pre-built components for consistent UI elements. Together, these technologies ensure a polished and professional look, with adaptive designs that function flawlessly across all screen sizes and devices, from desktop to mobile.

In essence, Socialpha integrates the latest technologies to deliver an interactive, engaging, and secure platform for social networking. Whether users are interacting with posts, chatting with friends, or browsing content, Socialpha provides an environment that fosters easy and effective social engagement.

## 🌍 Overview
Socialpha integrates cutting-edge technologies to ensure a fast and interactive experience:
- **Next.js**: For efficient rendering and state management of the app.
- **PostgreSQL**: A robust, scalable relational database.
- **Prisma**: An ORM that simplifies data handling and integrations with the database.
- **Clerk**: A secure authentication system with social login support.
- **Tailwind CSS & Shadcn**: Tools for efficient styling and responsive design.

With these components, Socialpha provides a stable and scalable platform, capable of supporting growth while delivering an engaging user experience.

## 🚀 Tech Stack
- **Framework**: Next.js App Router
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Clerk
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn
- **File Uploads**: UploadThing
- **Icons**: Lucide React

## 🛠️ Features
- **Server Components & Server Actions**: Efficient server-side rendering and optimized data handling.
- **API Integration**: Seamless communication with backend services via Route Handlers.
- **Data Fetching, Caching & Revalidation**: Optimized for fast loading times and real-time updates.
- **Authentication & Authorization**: Secure, role-based access control using Clerk.
- **File Uploads**: Reliable image upload functionality.
- **Real-Time Notifications**: Instant alerts for likes, comments, and follows.
- **Responsive UI**: Works seamlessly across devices with an optimized design.

## 📂 Project Structure
Socialpha is organized in a modular fashion, with reusable components, actions, and utilities, ensuring easy maintenance and scalability.

### 🔹 Components
- **Navbar.tsx**: Main navigation bar.
- **DesktopNavbar.tsx / MobileNavbar.tsx**: Adaptive navigation bars for different devices.
- **Sidebar.tsx**: Side navigation panel for easy access to features.
- **PostCard.tsx**: Displays individual posts with interaction options.
- **CreatePost.tsx**: Handles new post creation.
- **FollowButton.tsx**: Allows users to follow/unfollow others.
- **ImageUpload.tsx**: Manages image uploads through UploadThing.
- **ModeToggle.tsx**: Toggles between light and dark modes.
- **NotificationSkeleton.tsx**: Placeholder for notifications while loading.
- **ThemeProvider.tsx**: Manages theme settings.
- **WhoToFollow.tsx**: Suggests users to follow based on engagement.
- **DeleteAlertDialog.tsx**: Confirms before deleting a post.

### 🔹 Actions
Located in `src/actions/`, these actions handle key backend operations:
- **notification.action.ts**: Manages notification events.
- **profile.action.ts**: Handles user profile updates.
- **post.action.ts**: Processes post creation, deletion, and interactions.
- **user.action.ts**: Manages user authentication and data.

## 🔄 Workflow & Functionality
1. **User Authentication**: Users register and log in via Clerk.
2. **Post Creation & Interaction**: Users create posts, like, and comment.
3. **Real-Time Notifications**: Users receive alerts for interactions.
4. **Following System**: Users follow/unfollow other users.
5. **Dark Mode Support**: UI adapts to user preferences.

## 🏗️ Installation & Setup
1. Clone the repository:

```bash
git clone https://github.com/JhonatanMoreira1/socialpha-project
cd socialpha
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables for Clerk and PostgreSQL.
4. Run the development server:

```bash
npm run dev
```

5. Access the app at http://localhost:3000

## 📌 Conclusion
Socialpha is a feature-rich social networking platform that combines real-time interactivity with a smooth UI and secure authentication. Using modern technologies, it offers a scalable and high-performance experience for users, making social interactions seamless and engaging.
