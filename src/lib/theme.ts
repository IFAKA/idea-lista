export function initializeTheme() {
  // Check for saved theme preference or default to system preference
  const savedTheme = localStorage.getItem('theme')
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  const theme = savedTheme || systemTheme

  // Apply theme to document
  document.documentElement.classList.toggle('dark', theme === 'dark')
  
  // Save theme preference
  localStorage.setItem('theme', theme)
}

export function toggleTheme() {
  const currentTheme = localStorage.getItem('theme') || 'light'
  const newTheme = currentTheme === 'light' ? 'dark' : 'light'
  
  document.documentElement.classList.toggle('dark', newTheme === 'dark')
  localStorage.setItem('theme', newTheme)
}

export function getCurrentTheme(): 'light' | 'dark' {
  return (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
}
