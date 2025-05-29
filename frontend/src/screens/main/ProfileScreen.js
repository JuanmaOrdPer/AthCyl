/**
 * Pantalla de Perfil para AthCyl
 * 
 * Esta pantalla permite al usuario:
 * - Ver su información personal
 * - Editar su perfil
 * - Cambiar su contraseña
 * - Configurar preferencias
 * - Cerrar sesión
 * - Ver información de la app
 * 
 * Características:
 * - Edición inline de datos básicos
 * - Validación de campos
 * - Manejo de foto de perfil
 * - Configuraciones de la aplicación
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Importar componentes
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';

// Importar servicios
import authService from '../../services/authService';

// Importar estilos y colores
import { Colors } from '../../config/colors';
import { globalStyles } from '../../styles/globalStyles';

const ProfileScreen = ({ user, onLogout }) => {
  // Estados para edición de perfil
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para cambio de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  
  /**
   * Inicializar datos editables cuando se recibe el usuario
   */
  useEffect(() => {
    if (user) {
      setEditedUser({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        username: user.username || '',
        height: user.height?.toString() || '',
        weight: user.weight?.toString() || ''
      });
    }
  }, [user]);
  
  /**
   * Actualizar campo del perfil editado
   */
  const updateField = (field, value) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  /**
   * Validar datos del perfil
   */
  const validateProfile = () => {
    const errors = {};
    
    if (!editedUser.first_name.trim()) {
      errors.first_name = 'El nombre es requerido';
    }
    
    if (!editedUser.last_name.trim()) {
      errors.last_name = 'Los apellidos son requeridos';
    }
    
    if (editedUser.height && (parseFloat(editedUser.height) < 100 || parseFloat(editedUser.height) > 250)) {
      errors.height = 'Altura entre 100 y 250 cm';
    }
    
    if (editedUser.weight && (parseFloat(editedUser.weight) < 30 || parseFloat(editedUser.weight) > 200)) {
      errors.weight = 'Peso entre 30 y 200 kg';
    }
    
    return errors;
  };
  /**
 * Guardar cambios del perfil - VERSIÓN CORREGIDA
 */
const saveProfile = async () => {
  const errors = validateProfile();
  if (Object.keys(errors).length > 0) {
    Alert.alert('Error de Validación', Object.values(errors)[0]);
    return;
  }
  
  setIsLoading(true);
  
  try {
    // Preparar datos para enviar
    const dataToUpdate = {
      first_name: editedUser.first_name.trim(),
      last_name: editedUser.last_name.trim(),
      // email: editedUser.email, // No permitir cambiar email
      // username: editedUser.username, // No permitir cambiar username
    };
    
    // Solo incluir altura y peso si tienen valores válidos
    if (editedUser.height && editedUser.height.trim() !== '') {
      dataToUpdate.height = parseFloat(editedUser.height);
    }
    
    if (editedUser.weight && editedUser.weight.trim() !== '') {
      dataToUpdate.weight = parseFloat(editedUser.weight);
    }
    
    console.log('🔄 Actualizando perfil con datos:', dataToUpdate);
    
    // LLAMADA REAL AL BACKEND
    const result = await authService.updateProfile(dataToUpdate);
    
    if (result.success) {
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      setIsEditing(false);
      
      // Actualizar datos locales con la respuesta del servidor
      if (result.user) {
        setEditedUser({
          first_name: result.user.first_name || '',
          last_name: result.user.last_name || '',
          email: result.user.email || '',
          username: result.user.username || '',
          height: result.user.height?.toString() || '',
          weight: result.user.weight?.toString() || ''
        });
      }
    } else {
      Alert.alert('Error', result.error || 'No se pudo actualizar el perfil');
    }
    
  } catch (error) {
    console.error('❌ Error actualizando perfil:', error);
    Alert.alert('Error', 'No se pudo actualizar el perfil');
  } finally {
    setIsLoading(false);
  }
};

  /**
   * Cancelar edición
   */
  const cancelEdit = () => {
    // Restaurar datos originales
    setEditedUser({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      username: user.username || '',
      height: user.height?.toString() || '',
      weight: user.weight?.toString() || ''
    });
    setIsEditing(false);
  };
  
  /**
   * Actualizar campo de contraseña
   */
  const updatePasswordField = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };
  
  /**
   * Validar cambio de contraseña
   */
  const validatePassword = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Contraseña actual requerida';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'Nueva contraseña requerida';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Mínimo 8 caracteres';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  /**
   * Cambiar contraseña
   */
  const changePassword = async () => {
    if (!validatePassword()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );
      
      if (result.success) {
        Alert.alert('Éxito', 'Contraseña cambiada correctamente');
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        Alert.alert('Error', result.error);
      }
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Confirmar cierre de sesión
   */
  const confirmLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: onLogout 
        }
      ]
    );
  };
  
  /**
   * Mostrar información de la app
   */
  const showAppInfo = () => {
    Alert.alert(
      'AthCyl',
      'Versión 1.0.0\n\nAplicación para gestión de entrenamientos deportivos.\n\nDesarrollado como proyecto final de DAM.',
      [{ text: 'OK' }]
    );
  };
  
  /**
   * Renderizar foto de perfil
   */
  const renderProfilePicture = () => (
    <View style={styles.profilePictureContainer}>
      <View style={styles.profilePicture}>
        {user?.profile_picture ? (
          <Image 
            source={{ uri: user.profile_picture }} 
            style={styles.profileImage}
          />
        ) : (
          <Ionicons 
            name="person" 
            size={50} 
            color={Colors.textSecondary} 
          />
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.changePictureButton}
        onPress={() => Alert.alert('Info', 'Función de cambio de foto próximamente')}
      >
        <Ionicons name="camera" size={20} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
  
  /**
   * Renderizar información básica
   */
  const renderBasicInfo = () => (
    <Card 
      title="Información Personal"
      rightIcon={isEditing ? "close" : "create-outline"}
      onRightIconPress={isEditing ? cancelEdit : () => setIsEditing(true)}
    >
      {/* Foto de perfil */}
      {renderProfilePicture()}
      
      {/* Campos editables */}
      <Input
        label="Nombre"
        value={editedUser.first_name}
        onChangeText={(value) => updateField('first_name', value)}
        editable={isEditing}
        style={!isEditing && styles.readOnlyInput}
      />
      
      <Input
        label="Apellidos"
        value={editedUser.last_name}
        onChangeText={(value) => updateField('last_name', value)}
        editable={isEditing}
        style={!isEditing && styles.readOnlyInput}
      />
      
      <Input
        label="Email"
        value={editedUser.email}
        editable={false}
        style={styles.readOnlyInput}
      />
      
      <Input
        label="Nombre de Usuario"
        value={editedUser.username}
        editable={false}
        style={styles.readOnlyInput}
      />
      
      {/* Botones de edición */}
      {isEditing && (
        <View style={styles.editButtons}>
          <Button
            title="Guardar"
            onPress={saveProfile}
            loading={isLoading}
            style={styles.saveButton}
          />
          <Button
            title="Cancelar"
            variant="outline"
            onPress={cancelEdit}
            disabled={isLoading}
          />
        </View>
      )}
    </Card>
  );
  
  /**
   * Renderizar información física
   */
  const renderPhysicalInfo = () => (
    <Card title="Información Física">
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Input
            label="Altura (cm)"
            value={editedUser.height}
            onChangeText={(value) => updateField('height', value)}
            keyboardType="numeric"
            editable={isEditing}
            style={!isEditing && styles.readOnlyInput}
          />
        </View>
        
        <View style={styles.halfWidth}>
          <Input
            label="Peso (kg)"
            value={editedUser.weight}
            onChangeText={(value) => updateField('weight', value)}
            keyboardType="numeric"
            editable={isEditing}
            style={!isEditing && styles.readOnlyInput}
          />
        </View>
      </View>
    </Card>
  );
  
  /**
   * Renderizar opciones de cuenta
   */
  const renderAccountOptions = () => (
    <Card title="Cuenta">
      <TouchableOpacity 
        style={styles.optionItem}
        onPress={() => setShowPasswordModal(true)}
      >
        <Ionicons name="key-outline" size={24} color={Colors.primary} />
        <Text style={styles.optionText}>Cambiar Contraseña</Text>
        <Ionicons name="chevron-forward-outline" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.optionItem}
        onPress={confirmLogout}
      >
        <Ionicons name="log-out-outline" size={24} color={Colors.error} />
        <Text style={[styles.optionText, { color: Colors.error }]}>Cerrar Sesión</Text>
        <Ionicons name="chevron-forward-outline" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>
    </Card>
  );
  
  /**
   * Renderizar opciones de la app
   */
  const renderAppOptions = () => (
    <Card title="Aplicación">
      <TouchableOpacity 
        style={styles.optionItem}
        onPress={showAppInfo}
      >
        <Ionicons name="information-circle-outline" size={24} color={Colors.info} />
        <Text style={styles.optionText}>Acerca de AthCyl</Text>
        <Ionicons name="chevron-forward-outline" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>
    </Card>
  );
  
  /**
   * Renderizar modal de cambio de contraseña
   */
  const renderPasswordModal = () => (
    <Modal
      visible={showPasswordModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cambiar Contraseña</Text>
            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <Input
              label="Contraseña Actual"
              value={passwordData.currentPassword}
              onChangeText={(value) => updatePasswordField('currentPassword', value)}
              error={passwordErrors.currentPassword}
              secureTextEntry={true}
              icon="lock-closed-outline"
            />
            
            <Input
              label="Nueva Contraseña"
              value={passwordData.newPassword}
              onChangeText={(value) => updatePasswordField('newPassword', value)}
              error={passwordErrors.newPassword}
              secureTextEntry={true}
              icon="key-outline"
            />
            
            <Input
              label="Confirmar Nueva Contraseña"
              value={passwordData.confirmPassword}
              onChangeText={(value) => updatePasswordField('confirmPassword', value)}
              error={passwordErrors.confirmPassword}
              secureTextEntry={true}
              icon="key-outline"
            />
            
            <View style={styles.modalButtons}>
              <Button
                title="Cambiar Contraseña"
                onPress={changePassword}
                loading={isLoading}
                style={styles.modalButton}
              />
              
              <Button
                title="Cancelar"
                variant="outline"
                onPress={() => setShowPasswordModal(false)}
                disabled={isLoading}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
  
  if (!user) {
    return <LoadingSpinner text="Cargando perfil..." />;
  }
  
  return (
    <View style={globalStyles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Información básica */}
        {renderBasicInfo()}
        
        {/* Información física */}
        {renderPhysicalInfo()}
        
        {/* Opciones de cuenta */}
        {renderAccountOptions()}
        
        {/* Opciones de la app */}
        {renderAppOptions()}
      </ScrollView>
      
      {/* Modal de cambio de contraseña */}
      {renderPasswordModal()}
      
      {/* Overlay de carga */}
      {isLoading && (
        <LoadingSpinner
          overlay={true}
          text="Procesando..."
        />
      )}
    </View>
  );
};

// ===== ESTILOS DE LA PANTALLA =====
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  
  // Foto de perfil
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  
  profileImage: {
    width: 94,
    height: 94,
    borderRadius: 47,
  },
  
  changePictureButton: {
    position: 'absolute',
    right: -5,
    bottom: 5,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  
  // Campos de entrada
  readOnlyInput: {
    opacity: 0.7,
  },
  
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  halfWidth: {
    width: '48%',
  },
  
  // Botones de edición
  editButtons: {
    marginTop: 16,
  },
  
  saveButton: {
    marginBottom: 12,
  },
  
  // Opciones
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  
  optionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: 16,
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    maxHeight: '80%',
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  
  modalButtons: {
    padding: 20,
  },
  
  modalButton: {
    marginBottom: 12,
  },
});

export default ProfileScreen;