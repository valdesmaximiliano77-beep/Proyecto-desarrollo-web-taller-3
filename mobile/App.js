import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AgendaScreen from './src/screens/AgendaScreen';
import AsignaturaDetalleScreen from './src/screens/AsignaturaDetalleScreen';
import AsignaturasScreen from './src/screens/AsignaturasScreen';
import CrearTareaScreen from './src/screens/CrearTareaScreen';
import InicioScreen from './src/screens/InicioScreen';
import TareaDetalleScreen from './src/screens/TareaDetalleScreen';
import { colores } from './src/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tema = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colores.fondo, primary: colores.primario } };
const icono = (simbolo) => ({ color }) => <Text style={{ fontSize: 20, color }}>{simbolo}</Text>;

function Pestanas() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: colores.primario }}>
      <Tab.Screen name="Inicio" component={InicioScreen} options={{ tabBarIcon: icono('⌂') }} />
      <Tab.Screen name="Agenda" component={AgendaScreen} options={{ tabBarIcon: icono('▤') }} />
      <Tab.Screen name="Asignaturas" component={AsignaturasScreen} options={{ tabBarIcon: icono('☰') }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={tema}>
        <Stack.Navigator>
          <Stack.Screen name="Pestanas" component={Pestanas} options={{ headerShown: false }} />
          <Stack.Screen name="TareaDetalle" component={TareaDetalleScreen} options={{ title: 'Tarea' }} />
          <Stack.Screen name="CrearTarea" component={CrearTareaScreen} options={{ title: 'Nueva tarea' }} />
          <Stack.Screen
            name="AsignaturaDetalle"
            component={AsignaturaDetalleScreen}
            options={({ route }) => ({ title: route.params.nombre })}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}