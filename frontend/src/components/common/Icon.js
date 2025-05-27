import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Icon = ({ 
  name, 
  size = 24, 
  color = '#000', 
  style = {},
  ...props 
}) => {
  return <Ionicons name={name} size={size} color={color} style={style} {...props} />;
};

// Mapeo de nombres de iconos para mantener consistencia
export const IconNames = {
  // Navegación
  home: 'home',
  profile: 'person',
  settings: 'settings',
  back: 'arrow-back',
  menu: 'menu',
  close: 'close',
  
  // Acciones
  add: 'add',
  edit: 'create',
  delete: 'trash',
  save: 'save',
  share: 'share',
  
  // Actividad
  time: 'time',
  distance: 'location',
  speed: 'speedometer',
  calendar: 'calendar',
  stats: 'stats-chart',
  trophy: 'trophy',
  activity: 'fitness',
  heart: 'heart',
  flame: 'flame',
  
  // Estado
  success: 'checkmark-circle',
  error: 'alert-circle',
  warning: 'warning',
  info: 'information-circle',
  
  // Otros
  search: 'search',
  filter: 'filter',
  sort: 'funnel',
  refresh: 'refresh',
  upload: 'cloud-upload',
  download: 'cloud-download',
};

export default Icon; 