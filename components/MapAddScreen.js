import React, { useState, useEffect, useRef } from 'react'
import { Button, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { MapScreen } from './MapScreen'
import { AddScreen } from './AddScreen'

const Stack = createStackNavigator()

export function MapAddScreen(props) {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Map"
                children={() => (
                    <MapScreen
                        user={props.user}
                        setUser={props.setUser}
                        markers={props.markers}
                        setMarkers={props.setMarkers}
                    />
                )}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Add"
                children={() => (
                    <AddScreen
                        user={props.user}
                        setUser={props.setUser}
                        markers={props.markers}
                        setMarkers={props.setMarkers}
                    />
                )}
                options={{ title: 'Add Marker' }}
            />
        </Stack.Navigator>
    )
}
