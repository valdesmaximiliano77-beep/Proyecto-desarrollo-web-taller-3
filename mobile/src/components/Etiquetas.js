import { StyleSheet, Text, View } from 'react-native';
import { estadoColor, prioridadColor } from '../theme';

function Etiqueta({ texto, paleta }) {
  return (
    <View style={[estilos.caja, { backgroundColor: paleta.fondo }]}>
      <Text style={[estilos.texto, { color: paleta.texto }]}>{texto}</Text>
    </View>
  );
}

export const EtiquetaEstado = ({ estado }) => <Etiqueta texto={estado} paleta={estadoColor[estado]} />;
export const EtiquetaPrioridad = ({ prioridad }) => (
  <Etiqueta texto={`prioridad ${prioridad}`} paleta={prioridadColor[prioridad]} />
);

const estilos = StyleSheet.create({
  caja: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, alignSelf: 'flex-start' },
  texto: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
});
