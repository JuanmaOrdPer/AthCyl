import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

const TabBarBackground = () => {
  return (
    <BlurView
      intensity={80}
      tint="light"
      style={StyleSheet.absoluteFill}
    />
  );
};

export default TabBarBackground;
