import "./globals.css";

export const metadata = {
  title: "Asterisk — Intelligent Chat Assistant",
  description:
    "Chat with Asterisk, your intelligent coding assistant powered by advanced language models.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/astrict_dark.jpeg" type="image/png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
