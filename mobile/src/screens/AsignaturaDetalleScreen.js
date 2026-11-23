import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Barra from '../components/Barra';
import { Cargando, ErrorCarga } from '../components/Estados';
import ItemAgenda from '../components/ItemAgenda';
import { useCarga } from '../hooks/useCarga';
import { avanceAsignatura, listarEvaluaciones, listarTareas } from '../services/agendaApi';
import { colores, sombra } from '../theme';

export default function AsignaturaDetalleScreen({ route, navigation }) {
  const { id, nombre } = route.params;
  const { datos, error, cargando, refrescando, refrescar, reintentar } = useCarga(async () => {
    const [avance, tareas, evaluaciones] = await Promise.all([
      avanceAsignatura(id), listarTareas(id), listarEvaluaciones(id),
    ]);
    return { avance, tareas, evaluaciones };
  });

  if (cargando) return <Cargando />;
  if (!datos) return <ErrorCarga mensaje={error} onReintentar={reintentar} />;

  const { avance, tareas, evaluaciones } = datos;

  return (
    <ScrollView
      style={{ backgroundColor: colores.fondo }}
      contentContainerStyle={estilos.contenido}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} />}
    >
      <View style={estilos.avance}>
        <Barra
          porcentaje={avance.porcentaje_cumplimiento}
          etiqueta={`Cumplimiento: ${avance.porcentaje_cumplimiento}% (${avance.tareas_completadas} de ${avance.tareas_total} tareas)`}
        />
        <Text style={estilos.dato}>
          Evaluaciones con nota: {avance.evaluaciones_con_nota} de {avance.evaluaciones_total}
        </Text>
        <Text style={estilos.dato}>Ponderación asignada: {avance.ponderacion_asignada}%</Text>
      </View>

      <Text style={estilos.seccion}>Evaluaciones</Text>
      {evaluaciones.length === 0 && <Text style={estilos.vacio}>Sin evaluaciones registradas.</Text>}
      {evaluaciones.map((e) => (
        <ItemAgenda key={`e-${e.id}`} item={{ ...e, tipo: 'evaluacion' }} nombreAsignatura={nombre} />
      ))}

      <Text style={estilos.seccion}>Tareas</Text>
      {tareas.length === 0 && <Text style={estilos.vacio}>Sin tareas registradas.</Text>}
      {tareas.map((t) => (
        <ItemAgenda
          key={`t-${t.id}`}
          item={{ ...t, tipo: 'tarea' }}
          nombreAsignatura={nombre}
          onPress={() => navigation.navigate('TareaDetalle', { id: t.id })}
        />
      ))}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 16, paddingBottom: 32 },
  avance: { backgroundColor: colores.tarjeta, borderRadius: 12, padding: 14, gap: 8, marginBottom: 8, ...sombra },
  dato: { fontSize: 14, color: colores.texto },
  seccion: { fontSize: 17, fontWeight: '700', color: colores.texto, marginTop: 16, marginBottom: 10 },
  vacio: { color: colores.textoSuave, marginBottom: 8 },
});
