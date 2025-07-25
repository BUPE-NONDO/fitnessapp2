// Simple utility function for combining class names
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

// Utility function to format dates
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Utility function to calculate progress percentage
export function calculateProgress(current: number, target: number): number {
  return Math.min(100, Math.max(0, (current / target) * 100));
}

// Utility function to get time of day greeting
export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
