import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Share } from 'react-native';
import { Card, Title, Paragraph, Text, Button, Divider, ActivityIndicator, useTheme, IconButton, Menu } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import api from '../../services/api';
import styles from '../../styles/screens/auth/main/TrainingDetailScreen.styles';

const screenWidth = Dimensions.get('window').width - 32; // Ancho de pantalla menos márgenes

const TrainingDetailScreen = ({ route, navigation }) => {
  const { trainingId } = route.params;
  const theme = useTheme();
  
  const [training, setTraining] = useState(null);
  const [trackPoints, setTrackPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  
  useEffect(() => {
    loadTrainingData();
  }, []);
  
  const loadTrainingData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos del entrenamiento
      const trainingResponse = await api.get(`/api/trainings/trainings/${trainingId}/`);
      setTraining(trainingResponse.data);
      
      // Cargar puntos de seguimiento
      const trackPointsResponse = await api.get(`/api/trainings/trainings/${trainingId}/track_points/`);
      setTrackPoints(trackPointsResponse.data);
      
    } catch (error) {
      console.error('Error al cargar datos del entrenamiento:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del entrenamiento');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExportPDF = async () => {
    try {
      const response = await api.get(`/api/trainings/trainings/${trainingId}/export_pdf/`, {
        responseType: 'blob',
      });
      
      // Aquí se podría implementar la descarga del PDF
      Alert.alert('Éxito', 'PDF generado correctamente');
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      Alert.alert('Error', 'No se pudo exportar a PDF');
    }
  };
  
  const handleExportCSV = async () => {
    try {
      const response = await api.get(`/api/trainings/trainings/${trainingId}/export_csv/`, {
        responseType: 'blob',
      });
      
      // Aquí se podría implementar la descarga del CSV
      Alert.alert('Éxito', 'CSV generado correctamente');
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      Alert.alert('Error', 'No se pudo exportar a CSV');
    }
  };
  
  const handleShare = async () => {
    if (!training) return;
    
    try {
      const result = await Share.share({
        message: `¡Mira mi entrenamiento de ${training.activity_type}!\n\nDistancia: ${training.distance ? `${training.distance.toFixed(2)} km` : 'N/A'}\nDuración: ${training.duration || 'N/A'}\nVelocidad promedio: ${training.avg_speed ? `${training.avg_speed.toFixed(2)} km/h` : 'N/A'}\n\n${training.title}`,
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el entrenamiento');
    }
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Eliminar Entrenamiento',
      '¿Estás seguro de que quieres eliminar este entrenamiento? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          onPress: async () => {
            try {
              await api.delete(`/api/trainings/trainings/${trainingId}/`);
              Alert.alert('Éxito', 'Entrenamiento eliminado correctamente');
              navigation.goBack();
            } catch (error) {
              console.error('Error al eliminar entrenamiento:', error);
              Alert.alert('Error', 'No se pudo eliminar el entrenamiento');
            }
          },
          style: 'destructive' 
        },
      ]
    );
  };
  
  const formatDuration = (durationString) => {
    if (!durationString) return 'N/A';
    
    // Formato esperado: "HH:MM:SS"
    const parts = durationString.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };
  
  // Preparar datos para el mapa
  const getMapRegion = () => {
    if (trackPoints.length === 0) return null;
    
    let minLat = trackPoints[0].latitude;
    let maxLat = trackPoints[0].latitude;
    let minLng = trackPoints[0].longitude;
    let maxLng = trackPoints[0].longitude;
    
    trackPoints.forEach(point => {
      minLat = Math.min(minLat, point.latitude);
      maxLat = Math.max(maxLat, point.latitude);
      minLng = Math.min(minLng, point.longitude);
      maxLng = Math.max(maxLng, point.longitude);
    });
    
    const latDelta = maxLat - minLat + 0.005; // Añadir un pequeño margen
    const lngDelta = maxLng - minLng + 0.005;
    
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta > 0.01 ? latDelta : 0.01, // Asegurar un zoom mínimo
      longitudeDelta: lngDelta > 0.01 ? lngDelta : 0.01,
    };
  };
  
  // Preparar datos para los gráficos
  const getChartData = (dataKey) => {
    if (trackPoints.length === 0) return null;
    
    // Tomar un punto cada N para no sobrecargar el gráfico
    const step = Math.max(1, Math.floor(trackPoints.length / 50));
    const labels = [];
    const data = [];
    
    for (let i = 0; i < trackPoints.length; i += step) {
      const point = trackPoints[i];
      
      if (dataKey === 'speed') {
        if (point.speed !== null) {
          data.push(point.speed);
          // Usar tiempo relativo en minutos desde el inicio
          const timeMinutes = i / trackPoints.length * (training?.duration ? parseInt(training.duration.split(':')[0]) * 60 + parseInt(training.duration.split(':')[1]) : 0);
          labels.push(Math.floor(timeMinutes).toString());
        }
      } else if (dataKey === 'heart_rate') {
        if (point.heart_rate !== null) {
          data.push(point.heart_rate);
          const timeMinutes = i / trackPoints.length * (training?.duration ? parseInt(training.duration.split(':')[0]) * 60 + parseInt(training.duration.split(':')[1]) : 0);
          labels.push(Math.floor(timeMinutes).toString());
        }
      } else if (dataKey === 'elevation') {
        if (point.elevation !== null) {
          data.push(point.elevation);
          const distanceKm = i / trackPoints.length * (training?.distance || 0);
          labels.push(distanceKm.toFixed(1));
        }
      }
    }
    
    if (data.length === 0) return null;
    
    return {
      labels: labels.length > 10 ? labels.filter((_, i) => i % Math.floor(labels.length / 10) === 0) : labels,
      datasets: [
        {
          data,
          color: () => theme.colors.primary,
          strokeWidth: 2,
        }
      ],
    };
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando datos del entrenamiento...</Text>
      </View>
    );
  }
  
  if (!training) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>No se pudo cargar el entrenamiento</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Volver
        </Button>
      </View>
    );
  }
  
  const mapRegion = getMapRegion();
  const speedChartData = getChartData('speed');
  const heartRateChartData = getChartData('heart_rate');
  const elevationChartData = getChartData('elevation');
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View>
          <Title style={styles.title}>{training.title}</Title>
          <Text style={styles.date}>
            {new Date(training.date).toLocaleDateString()} - {training.start_time}
          </Text>
        </View>
        
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={24}
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item onPress={handleExportPDF} title="Exportar a PDF" />
          <Menu.Item onPress={handleExportCSV} title="Exportar a CSV" />
          <Menu.Item onPress={handleShare} title="Compartir" />
          <Divider />
          <Menu.Item onPress={handleDelete} title="Eliminar" titleStyle={{ color: theme.colors.error }} />
        </Menu>
      </View>
      
      {/* Mapa del recorrido */}
      {trackPoints.length > 0 && mapRegion && (
        <Card style={styles.card}>
          <Card.Title title="Recorrido" />
          <Card.Content>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                region={mapRegion}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Polyline
                  coordinates={trackPoints.map(point => ({
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }))}
                  strokeColor={theme.colors.primary}
                  strokeWidth={3}
                />
                <Marker
                  coordinate={{
                    latitude: trackPoints[0].latitude,
                    longitude: trackPoints[0].longitude,
                  }}
                  pinColor="green"
                  title="Inicio"
                />
                <Marker
                  coordinate={{
                    latitude: trackPoints[trackPoints.length - 1].latitude,
                    longitude: trackPoints[trackPoints.length - 1].longitude,
                  }}
                  pinColor="red"
                  title="Fin"
                />
              </MapView>
            </View>
          </Card.Content>
          <Card.Actions>
            <Button>Ver Mapa Completo</Button>
          </Card.Actions>
        </Card>
      )}
      
      {/* Resumen del entrenamiento */}
      <Card style={styles.card}>
        <Card.Title title="Resumen" />
        <Card.Content>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="speedometer-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.statLabel}>Distancia</Text>
              <Text style={styles.statValue}>
                {training.distance ? `${training.distance.toFixed(2)} km` : 'N/A'}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.statLabel}>Duración</Text>
              <Text style={styles.statValue}>
                {formatDuration(training.duration)}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="trending-up-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.statLabel}>Vel. Media</Text>
              <Text style={styles.statValue}>
                {training.avg_speed ? `${training.avg_speed.toFixed(1)} km/h` : 'N/A'}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="flash-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.statLabel}>Vel. Máx</Text>
              <Text style={styles.statValue}>
                {training.max_speed ? `${training.max_speed.toFixed(1)} km/h` : 'N/A'}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.statLabel}>FC Media</Text>
              <Text style={styles.statValue}>
                {training.avg_heart_rate ? `${training.avg_heart_rate.toFixed(0)} ppm` : 'N/A'}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="heart" size={24} color={theme.colors.primary} />
              <Text style={styles.statLabel}>FC Máx</Text>
              <Text style={styles.statValue}>
                {training.max_heart_rate ? `${training.max_heart_rate.toFixed(0)} ppm` : 'N/A'}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="trending-up" size={24} color={theme.colors.primary} />
              <Text style={styles.statLabel}>Desnivel</Text>
              <Text style={styles.statValue}>
                {training.elevation_gain ? `${training.elevation_gain.toFixed(0)} m` : 'N/A'}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.statLabel}>Calorías</Text>
              <Text style={styles.statValue}>
                {training.calories ? `${training.calories} kcal` : 'N/A'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
      
      {/* Gráficos */}
      {speedChartData && (
        <Card style={styles.card}>
          <Card.Title title="Velocidad" />
          <Card.Content>
            <LineChart
              data={speedChartData}
              width={screenWidth}
              height={220}
              chartConfig={{
                backgroundColor: theme.colors.surface,
                backgroundGradientFrom: theme.colors.surface,
                backgroundGradientTo: theme.colors.surface,
                decimalPlaces: 1,
                color: () => theme.colors.primary,
                labelColor: () => '#666',
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '3',
                  strokeWidth: '1',
                  stroke: theme.colors.primary,
                },
              }}
              bezier
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=" km/h"
              xAxisLabel="min"
            />
          </Card.Content>
        </Card>
      )}
      
      {heartRateChartData && (
        <Card style={styles.card}>
          <Card.Title title="Ritmo Cardíaco" />
          <Card.Content>
            <LineChart
              data={heartRateChartData}
              width={screenWidth}
              height={220}
              chartConfig={{
                backgroundColor: theme.colors.surface,
                backgroundGradientFrom: theme.colors.surface,
                backgroundGradientTo: theme.colors.surface,
                decimalPlaces: 0,
                color: () => '#e74c3c',
                labelColor: () => '#666',
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '3',
                  strokeWidth: '1',
                  stroke: '#e74c3c',
                },
              }}
              bezier
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=" ppm"
              xAxisLabel="min"
            />
          </Card.Content>
        </Card>
      )}
      
      {elevationChartData && (
        <Card style={styles.card}>
          <Card.Title title="Elevación" />
          <Card.Content>
            <LineChart
              data={elevationChartData}
              width={screenWidth}
              height={220}
              chartConfig={{
                backgroundColor: theme.colors.surface,
                backgroundGradientFrom: theme.colors.surface,
                backgroundGradientTo: theme.colors.surface,
                decimalPlaces: 0,
                color: () => '#8e44ad',
                labelColor: () => '#666',
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '3',
                  strokeWidth: '1',
                  stroke: '#8e44ad',
                },
              }}
              bezier
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=" m"
              xAxisLabel="km"
            />
          </Card.Content>
        </Card>
      )}
      
      {/* Descripción */}
      {training.description && (
        <Card style={styles.card}>
          <Card.Title title="Descripción" />
          <Card.Content>
            <Paragraph>{training.description}</Paragraph>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

export default TrainingDetailScreen;
