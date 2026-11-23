import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ItemAgenda from '../components/ItemAgenda';
import { Cargando, ErrorCarga, Vacio } from '../components/Estados';
import { useCarga } from '../hooks/useCarga';
import { listarAsignaturas, listarEvaluaciones, listarTareas } from '../services/agendaApi';
import { colores } from '../theme';
import { fechaLarga } from '../utils/fechas';

const FILTROS = [
  { clave: 'todo', texto: 'Todo' },
  { clave: 'pendiente', texto: 'Pendientes' },
  { clave: 'en progreso', texto: 'En progreso' },
  { clave: 'completada', texto: 'Completadas' },
  { clave: 'evaluacion', texto: 'Evaluaciones' },
];

const cargarTodo = async () => {
  const [asignaturas, tareas, evaluaciones] = await Promise.all([
    listarAsignaturas(), listarTareas(), listarEvaluaciones(),
  ]);
  return { asignaturas, tareas, evaluaciones };
};

export default function AgendaScreen({ navigation }) {
  const { datos, error, cargando, refrescando, refrescar, reintentar } = useCarga(cargarTodo);
  const [filtro, setFiltro] = useState('todo');

  if (cargando) return <Cargando />;
  if (!datos) return <ErrorCarga mensaje={error} onReintentar={reintentar} />;

  const { asignaturas, tareas, evaluaciones } = datos;
  const nombre = (id) => asignaturas.find((a) => a.id === id)?.nombre ?? '';

  const items = [
    ...(filtro === 'evaluacion' ? [] : tareas
      .filter((t) => filtro === 'todo' || t.estado === filtro)
      .map((t) => ({ ...t, tipo: 'tarea' }))),
    ...(filtro === 'todo' || filtro === 'evaluacion'
      ? evaluaciones.map((e) => ({ ...e, tipo: 'evaluacion' })) : []),
  ].sort((a, b) => a.fecha.localeCompare(b.fecha));

  // Agrupa por día para visualizar la agenda.
  const secciones = [];
  items.forEach((i) => {
    const ultima = secciones[secciones.length - 1];
    if (ultima && ultima.fecha === i.fecha) ultima.data.push(i);
    else secciones.push({ fecha: i.fecha, data: [i] });
  });

  return (
    <SafeAreaView style={estilos.pantalla} edges={['top']}>
      <Text style={estilos.titulo}>Agenda</Text>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.filtros}>
          {FILTROS.map((f) => (
            <Pressable
              key={f.clave}
              onPress={() => setFiltro(f.clave)}
              style={[estilos.chip, filtro === f.clave && estilos.chipActivo]}
            >
              <Text style={[estilos.chipTexto, filtro === f.clave && { color: '#fff' }]}>{f.texto}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      {error && <Text style={estilos.errorSuave}>No se pudo actualizar: {error}</Text>}

      <SectionList
        sections={secciones}
        keyExtractor={(i) => `${i.tipo}-${i.id}`}
        contentContainerStyle={estilos.lista}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} />}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={<View style={{ height: 200 }}><Vacio texto="No hay actividades para este filtro." /></View>}
        renderSectionHeader={({ section }) => (
          <Text style={estilos.dia}>{fechaLarga(section.fecha)}</Text>
        )}
        renderItem={({ item }) => (
          <ItemAgenda
            item={item}
            nombreAsignatura={nombre(item.asignatura_id)}
            onPress={item.tipo === 'tarea' ? () => navigation.navigate('TareaDetalle', { id: item.id }) : undefined}
          />
        )}
      />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  titulo: { fontSize: 26, fontWeight: '800', color: colores.texto, paddingHorizontal: 16, paddingTop: 16 },
  filtros: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: colores.tarjeta, borderWidth: 1, borderColor: colores.borde },
  chipActivo: { backgroundColor: colores.primario, borderColor: colores.primario },
  chipTexto: { color: colores.texto, fontWeight: '600', fontSize: 13 },
  errorSuave: { color: colores.error, paddingHorizontal: 16, fontSize: 13 },
  lista: { paddingHorizontal: 16, paddingBottom: 32 },
  dia: { fontSize: 14, fontWeight: '700', color: colores.textoSuave, textTransform: 'capitalize', marginTop: 8, marginBottom: 8 },
});
