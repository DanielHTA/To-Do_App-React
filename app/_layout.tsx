import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      {/* 1. Gestione dello stile della barra di stato (batteria, ora, icone) */}
      <StatusBar style="dark" />
      
      <Stack
        screenOptions={{
          headerShown: false,
          
          contentStyle: {
            backgroundColor: '#F2F2F7', // Lo stesso grigio chiaro di iOS usato nell'index
          },

          animation: 'fade_from_bottom',
        }}
      >
        {/* Qui puoi definire opzioni specifiche per singole rotte se necessario */}
        <Stack.Screen name="index" />
      </Stack>
    </SafeAreaProvider>
  );
}