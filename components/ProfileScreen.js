/* eslint-disable react/no-children-prop */
import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AddScreen } from './AddScreen';
import { ProfileMainScreen } from './ProfileMainScreen';

const Stack = createStackNavigator();

export function ProfileScreen() {
  const [selectedMarker, setSelectedMarker] = useState(null);

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile Main"
        children={() => (
          <ProfileMainScreen
            selectedMarker={selectedMarker}
            setSelectedMarker={setSelectedMarker}
          />
        )}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Update"
        children={() => <AddScreen selectedMarker={selectedMarker} />}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
