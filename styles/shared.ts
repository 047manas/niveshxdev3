export const sharedStyles = {
  // Container styles
  pageContainer: 'flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 sm:p-6 md:p-8',
  cardWrapper: 'w-full max-w-md bg-gray-800/50 backdrop-blur-lg border border-gray-700 shadow-xl rounded-xl',
  
  // Typography
  gradientHeading: 'text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent',
  description: 'text-gray-300 text-base',
  
  // Form elements
  inputBase: 'bg-gray-900/50 border-gray-600 text-white rounded-lg transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
  inputOTP: 'w-10 h-12 sm:w-12 sm:h-14',
  
  // Buttons
  primaryButton: 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white transition-all disabled:opacity-50',
  secondaryButton: 'text-white border-gray-700 bg-gray-800/50 hover:bg-gray-700/50 transition-colors',
  ghostButton: 'text-gray-400 hover:text-gray-300 transition-colors',
  
  // Alert messages
  errorAlert: 'p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400',
  successAlert: 'p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400',
  
  // Layout
  flexRow: 'flex flex-row items-center gap-4',
  flexCol: 'flex flex-col items-center gap-4',
  responsiveGrid: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  
  // Animations
  fadeIn: 'animate-in fade-in duration-500',
  slideUp: 'animate-in slide-in-from-bottom duration-500',
  
  // Media queries
  responsive: {
    sm: '@media (min-width: 640px)',
    md: '@media (min-width: 768px)',
    lg: '@media (min-width: 1024px)',
  }
};
