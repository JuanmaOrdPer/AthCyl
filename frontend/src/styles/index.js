// src/styles/index.js
// Este archivo facilita la importación de múltiples estilos

import theme, { colors, shadows } from './theme';

// Estilos comunes que se pueden reutilizar en toda la aplicación
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: theme.roundness,
    ...shadows.small,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  textInput: {
    marginVertical: 8,
    backgroundColor: colors.surface,
    borderRadius: theme.roundness,
    padding: 12,
  },
  button: {
    marginVertical: 8,
    borderRadius: theme.roundness,
    padding: 12,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
};

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

// Exportar tema y utilidades
export { theme, colors, shadows };

// Exportar estilos comunes como default
export default commonStyles;