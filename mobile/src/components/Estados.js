import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colores } from '../theme';

export function Cargando({ texto = 'Cargando…' }) {
  return (
    <View style={estilos.centro}>
      <ActivityIndicator size="large" color={colores.primario} />
      <Text style={estilos.suave}>{texto}</Text>
    </View>
  );
}

export function ErrorCarga({ mensaje, onReintentar }) {
  return (
    <View style={estilos.centro}>
      <Text style={estilos.titulo}>No se pudo cargar</Text>
      <Text style={[estilos.suave, { textAlign: 'center' }]}>{mensaje}</Text>
      {onReintentar && (
        <Pressable style={estilos.boton} onPress={onReintentar}>
          <Text style={estilos.botonTexto}>Reintentar</Text>
        </Pressable>
      )}
    </View>
  );
}

export function Vacio({ texto }) {
  return (
    <View style={estilos.centro}>
      <Text style={estilos.suave}>{texto}</Text>
    </View>
  );
}

// Aviso rojo dentro de una pantalla (errores del backend al guardar).
export function Aviso({ mensaje }) {
  if (!mensaje) return null;
  return (
    <View style={estilos.aviso}>
      <Text style={estilos.avisoTexto}>{mensaje}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  titulo: { fontSize: 17, fontWeight: '700', color: colores.texto },
  suave: { color: colores.textoSuave, fontSize: 14 },
  boton: { backgroundColor: colores.primario, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginTop: 6 },
  botonTexto: { color: '#fff', fontWeight: '600' },
  aviso: { backgroundColor: colores.errorFondo, borderRadius: 10, padding: 12, marginBottom: 12 },
  avisoTexto: { color: colores.error, fontSize: 14 },
});
