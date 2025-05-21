// src/styles/index.js
// Este archivo facilita la importación de múltiples estilos

// Sistema de diseño y tema
export { theme } from './theme.js';
export { appTheme } from './theme.js';

// Estilos comunes
export { default as commonStyles } from './common.styles';

// Componentes
export { default as achievementCardStyles } from './components/AchievementCard.styles';
export { default as activitySummaryStyles } from './components/ActivitySummary.styles';
export { default as errorBoundaryStyles } from './components/ErrorBoundary.styles';
export { default as goalCardStyles } from './components/GoalCard.styles';
export { default as notificationBannerStyles } from './components/NotificationBanner.styles';
export { default as trainingCardStyles } from './components/TrainingCard.styles';
export { default as trainingChartStyles } from './components/TrainingChart.styles';
export { default as trainingMapStyles } from './components/TrainingMap.styles';
export { default as trainingStatsStyles } from './components/TrainingStats.styles';

// Componentes comunes
export { default as datePickerFieldStyles } from './components/common/DatePickerField.styles';
export { default as formFieldStyles } from './components/common/FormField.styles';
export { default as selectFieldStyles } from './components/common/SelectField.styles';

// Pantallas - Auth
export { default as loginScreenStyles } from './screens/auth/LoginScreen.styles';
export { default as registerScreenStyles } from './screens/auth/RegisterScreen.styles';

// Pantallas - Main
export { default as achievementsScreenStyles } from './screens/main/AchievementsScreen.styles';
export { default as addTrainingScreenStyles } from './screens/main/AddTrainingScreen.styles';
export { default as goalsScreenStyles } from './screens/main/GoalsScreen.styles';
export { default as homeScreenStyles } from './screens/main/HomeScreen.styles';
export { default as profileScreenStyles } from './screens/main/ProfileScreen.styles';
export { default as statsScreenStyles } from './screens/main/StatsScreen.styles';
export { default as trainingDetailScreenStyles } from './screens/main/TrainingDetailScreen.styles';
export { default as trainingsScreenStyles } from './screens/main/TrainingsScreen.styles';