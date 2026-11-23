import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colores, sombra } from '../theme';
import { diasHasta, etiquetaRelativa } from '../utils/fechas';
import { EtiquetaEstado, EtiquetaPrioridad } from './Etiquetas';

// Fila de la agenda: sirve para tareas (tipo "tarea") y evaluaciones (tipo "evaluacion").
export default function ItemAgenda({ item, nombreAsignatura, onPress }) {
  const esTarea = item.tipo === 'tarea';
  const vencida = esTarea && item.estado !== 'completada' && diasHasta(item.fecha) < 0;
  const subtareas = item.subtareas || [];
  const hechas = subtareas.filter((s) => s.completada).length;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [estilos.tarjeta, pressed && { opacity: 0.7 }]}
    >
      <View style={[estilos.franja, { backgroundColor: esTarea ? colores.primario : '#8b5cf6' }]} />
      <View style={estilos.cuerpo}>
        <Text style={estilos.tipo}>{esTarea ? 'TAREA' : 'EVALUACIÓN'} · {nombreAsignatura}</Text>
        <Text style={[estilos.titulo, esTarea && item.estado === 'completada' && estilos.tachado]}>
          {item.titulo}
        </Text>
        <View style={estilos.fila}>
          <Text style={[estilos.fecha, vencida && { color: colores.error, fontWeight: '700' }]}>
            {vencida ? 'Vencida · ' : ''}{etiquetaRelativa(item.fecha)}
          </Text>
          {esTarea ? (
            <>
              <EtiquetaEstado estado={item.estado} />
              <EtiquetaPrioridad prioridad={item.prioridad} />
            </>
          ) : (
            <Text style={estilos.fecha}>
              {item.ponderacion}%{item.nota != null ? ` · nota ${item.nota}` : ''}
            </Text>
          )}
        </View>
        {esTarea && subtareas.length > 0 && (
          <Text style={estilos.fecha}>Subtareas: {hechas}/{subtareas.length}</Text>
        )}
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tarjeta: { flexDirection: 'row', backgroundColor: colores.tarjeta, borderRadius: 12, marginBottom: 10, overflow: 'hidden', ...sombra },
  franja: { width: 5 },
  cuerpo: { flex: 1, padding: 12, gap: 6 },
  tipo: { fontSize: 11, letterSpacing: 0.5, color: colores.textoSuave, fontWeight: '600' },
  titulo: { fontSize: 16, fontWeight: '700', color: colores.texto },
  tachado: { textDecorationLine: 'line-through', color: colores.textoSuave },
  fila: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  fecha: { fontSize: 13, color: colores.textoSuave },
});
