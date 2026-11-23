import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Barra from '../components/Barra';
import { Cargando, ErrorCarga, Vacio } from '../components/Estados';
import { useCarga } from '../hooks/useCarga';
import { listarAsignaturas, listarTareas } from '../services/agendaApi';
import { colores, sombra } from '../theme';

const cargarTodo = async () => {
  const [asignaturas, tareas] = await Promise.all([listarAsignaturas(), listarTareas()]);
  return { asignaturas, tareas };
};

export default function AsignaturasScreen({ navigation }) {
  const { datos, error, cargando, refrescando, refrescar, reintentar } = useCarga(cargarTodo);

  if (cargando) return <Cargando />;
  if (!datos) return <ErrorCarga mensaje={error} onReintentar={reintentar} />;

  const { asignaturas, tareas } = datos;

  return (
    <SafeAreaView style={estilos.pantalla} edges={['top']}>
      <Text style={estilos.titulo}>Asignaturas</Text>
      {error && <Text style={estilos.errorSuave}>No se pudo actualizar: {error}</Text>}
      <FlatList
        data={asignaturas}
        keyExtractor={(a) => String(a.id)}
        contentContainerStyle={estilos.lista}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} />}
        ListEmptyComponent={<View style={{ height: 200 }}><Vacio texto="Aún no tienes asignaturas." /></View>}
        renderItem={({ item }) => {
          const propias = tareas.filter((t) => t.asignatura_id === item.id);
          const hechas = propias.filter((t) => t.estado === 'completada').length;
          const porcentaje = propias.length ? Math.round((100 * hechas) / propias.length) : 0;
          return (
            <Pressable
              style={({ pressed }) => [estilos.tarjeta, pressed && { opacity: 0.7 }]}
              onPress={() => navigation.navigate('AsignaturaDetalle', { id: item.id, nombre: item.nombre })}
            >
              <Text style={estilos.codigo}>{item.codigo}</Text>
              <Text style={estilos.nombre}>{item.nombre}</Text>
              {item.docente ? <Text style={estilos.docente}>{item.docente}</Text> : null}
              <View style={{ marginTop: 10 }}>
                <Barra porcentaje={porcentaje} etiqueta={`${hechas} de ${propias.length} tareas completadas`} />
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  titulo: { fontSize: 26, fontWeight: '800', color: colores.texto, padding: 16, paddingBottom: 8 },
  errorSuave: { color: colores.error, paddingHorizontal: 16, fontSize: 13 },
  lista: { padding: 16, paddingBottom: 32 },
  tarjeta: { backgroundColor: colores.tarjeta, borderRadius: 12, padding: 14, marginBottom: 12, ...sombra },
  codigo: { fontSize: 12, fontWeight: '700', color: colores.primario, letterSpacing: 0.5 },
  nombre: { fontSize: 18, fontWeight: '700', color: colores.texto, marginTop: 2 },
  docente: { fontSize: 13, color: colores.textoSuave, marginTop: 2 },
});
