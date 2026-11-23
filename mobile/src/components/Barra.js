import { StyleSheet, Text, View } from 'react-native';
import { colores } from '../theme';

// Barra de progreso (0 a 100).
export default function Barra({ porcentaje, etiqueta }) {
  return (
    <View>
      {etiqueta ? <Text style={estilos.etiqueta}>{etiqueta}</Text> : null}
      <View style={estilos.fondo}>
        <View style={[estilos.relleno, { width: `${Math.min(100, Math.max(0, porcentaje))}%` }]} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  etiqueta: { fontSize: 13, color: colores.textoSuave, marginBottom: 4 },
  fondo: { height: 8, borderRadius: 4, backgroundColor: colores.borde, overflow: 'hidden' },
  relleno: { height: 8, backgroundColor: colores.exito },
});
