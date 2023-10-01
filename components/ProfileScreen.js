import React, { useState, useEffect, useRef } from 'react'
import { Button, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { MapScreen } from './MapScreen'
import { AddScreen } from './AddScreen'
import { ProfileMainScreen } from './ProfileMainScreen'

const Stack = createStackNavigator()

export function ProfileScreen(props) {
    const [selectedMarker, setSelectedMarker] = useState(null)

    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Profile Main"
                children={() => (
                    <ProfileMainScreen
                        user={props.user}
                        setUser={props.setUser}
                        onAuthStateChanged={props.onAuthStateChanged}
                        selectedMarker={selectedMarker}
                        setSelectedMarker={setSelectedMarker}
                        setMarkers={props.setMarkers}
                    />
                )}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Update"
                children={() => (
                    <AddScreen
                        user={props.user}
                        setUser={props.setUser}
                        setMarkers={props.setMarkers}
                        selectedMarker={selectedMarker}
                    />
                )}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    )
}
