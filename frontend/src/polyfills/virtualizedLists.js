// Implementación básica de listas virtualizadas para react-native-web
import React from 'react';
import { FlatList, SectionList } from 'react-native';

// Componentes de reemplazo básicos
const VirtualizedList = (props) => {
  return <FlatList {...props} />;
};

const VirtualizedSectionList = (props) => {
  return <SectionList {...props} />;
};

// Exportar como módulo ES para compatibilidad con import
export { VirtualizedList, VirtualizedSectionList };

// También exportar como CommonJS para compatibilidad con require()
module.exports = {
  VirtualizedList,
  VirtualizedSectionList
};
