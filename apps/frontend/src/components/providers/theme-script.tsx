export function ThemeScript() {
  const script = `
    (function() {
      try {
        var stored = localStorage.getItem('theme-preference');
        var theme = stored || 'system';
        var resolved = theme;

        if (theme === 'system') {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        document.documentElement.classList.add(resolved);
      } catch (e) {}
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
