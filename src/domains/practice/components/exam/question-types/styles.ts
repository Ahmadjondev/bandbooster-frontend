/**
 * IELTS CD-Test Authentic Styling Constants
 * Faithfully replicates the official IELTS computer-based test interface
 * NO creative freedom - exact visual match required
 */

// ============= Colors (CD-IELTS Official) =============

export const ieltsColors = {
  // Primary interface colors
  background: {
    main: '#f5f5f5',      // Light gray background
    paper: '#ffffff',      // White content areas
    selected: '#e3f2fd',   // Light blue selection
    hover: '#f8f9fa',      // Subtle hover
    dark: '#263238',       // Dark mode background
    darkPaper: '#37474f',  // Dark mode content
  },
  
  // Text colors
  text: {
    primary: '#212121',    // Main text
    secondary: '#616161',  // Secondary text
    muted: '#9e9e9e',      // Muted/hint text
    light: '#ffffff',      // Light text on dark
    question: '#1a1a1a',   // Question text
  },
  
  // Border colors
  border: {
    light: '#e0e0e0',      // Light borders
    medium: '#bdbdbd',     // Medium borders
    focus: '#1976d2',      // Focus state
    selected: '#2196f3',   // Selected state
  },
  
  // Action colors
  action: {
    primary: '#1976d2',    // Primary blue
    selected: '#2196f3',   // Selected blue
    hover: '#1565c0',      // Hover blue
    success: '#4caf50',    // Green/success
    warning: '#ff9800',    // Orange/warning
    error: '#f44336',      // Red/error
  },
  
  // Option specific
  option: {
    default: '#ffffff',
    hover: '#f5f5f5',
    selected: '#e3f2fd',
    selectedBorder: '#2196f3',
    letterBg: '#f5f5f5',
    letterText: '#424242',
  },
  
  // TFNG/YNNG specific
  tfng: {
    true: '#4caf50',
    false: '#f44336',
    notGiven: '#9e9e9e',
    yes: '#4caf50',
    no: '#f44336',
  },
} as const;

// ============= Typography (CD-IELTS Official) =============

export const ieltsTypography = {
  // Font family
  fontFamily: {
    primary: "'Roboto', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    mono: "'Roboto Mono', 'Consolas', monospace",
  },
  
  // Font sizes
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.8125rem',   // 13px
    base: '0.9375rem', // 15px - IELTS standard
    md: '1rem',        // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
  },
  
  // Font weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ============= Spacing (CD-IELTS Official) =============

export const ieltsSpacing = {
  // Base spacing unit: 4px
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  
  // Component specific
  questionGap: '1.5rem',      // 24px between questions
  optionGap: '0.5rem',        // 8px between options
  sectionGap: '2rem',         // 32px between sections
  inputPadding: '0.5rem 0.75rem',
} as const;

// ============= Border Radius (CD-IELTS Official) =============

export const ieltsBorderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  default: '0.25rem', // 4px - IELTS standard
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  full: '9999px',
} as const;

// ============= Shadows (CD-IELTS Official) =============

export const ieltsShadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  default: '0 1px 3px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  focus: '0 0 0 2px rgba(25, 118, 210, 0.2)',
} as const;

// ============= Component Styles =============

export const ieltsComponentStyles = {
  // Question number badge - exact IELTS style
  questionBadge: {
    base: `
      inline-flex items-center justify-center
      min-w-[28px] h-7 px-1.5
      text-sm font-semibold
      bg-neutral-100 dark:bg-neutral-800
      text-neutral-700 dark:text-neutral-300
      border border-neutral-300 dark:border-neutral-600
      rounded
      shrink-0
    `,
    answered: `
      bg-primary-100 dark:bg-primary-900/30
      text-primary-700 dark:text-primary-300
      border-primary-300 dark:border-primary-700
    `,
    focused: `
      ring-2 ring-primary-500 ring-offset-1
    `,
  },
  
  // Radio/checkbox option - exact IELTS style
  option: {
    container: `
      flex items-start gap-3 p-3
      bg-white dark:bg-slate-800
      border border-neutral-200 dark:border-neutral-700
      rounded cursor-pointer
      transition-colors duration-150
      hover:bg-neutral-50 dark:hover:bg-slate-700/50
    `,
    containerSelected: `
      bg-primary-50 dark:bg-primary-900/20
      border-primary-500 dark:border-primary-400
    `,
    radio: `
      w-5 h-5 shrink-0 mt-0.5
      border-2 border-neutral-400 dark:border-neutral-500
      rounded-full
      transition-colors duration-150
    `,
    radioSelected: `
      border-primary-500 dark:border-primary-400
      bg-primary-500 dark:bg-primary-400
    `,
    checkbox: `
      w-5 h-5 shrink-0 mt-0.5
      border-2 border-neutral-400 dark:border-neutral-500
      rounded
      transition-colors duration-150
    `,
    checkboxSelected: `
      border-primary-500 dark:border-primary-400
      bg-primary-500 dark:bg-primary-400
    `,
    letter: `
      inline-flex items-center justify-center
      w-6 h-6 mr-2
      text-sm font-semibold
      bg-neutral-100 dark:bg-neutral-700
      text-neutral-600 dark:text-neutral-400
      rounded
    `,
    letterSelected: `
      bg-primary-500 text-white
    `,
    text: `
      flex-1 text-neutral-800 dark:text-neutral-200
      leading-relaxed
    `,
  },
  
  // Text input - exact IELTS style
  input: {
    base: `
      inline-block
      min-w-[120px] max-w-[200px]
      px-3 py-1.5
      text-center font-medium
      bg-white dark:bg-slate-800
      border-2 border-neutral-300 dark:border-neutral-600
      rounded
      text-neutral-900 dark:text-neutral-100
      placeholder:text-neutral-400
      focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500
      transition-colors duration-150
    `,
    inline: `
      mx-1 align-middle
    `,
    filled: `
      border-primary-400 dark:border-primary-500
      bg-primary-50 dark:bg-primary-900/20
    `,
  },
  
  // TFNG/YNNG buttons - exact IELTS style
  tfngButton: {
    base: `
      px-4 py-2
      text-sm font-semibold
      border-2 rounded
      transition-all duration-150
      cursor-pointer
    `,
    true: `
      border-emerald-500 bg-emerald-50 text-emerald-700
      dark:bg-emerald-900/20 dark:text-emerald-300
    `,
    false: `
      border-red-500 bg-red-50 text-red-700
      dark:bg-red-900/20 dark:text-red-300
    `,
    notGiven: `
      border-neutral-400 bg-neutral-100 text-neutral-700
      dark:bg-neutral-800 dark:text-neutral-300
    `,
    default: `
      border-neutral-300 bg-white text-neutral-600
      dark:border-neutral-600 dark:bg-slate-800 dark:text-neutral-400
      hover:border-neutral-400 hover:bg-neutral-50
      dark:hover:border-neutral-500 dark:hover:bg-slate-700
    `,
  },
  
  // Dropdown/Select - exact IELTS style
  select: {
    base: `
      w-full max-w-xs
      px-3 py-2 pr-10
      bg-white dark:bg-slate-800
      border-2 border-neutral-300 dark:border-neutral-600
      rounded
      text-neutral-900 dark:text-neutral-100
      cursor-pointer appearance-none
      focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500
      transition-colors duration-150
    `,
    filled: `
      border-primary-400 dark:border-primary-500
      bg-primary-50 dark:bg-primary-900/20
    `,
  },
  
  // Instruction box - exact IELTS style
  instruction: {
    container: `
      p-4 mb-6
      bg-amber-50 dark:bg-amber-900/10
      border-l-4 border-amber-400 dark:border-amber-500
      rounded-r
    `,
    title: `
      font-semibold text-neutral-900 dark:text-neutral-100
      mb-2
    `,
    text: `
      text-neutral-700 dark:text-neutral-300
      leading-relaxed whitespace-pre-wrap
    `,
  },
  
  // Section header - exact IELTS style
  sectionHeader: {
    container: `
      mb-6 pb-3
      border-b border-neutral-200 dark:border-neutral-700
    `,
    title: `
      text-lg font-bold
      text-neutral-900 dark:text-neutral-100
    `,
    range: `
      text-sm text-neutral-500 dark:text-neutral-400
      mt-1
    `,
  },
  
  // Table - exact IELTS style
  table: {
    container: `
      w-full overflow-x-auto
    `,
    table: `
      w-full border-collapse
      border border-neutral-300 dark:border-neutral-600
    `,
    headerCell: `
      px-4 py-3
      bg-neutral-100 dark:bg-neutral-800
      border border-neutral-300 dark:border-neutral-600
      text-left font-semibold
      text-neutral-900 dark:text-neutral-100
    `,
    cell: `
      px-4 py-3
      border border-neutral-300 dark:border-neutral-600
      text-neutral-800 dark:text-neutral-200
    `,
  },
  
  // Note completion nested list - exact IELTS style
  noteList: {
    container: `
      space-y-2
    `,
    sectionTitle: `
      font-semibold text-neutral-900 dark:text-neutral-100
      mb-2
    `,
    item: `
      text-neutral-800 dark:text-neutral-200
      leading-relaxed
    `,
    nested: `
      ml-6 mt-2 space-y-1
      border-l-2 border-neutral-200 dark:border-neutral-700
      pl-4
    `,
  },
  
  // Flow chart - exact IELTS style
  flowChart: {
    container: `
      space-y-4
    `,
    step: `
      flex items-start gap-4
      p-4
      bg-white dark:bg-slate-800
      border border-neutral-200 dark:border-neutral-700
      rounded
    `,
    stepNumber: `
      w-8 h-8 shrink-0
      flex items-center justify-center
      bg-primary-500 text-white
      rounded-full font-bold text-sm
    `,
    stepContent: `
      flex-1
      text-neutral-800 dark:text-neutral-200
      leading-relaxed
    `,
    arrow: `
      flex justify-center my-2
      text-neutral-400
    `,
  },
  
  // Matching options box - exact IELTS style
  matchingOptions: {
    container: `
      mb-6 p-4
      bg-neutral-50 dark:bg-neutral-800/50
      border border-neutral-200 dark:border-neutral-700
      rounded
    `,
    title: `
      font-semibold text-neutral-900 dark:text-neutral-100
      mb-3
    `,
    grid: `
      grid grid-cols-1 sm:grid-cols-2 gap-2
    `,
    item: `
      flex items-start gap-2
      text-neutral-700 dark:text-neutral-300
    `,
    letter: `
      font-bold text-primary-600 dark:text-primary-400
      shrink-0
    `,
    note: `
      mt-3 text-sm italic
      text-neutral-500 dark:text-neutral-400
    `,
  },
  
  // Example box - exact IELTS style
  example: {
    container: `
      mb-6 p-4
      bg-blue-50 dark:bg-blue-900/10
      border border-blue-200 dark:border-blue-800
      rounded
    `,
    label: `
      text-xs font-semibold uppercase tracking-wide
      text-blue-600 dark:text-blue-400
      mb-2
    `,
    question: `
      text-neutral-800 dark:text-neutral-200
      mb-2
    `,
    answer: `
      font-bold text-primary-600 dark:text-primary-400
    `,
  },
  
  // Visual placeholder (map/diagram) - exact IELTS style
  visualPlaceholder: {
    container: `
      mb-6 p-8
      bg-neutral-100 dark:bg-neutral-800
      border-2 border-dashed border-neutral-300 dark:border-neutral-600
      rounded
      text-center
    `,
    icon: `
      w-16 h-16 mx-auto mb-4
      text-neutral-400
    `,
    text: `
      text-neutral-500 dark:text-neutral-400
    `,
  },
} as const;

// ============= Helper Functions =============

export function getQuestionBadgeClass(isAnswered: boolean, isFocused: boolean): string {
  let classes = ieltsComponentStyles.questionBadge.base;
  if (isAnswered) classes += ' ' + ieltsComponentStyles.questionBadge.answered;
  if (isFocused) classes += ' ' + ieltsComponentStyles.questionBadge.focused;
  return classes;
}

export function getOptionContainerClass(isSelected: boolean): string {
  let classes = ieltsComponentStyles.option.container;
  if (isSelected) classes += ' ' + ieltsComponentStyles.option.containerSelected;
  return classes;
}

export function getTFNGButtonClass(option: 'TRUE' | 'FALSE' | 'NOT GIVEN' | 'YES' | 'NO', isSelected: boolean): string {
  if (!isSelected) return ieltsComponentStyles.tfngButton.base + ' ' + ieltsComponentStyles.tfngButton.default;
  
  const baseClass = ieltsComponentStyles.tfngButton.base;
  switch (option) {
    case 'TRUE':
    case 'YES':
      return baseClass + ' ' + ieltsComponentStyles.tfngButton.true;
    case 'FALSE':
    case 'NO':
      return baseClass + ' ' + ieltsComponentStyles.tfngButton.false;
    case 'NOT GIVEN':
      return baseClass + ' ' + ieltsComponentStyles.tfngButton.notGiven;
    default:
      return baseClass + ' ' + ieltsComponentStyles.tfngButton.default;
  }
}
