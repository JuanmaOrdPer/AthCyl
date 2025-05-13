import React, { useContext, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { Title, Text, Card, Button, TextInput, Avatar, useTheme, Divider } from 'react-native-paper';
import { AuthContext } from '../../contexts/AuthContext';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import api from '../../services/api';

const ProfileScreen = () => {
  const { user, updateProfile, logout } = useContext(AuthContext);
  const theme = useTheme();
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    height: user?.height || '',
    weight: user?.weight || '',
    birth_date: user?.birth_date || '',
  });
  
  const handleInputChange = (name, value) => {
    setUserData({
      ...userData,
      [name]: value,
    });
  };
  
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await updateProfile(userData);
      setEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUploadProfilePicture = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return;
      }
      
      const fileUri = result.assets[0].uri;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      
      if (fileInfo.size > 5 * 1024 * 1024) {
        Alert.alert('Error', 'La imagen es demasiado grande. El tamaño máximo es de 5MB.');
        return;
      }
      
      // Crear un objeto FormData para enviar la imagen
      const formData = new FormData();
      formData.append('profile_picture', {
        uri: fileUri,
        name: fileUri.split('/').pop(),
        type: 'image/jpeg', // Ajustar según el tipo de imagen
      });
      
      setLoading(true);
      
      // Enviar la imagen al servidor
      const response = await api.patch(`/api/users/${user.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Actualizar el usuario en el contexto
      await updateProfile(response.data);
      
      Alert.alert('Éxito', 'Imagen de perfil actualizada correctamente');
    } catch (error) {
      console.error('Error al subir imagen de perfil:', error);
      Alert.alert('Error', 'No se pudo actualizar la imagen de perfil');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', onPress: logout, style: 'destructive' },
      ]
    );
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.card}>
        <View style={styles.profileHeader}>
          {user?.profile_picture ? (
            <Image 
              source={{ uri: user.profile_picture }} 
              style={styles.profileImage} 
            />
          ) : (
            <Avatar.Icon 
              size={100} 
              icon="account" 
              style={styles.profileAvatar} 
              color={theme.colors.surface}
            />
          )}
          
          <Title style={styles.userName}>
            {user?.first_name && user?.last_name 
              ? `${user.first_name} ${user.last_name}` 
              : user?.username}
          </Title>
          
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          <Button 
            mode="outlined" 
            onPress={handleUploadProfilePicture}
            style={styles.uploadButton}
            loading={loading}
            disabled={loading}
          >
            Cambiar Foto
          </Button>
        </View>
        
        <Divider style={styles.divider} />
        
        <Card.Content>
          {editing ? (
            <View style={styles.formContainer}>
              <TextInput
                label="Nombre"
                value={userData.first_name}
                onChangeText={(text) => handleInputChange('first_name', text)}
                mode="outlined"
                style={styles.input}
              />
              
              <TextInput
                label="Apellido"
                value={userData.last_name}
                onChangeText={(text) => handleInputChange('last_name', text)}
                mode="outlined"
                style={styles.input}
              />
              
              <View style={styles.row}>
                <TextInput
                  label="Altura (cm)"
                  value={userData.height ? userData.height.toString() : ''}
                  onChangeText={(text) => handleInputChange('height', text)}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[styles.input, styles.halfInput]}
                />
                
                <TextInput
                  label="Peso (kg)"
                  value={userData.weight ? userData.weight.toString() : ''}
                  onChangeText={(text) => handleInputChange('weight', text)}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[styles.input, styles.halfInput]}
                />
              </View>
              
              <TextInput
                label="Fecha de Nacimiento (YYYY-MM-DD)"
                value={userData.birth_date || ''}
                onChangeText={(text) => handleInputChange('birth_date', text)}
                mode="outlined"
                style={styles.input}
              />
              
              <View style={styles.buttonContainer}>
                <Button 
                  mode="outlined" 
                  onPress={() => setEditing(false)}
                  style={styles.button}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                
                <Button 
                  mode="contained" 
                  onPress={handleSaveProfile}
                  style={styles.button}
                  loading={loading}
                  disabled={loading}
                >
                  Guardar
                </Button>
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Nombre:</Text>
                <Text style={styles.infoValue}>
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}` 
                    : 'No especificado'}
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Nombre de usuario:</Text>
                <Text style={styles.infoValue}>{user?.username}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Altura:</Text>
                <Text style={styles.infoValue}>
                  {user?.height ? `${user.height} cm` : 'No especificado'}
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Peso:</Text>
                <Text style={styles.infoValue}>
                  {user?.weight ? `${user.weight} kg` : 'No especificado'}
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Fecha de Nacimiento:</Text>
                <Text style={styles.infoValue}>
                  {user?.birth_date || 'No especificado'}
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Miembro desde:</Text>
                <Text style={styles.infoValue}>
                  {user?.date_joined 
                    ? new Date(user.date_joined).toLocaleDateString() 
                    : 'No disponible'}
                </Text>
              </View>
              
              <Button 
                mode="contained" 
                onPress={() => setEditing(true)}
                style={styles.editButton}
              >
                Editar Perfil
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
      
      <Button 
        mode="outlined" 
        onPress={handleLogout}
        style={styles.logoutButton}
        color={theme.colors.error}
      >
        Cerrar Sesión
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  profileAvatar: {
    marginBottom: 8,
    backgroundColor: '#1E88E5',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  uploadButton: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 8,
  },
  formContainer: {
    marginTop: 8,
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  infoItem: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  editButton: {
    marginTop: 16,
  },
  logoutButton: {
    marginTop: 8,
  },
});

export default ProfileScreen;
