# Bill Split

A smart bill-splitting app that uses AI to analyze receipts and fairly distribute costs among friends.

🔗 **Live Demo:** [https://bill-split-lemon.vercel.app](https://bill-split-lemon.vercel.app)

## Features

- 🤖 **AI-Powered Receipt Analysis** - Upload a receipt photo and let Gemini AI extract items, tax, and tip automatically
- ✍️ **Manual Bill Creation** - Create and manage bills from scratch without a receipt
- 👥 **Smart Splitting** - Assign items to people with proportional tax and tip distribution
- 💸 **Venmo Integration** - Generate Venmo payment requests with detailed item breakdowns
- 👤 **User Profiles** - Save your Venmo ID and manage a friends list for quick access
- 📱 **Responsive Design** - Optimized mobile and desktop experiences

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **shadcn/ui** - UI component library
- **React Router** - Navigation

### Backend & Services
- **Firebase Authentication** - Google OAuth
- **Firebase Firestore** - User profiles and friends list storage
- **Google Gemini AI** - Receipt image analysis

### Deployment
- **Vercel** - Hosting and continuous deployment

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## How It Works

1. **Upload or Create** - Upload a receipt photo for AI analysis or manually create a bill
2. **Add People** - Add friends to the bill (with optional Venmo IDs)
3. **Assign Items** - Click on people badges to assign items (supports splitting items)
4. **View Split** - See exactly how much each person owes with tax and tip included
5. **Charge on Venmo** - Send payment requests directly through Venmo with itemized descriptions
