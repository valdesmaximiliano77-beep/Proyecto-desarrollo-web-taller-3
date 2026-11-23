import { ScrollView, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ItemAgenda from '../components/ItemAgenda';
import { Cargando, ErrorCarga, Vacio } from '../components/Estados';
import { useCarga } from '../hooks/useCarga';
import { listarAsignaturas, listarEvaluaciones, listarTareas } from '../services/agendaApi';
import { colores, sombra } from '../theme';
import { diasHasta } from '../utils/fechas';

const cargarTodo = async () => {
  const [asignaturas, tareas, evaluaciones] = await Promise.all([
    listarAsignaturas(), listarTareas(), listarEvaluaciones(),
  ]);
  return { asignaturas, tareas, evaluaciones };
};

export default function InicioScreen({ navigation }) {
  const { datos, error, cargando, refrescando, refrescar, reintentar } = useCarga(cargarTodo);

  if (cargando) return <Cargando />;
  if (!datos) return <ErrorCarga mensaje={error} onReintentar={reintentar} />;

  const { asignaturas, tareas, evaluaciones } = datos;
  const nombre = (id) => asignaturas.find((a) => a.id === id)?.nombre ?? '';
  const cuenta = (estado) => tareas.filter((t) => t.estado === estado).length;

  // Próximos 7 días (incluye lo vencido que sigue pendiente).
  const proximos = [
    ...tareas.filter((t) => t.estado !== 'completada').map((t) => ({ ...t, tipo: 'tarea' })),
    ...evaluaciones.map((e) => ({ ...e, tipo: 'evaluacion' })),
  ]
    .filter((i) => diasHasta(i.fecha) <= 7 && (i.tipo === 'tarea' || diasHasta(i.fecha) >= 0))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  return (
    <SafeAreaView style={estilos.pantalla} edges={['top']}>
      <ScrollView
        contentContainerStyle={estilos.contenido}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} />}
      >
        <Text style={estilos.titulo}>Entregas</Text>
        {error && <Text style={estilos.errorSuave}>No se pudo actualizar: {error}</Text>}

        <View style={estilos.resumen}>
          <Contador numero={cuenta('pendiente')} texto="Pendientes" color="#8a5b00" />
          <Contador numero={cuenta('en progreso')} texto="En progreso" color="#1f46b8" />
          <Contador numero={cuenta('completada')} texto="Completadas" color="#17703c" />
        </View>

        <Text style={estilos.seccion}>Próximos 7 días</Text>
        {proximos.length === 0 ? (
          <View style={{ height: 120 }}><Vacio texto="No tienes entregas ni evaluaciones próximas." /></View>
        ) : (
          proximos.map((i) => (
            <ItemAgenda
              key={`${i.tipo}-${i.id}`}
              item={i}
              nombreAsignatura={nombre(i.asignatura_id)}
              onPress={i.tipo === 'tarea' ? () => navigation.navigate('TareaDetalle', { id: i.id }) : undefined}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Contador({ numero, texto, color }) {
  return (
    <View style={estilos.contador}>
      <Text style={[estilos.numero, { color }]}>{numero}</Text>
      <Text style={estilos.contadorTexto}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 16, paddingBottom: 32 },
  titulo: { fontSize: 26, fontWeight: '800', color: colores.texto, marginBottom: 12 },
  errorSuave: { color: colores.error, marginBottom: 8, fontSize: 13 },
  resumen: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  contador: { flex: 1, backgroundColor: colores.tarjeta, borderRadius: 12, padding: 12, alignItems: 'center', ...sombra },
  numero: { fontSize: 26, fontWeight: '800' },
  contadorTexto: { fontSize: 12, color: colores.textoSuave },
  seccion: { fontSize: 17, fontWeight: '700', color: colores.texto, marginBottom: 10 },
});
