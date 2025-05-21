import React from 'react';
import { View, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { LineChart, BarChart } from 'react-native-chart-kit';
import styles from '../styles/components/TrainingChart.styles';

const screenWidth = Dimensions.get('window').width - 32; // Ancho de pantalla menos márgenes

/**
 * Componente para mostrar gráficos de entrenamiento
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título del gráfico
 * @param {Object} props.data - Datos para el gráfico (formato compatible con react-native-chart-kit)
 * @param {string} props.type - Tipo de gráfico ('line' o 'bar')
 * @param {string} props.yAxisSuffix - Sufijo para el eje Y (ej: 'km', 'min', etc.)
 * @param {string} props.xAxisLabel - Etiqueta para el eje X
 * @param {number} props.height - Altura del gráfico (por defecto: 220)
 * @param {boolean} props.bezier - Si se debe usar curva bezier (solo para LineChart)
 * @param {string} props.color - Color principal del gráfico (opcional)
 */
const TrainingChart = ({ 
  title, 
  data, 
  type = 'line', 
  yAxisSuffix = '', 
  xAxisLabel = '',
  height = 220,
  bezier = true,
  color = null
}) => {
  const theme = useTheme();
  
  // Si no hay datos, mostrar mensaje
  if (!data || !data.labels || !data.datasets || data.datasets.length === 0 || data.datasets[0].data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay datos disponibles</Text>
      </View>
    );
  }
  
  // Configuración común del gráfico
  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 1,
    color: () => color || theme.colors.primary,
    labelColor: () => '#666',
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '1',
      stroke: color || theme.colors.primary,
    },
  };
  
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      {type === 'line' ? (
        <LineChart
          data={data}
          width={screenWidth}
          height={height}
          chartConfig={chartConfig}
          bezier={bezier}
          style={styles.chart}
          yAxisSuffix={yAxisSuffix}
          xAxisLabel={xAxisLabel}
          fromZero
        />
      ) : (
        <BarChart
          data={data}
          width={screenWidth}
          height={height}
          chartConfig={chartConfig}
          style={styles.chart}
          yAxisSuffix={yAxisSuffix}
          xAxisLabel={xAxisLabel}
          fromZero
        />
      )}
    </View>
  );
};

export default TrainingChart;
