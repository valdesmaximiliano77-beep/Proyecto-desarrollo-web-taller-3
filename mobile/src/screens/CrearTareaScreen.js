import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Aviso, Cargando, ErrorCarga } from '../components/Estados';
import { useCarga } from '../hooks/useCarga';
import { crearTarea, listarAsignaturas } from '../services/agendaApi';
import { colores } from '../theme';
import { hoyISO, parseFecha } from '../utils/fechas';

const PRIORIDADES = ['alta', 'media', 'baja'];

// Valida en el móvil lo básico (mensajes rápidos). Las reglas de negocio
// (fecha pasada, fuera del período) las valida el backend y se muestran tal cual.
function validar({ titulo, fecha, asignaturaId }) {
  if (!asignaturaId) return 'Selecciona una asignatura.';
  if (titulo.trim().length < 3) return 'El título debe tener al menos 3 caracteres.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return 'La fecha debe tener el formato AAAA-MM-DD (ej. 2026-12-05).';
  const f = parseFecha(fecha);
  const [a, m, d] = fecha.split('-').map(Number);
  if (f.getFullYear() !== a || f.getMonth() + 1 !== m || f.getDate() !== d) return 'La fecha no es válida.';
  return null;
}

export default function CrearTareaScreen({ navigation }) {
  const { datos: asignaturas, error, cargando, reintentar } = useCarga(listarAsignaturas);
  const [asignaturaId, setAsignaturaId] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(hoyISO());
  const [prioridad, setPrioridad] = useState('media');
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState(null);

  if (cargando) return <Cargando />;
  if (!asignaturas) return <ErrorCarga mensaje={error} onReintentar={reintentar} />;

  const seleccionada = asignaturaId ?? asignaturas[0]?.id ?? null;

  const guardar = async () => {
    const problema = validar({ titulo, fecha, asignaturaId: seleccionada });
    if (problema) {
      setErrorGuardar(problema);
      return;
    }
    setGuardando(true);
    setErrorGuardar(null);
    try {
      await crearTarea({
        asignatura_id: seleccionada,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        fecha,
        prioridad,
      });
      Alert.alert('Tarea creada', 'La tarea se guardó y ya aparece en tu agenda.');
      navigation.goBack();
    } catch (e) {
      setErrorGuardar(e.message); // mensaje del backend (400/409/422) o de conexión
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colores.fondo }}
      contentContainerStyle={estilos.contenido}
      keyboardShouldPersistTaps="handled"
    >
      <Aviso mensaje={errorGuardar} />

      <Text style={estilos.etiqueta}>Asignatura</Text>
      {asignaturas.length === 0 && <Text style={estilos.ayuda}>No tienes asignaturas. Créalas desde la web.</Text>}
      <View style={estilos.fila}>
        {asignaturas.map((a) => (
          <Pressable
            key={a.id}
            onPress={() => setAsignaturaId(a.id)}
            style={[estilos.chip, seleccionada === a.id && estilos.chipActivo]}
          >
            <Text style={[estilos.chipTexto, seleccionada === a.id && { color: '#fff' }]}>{a.nombre}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={estilos.etiqueta}>Título</Text>
      <TextInput style={estilos.input} value={titulo} onChangeText={setTitulo} placeholder="Ej. Guía de ejercicios" maxLength={120} />

      <Text style={estilos.etiqueta}>Descripción (opcional)</Text>
      <TextInput
        style={[estilos.input, { height: 80, textAlignVertical: 'top' }]}
        value={descripcion}
        onChangeText={setDescripcion}
        placeholder="Detalles de la tarea"
        multiline
        maxLength={500}
      />

      <Text style={estilos.etiqueta}>Fecha de entrega (AAAA-MM-DD)</Text>
      <TextInput
        style={estilos.input}
        value={fecha}
        onChangeText={setFecha}
        placeholder="2026-12-05"
        keyboardType="numbers-and-punctuation"
        maxLength={10}
      />

      <Text style={estilos.etiqueta}>Prioridad</Text>
      <View style={estilos.fila}>
        {PRIORIDADES.map((p) => (
          <Pressable key={p} onPress={() => setPrioridad(p)} style={[estilos.chip, prioridad === p && estilos.chipActivo]}>
            <Text style={[estilos.chipTexto, prioridad === p && { color: '#fff' }, { textTransform: 'capitalize' }]}>{p}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={[estilos.boton, (guardando || asignaturas.length === 0) && { opacity: 0.5 }]}
        onPress={guardar}
        disabled={guardando || asignaturas.length === 0}
      >
        <Text style={estilos.botonTexto}>{guardando ? 'Guardando…' : 'Crear tarea'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 16, paddingBottom: 40 },
  etiqueta: { fontSize: 14, fontWeight: '700', color: colores.texto, marginTop: 14, marginBottom: 6 },
  ayuda: { color: colores.textoSuave, fontSize: 13 },
  input: {
    backgroundColor: colores.tarjeta, borderWidth: 1, borderColor: colores.borde, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: colores.texto,
  },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: colores.tarjeta, borderWidth: 1, borderColor: colores.borde },
  chipActivo: { backgroundColor: colores.primario, borderColor: colores.primario },
  chipTexto: { color: colores.texto, fontWeight: '600', fontSize: 13 },
  boton: { backgroundColor: colores.primario, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  botonTexto: { color: '#fff', fontWeight: '700', fontSize: 16 },
});