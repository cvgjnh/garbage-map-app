/* eslint-disable react/no-children-prop */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MapScreen } from './MapScreen';
import { AddScreen } from './AddScreen';

const Stack = createStackNavigator();

export function MapAddScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Map"
        children={() => <MapScreen />}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Add"
        children={() => <AddScreen />}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
