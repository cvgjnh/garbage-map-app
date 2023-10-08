/* eslint-disable react/no-children-prop */
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import React, { useState, useEffect, useMemo } from 'react';
import {
  MD3LightTheme,
  MD3DarkTheme,
  PaperProvider,
  Snackbar,
  Portal,
} from 'react-native-paper';
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';
import auth from '@react-native-firebase/auth';
// eslint-disable-next-line import/no-extraneous-dependencies
import NetInfo from '@react-native-community/netinfo';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MapAddScreen } from './components/MapAddScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { MoreScreen } from './components/MoreScreen';
import { UserContext } from './UserContext';

const Tab = createMaterialBottomTabNavigator();

export default function App() {
  // could also use useContext for the global user state but the user state is used in so many places that it would be a pain to change
  const [user, setUser] = useState(null);
  const [disconnectedMessageVisible, setDisconnectedMessageVisible] =
    useState(false);

  const memoizedUserState = useMemo(() => {
    return { user, setUser };
  }, [user, setUser]);

  const colorScheme = useColorScheme();

  const paperTheme =
    colorScheme === 'dark'
      ? {
          ...MD3DarkTheme,
          colors: {
            ...MD3DarkTheme.colors,
            primary: '#96a683',
            onPrimary: '#433124',
            primaryContainer: '#2e3a2f',
            onPrimaryContainer: '#8e7b6e',
            surface: '#2e3a2f',
            secondaryContainer: '#8e7b6e',
            inverseOnSurface: MD3DarkTheme.colors.onSurface,
            inverseSurface: MD3DarkTheme.colors.background,
          },
        }
      : {
          ...MD3LightTheme,
          colors: {
            ...MD3LightTheme.colors,
            primary: '#5e7161',
            onPrimary: '#f6efe7',
            primaryContainer: '#79695d',
            onPrimaryContainer: '#433124',
            surface: '#c0cfb9',
            secondaryContainer: '#ae927c',
            inverseOnSurface: MD3LightTheme.colors.onSurface,
            inverseSurface: MD3LightTheme.colors.background,
          },
        };
  function onAuthStateChanged(_user) {
    if (_user) {
      const { uid } = _user;
      const data = {
        uid,
        email: _user.email,
        username: uid.substring(0, 8),
      };
      const usersRef = firestore().collection('users');
      usersRef
        .doc(uid)
        .get()
        .then((firestoreDocument) => {
          if (!firestoreDocument.exists) {
            usersRef.doc(data.uid).set(data);
            setUser(data);
          } else {
            setUser(firestoreDocument.data());
          }
        })
        .catch((error) => {
          console.log('Error getting document:', error);
        });
    } else {
      setUser(null);
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setDisconnectedMessageVisible(!state.isConnected);
      console.log('Connection type', state.isConnected);
    });
    return unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      firestore()
        .collection('logs')
        .where('userId', '==', user.uid)
        .count()
        .get()
        .then((snapshot) => {
          setUser((prevUser) => ({
            ...prevUser,
            numCreatedLogs: snapshot.data().count,
          }));
        });
      firestore()
        .collection('markers')
        .where('userId', '==', user.uid)
        .count()
        .get()
        .then((snapshot) => {
          setUser((prevUser) => ({
            ...prevUser,
            numCreatedMarkers: snapshot.data().count,
          }));
        });
    }
  }, [user?.uid]);

  return (
    <PaperProvider theme={paperTheme}>
      <UserContext.Provider value={memoizedUserState}>
        <StatusBar
          translucent={false}
          backgroundColor={paperTheme.colors.surface}
        />

        <View style={{ flex: 1 }}>
          <NavigationContainer>
            <Tab.Navigator
              theme={paperTheme}
              screenOptions={({ route }) => ({
                // eslint-disable-next-line react/no-unstable-nested-components
                tabBarIcon: () => {
                  let iconName;
                  const size = 24;

                  if (route.name === 'MapAdd') {
                    iconName = 'map-marker';
                  } else if (route.name === 'Profile') {
                    iconName = 'account';
                  } else if (route.name === 'More') {
                    iconName = 'lightbulb';
                  }
                  return (
                    <Icon
                      name={iconName}
                      size={size}
                      color={paperTheme.colors.primary}
                    />
                  );
                },
              })}
              barStyle={{
                backgroundColor: paperTheme.colors.surface,
              }}
              activeColor={paperTheme.colors.primary}
              inactiveColor={paperTheme.colors.primary}
            >
              <Tab.Screen name="MapAdd" children={() => <MapAddScreen />} />

              <Tab.Screen name="Profile" children={() => <ProfileScreen />} />
              <Tab.Screen name="More" children={() => <MoreScreen />} />
            </Tab.Navigator>
          </NavigationContainer>
          <Portal>
            <Snackbar
              visible={disconnectedMessageVisible}
              duration={60 * 1000 * 10}
              onDismiss={() => {
                setDisconnectedMessageVisible(false);
              }}
              action={{
                label: 'Dismiss',
                textColor: paperTheme.colors.primary,
                onPress: () => {
                  setDisconnectedMessageVisible(false);
                },
              }}
              theme={paperTheme}
            >
              Network disconnected.
            </Snackbar>
          </Portal>
        </View>
      </UserContext.Provider>
    </PaperProvider>
  );
}
