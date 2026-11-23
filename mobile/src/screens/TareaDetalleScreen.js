import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Barra from '../components/Barra';
import { Aviso, Cargando, ErrorCarga } from '../components/Estados';
import { EtiquetaEstado, EtiquetaPrioridad } from '../components/Etiquetas';
import { useCarga } from '../hooks/useCarga';
import { actualizarSubtarea, actualizarTarea, listarAsignaturas, listarTareas } from '../services/agendaApi';
import { colores, estadoColor, sombra } from '../theme';
import { diasHasta, etiquetaRelativa, fechaLarga } from '../utils/fechas';

const ESTADOS = ['pendiente', 'en progreso', 'completada'];

export default function TareaDetalleScreen({ route }) {
  const { id } = route.params;
  const { datos, error, cargando, reintentar, recargar } = useCarga(async () => {
    const [tareas, asignaturas] = await Promise.all([listarTareas(), listarAsignaturas()]);
    const tarea = tareas.find((t) => t.id === id);
    if (!tarea) throw new Error('La tarea ya no existe.');
    return { tarea, asignatura: asignaturas.find((a) => a.id === tarea.asignatura_id) };
  });
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState(null);
  const [confirmacion, setConfirmacion] = useState(null);

  if (cargando) return <Cargando />;
  if (!datos) return <ErrorCarga mensaje={error} onReintentar={reintentar} />;

  const { tarea, asignatura } = datos;
  const hechas = tarea.subtareas.filter((s) => s.completada).length;
  const porcentaje = tarea.subtareas.length
    ? Math.round((100 * hechas) / tarea.subtareas.length)
    : tarea.estado === 'completada' ? 100 : 0;

  // Ejecuta un cambio en la API y recarga. Los errores del backend (400/409/422)
  // se muestran tal cual en la pantalla.
  const guardar = async (operacion, mensajeOk) => {
    setGuardando(true);
    setErrorGuardar(null);
    setConfirmacion(null);
    try {
      await operacion();
      await recargar();
      setConfirmacion(mensajeOk);
    } catch (e) {
      setErrorGuardar(e.message);
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = (estado) => {
    if (estado === tarea.estado || guardando) return;
    guardar(() => actualizarTarea(tarea.id, { estado }), `Estado actualizado a "${estado}".`);
  };

  const alternarSubtarea = (s) => {
    if (guardando) return;
    guardar(
      () => actualizarSubtarea(s.id, { completada: !s.completada }),
      s.completada ? 'Subtarea marcada como pendiente.' : 'Subtarea completada.',
    );
  };

  const vencida = tarea.estado !== 'completada' && diasHasta(tarea.fecha) < 0;

  return (
    <ScrollView style={{ backgroundColor: colores.fondo }} contentContainerStyle={estilos.contenido}>
      <Text style={estilos.asignatura}>{asignatura?.nombre}</Text>
      <Text style={estilos.titulo}>{tarea.titulo}</Text>
      <View style={estilos.fila}>
        <EtiquetaEstado estado={tarea.estado} />
        <EtiquetaPrioridad prioridad={tarea.prioridad} />
      </View>
      <Text style={[estilos.fecha, vencida && { color: colores.error, fontWeight: '700' }]}>
        {vencida ? 'Vencida · ' : ''}Entrega: {fechaLarga(tarea.fecha)} ({etiquetaRelativa(tarea.fecha)})
      </Text>
      {tarea.descripcion ? <Text style={estilos.descripcion}>{tarea.descripcion}</Text> : null}

      <Aviso mensaje={errorGuardar} />
      {confirmacion && !errorGuardar && <Text style={estilos.ok}>✓ {confirmacion}</Text>}

      <Text style={estilos.seccion}>Estado</Text>
      <View style={estilos.segmentos}>
        {ESTADOS.map((e) => {
          const activo = e === tarea.estado;
          return (
            <Pressable
              key={e}
              disabled={guardando}
              onPress={() => cambiarEstado(e)}
              style={[
                estilos.segmento,
                activo && { backgroundColor: estadoColor[e].fondo, borderColor: estadoColor[e].texto },
                guardando && { opacity: 0.5 },
              ]}
            >
              <Text style={[estilos.segmentoTexto, activo && { color: estadoColor[e].texto }]}>{e}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={estilos.seccion}>Avance</Text>
      <View style={estilos.caja}>
        <Barra
          porcentaje={porcentaje}
          etiqueta={tarea.subtareas.length
            ? `${hechas} de ${tarea.subtareas.length} subtareas (${porcentaje}%)`
            : 'Esta tarea no tiene subtareas'}
        />
        {tarea.subtareas.map((s) => (
          <Pressable key={s.id} style={estilos.subtarea} disabled={guardando} onPress={() => alternarSubtarea(s)}>
            <View style={[estilos.check, s.completada && estilos.checkOn]}>
              {s.completada && <Text style={estilos.checkTexto}>✓</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[estilos.subTitulo, s.completada && estilos.tachado]}>{s.titulo}</Text>
              <Text style={estilos.subFecha}>{fechaLarga(s.fecha)}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 16, paddingBottom: 40 },
  asignatura: { fontSize: 13, fontWeight: '700', color: colores.primario, letterSpacing: 0.5, textTransform: 'uppercase' },
  titulo: { fontSize: 24, fontWeight: '800', color: colores.texto, marginVertical: 6 },
  fila: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  fecha: { fontSize: 14, color: colores.textoSuave },
  descripcion: { fontSize: 15, color: colores.texto, marginTop: 10 },
  ok: { color: colores.exito, fontWeight: '600', marginTop: 12 },
  seccion: { fontSize: 17, fontWeight: '700', color: colores.texto, marginTop: 20, marginBottom: 10 },
  segmentos: { flexDirection: 'row', gap: 8 },
  segmento: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: colores.borde, backgroundColor: colores.tarjeta, alignItems: 'center' },
  segmentoTexto: { fontSize: 13, fontWeight: '700', color: colores.textoSuave, textTransform: 'capitalize' },
  caja: { backgroundColor: colores.tarjeta, borderRadius: 12, padding: 14, gap: 4, ...sombra },
  subtarea: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colores.borde, marginTop: 8 },
  check: { width: 26, height: 26, borderRadius: 7, borderWidth: 2, borderColor: colores.borde, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colores.exito, borderColor: colores.exito },
  checkTexto: { color: '#fff', fontWeight: '800' },
  subTitulo: { fontSize: 15, color: colores.texto },
  tachado: { textDecorationLine: 'line-through', color: colores.textoSuave },
  subFecha: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },
});
