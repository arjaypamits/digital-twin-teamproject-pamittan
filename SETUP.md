# Career Twin - AI Chat UI

A minimalist, dark blue and white chat interface for an AI-powered career guidance agent.

## Features

- **Clean Chat Interface**: Minimalist design with dark blue (#0F3A7D) and white color scheme
- **Responsive Layout**: Mobile-friendly design that adapts to all screen sizes
- **Real-time Messaging**: Simulate AI responses with smooth animations
- **Modern Header**: Navigation and GitHub link integration
- **Professional Footer**: Clean footer with multiple sections and links
- **Loading States**: Animated loading indicator for AI responses

## Design Specifications

- **Color Scheme**: Dark Blue (#0F3A7D) and White
- **Padding**: Minimal, pure aesthetic with reduced spacing
- **Typography**: Clean, readable fonts with proper hierarchy
- **Borders**: Subtle gray borders for clean separation
- **Icons**: Lucide React icons for modern appearance

## Project Structure

```
├── app/
│   ├── page.tsx          # Main chat interface
│   ├── layout.tsx        # Root layout with metadata
│   └── globals.css       # Dark blue/white theme
├── components/ui/        # Shadcn UI components
└── package.json         # Dependencies
```

## Getting Started

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Run Development Server**
   ```bash
   pnpm dev
   ```

3. **Open in Browser**
   - Navigate to `http://localhost:3000`
   - Start chatting with the Career Twin AI agent

## Customization

### Change Primary Color
Edit `/app/globals.css` and modify the `--primary` color:
```css
--primary: oklch(0.25 0.15 260); /* Change this value */
```

### Modify Chat Messages
Edit `/app/page.tsx` and update the `messages` state or the simulated AI responses in the `handleSendMessage` function.

### Update Navigation Links
Edit `/app/page.tsx` header section to change navigation menu items.

## Technologies Used

- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Component library
- **Lucide React**: Icon library
- **TypeScript**: Type safety

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Notes

- The AI responses are simulated with a 800ms delay
- Footer displays only essential information (no names or team listings)
- GitHub link opens to github.com (customize as needed)
- All styling uses Tailwind CSS with custom color tokens

## License

MIT - Feel free to use this for your projects!
