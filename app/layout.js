import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata = {
  title: 'Liquid Cinema',
  description: 'My Favourite Cinema',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
