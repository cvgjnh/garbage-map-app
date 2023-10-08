import { StyleSheet, View, ScrollView } from 'react-native';
import {
  Text,
  Avatar,
  Surface,
  useTheme,
  IconButton,
} from 'react-native-paper';
import React, { useState, useContext } from 'react';
import { CreatedMarkersList } from './CreatedMarkersList';
import { ChangeUsernameDialog } from './ChangeUsernameDialog';
import { GoogleSignIn, GoogleSignOut } from './GoogleSignIn';
import { UserContext } from '../UserContext';

export function ProfileMainScreen(props) {
  const [editingUsername, setEditingUsername] = useState(false);
  const theme = useTheme();
  const { user } = useContext(UserContext);

  if (user) {
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Surface style={{ flex: 1 }}>
          <Surface style={styles.surface}>
            <Avatar.Text
              size={150}
              label={user.username.charAt(0)}
              style={{ alignSelf: 'center', margin: 10 }}
            />
            <View style={styles.row}>
              <Text variant="displaySmall">{user.username}</Text>

              <IconButton
                icon="account-edit"
                onPress={() => setEditingUsername(true)}
                size={32}
              />
            </View>
            <View style={styles.statisticsContainer}>
              <View style={styles.statistic}>
                <Text
                  style={{ color: theme.colors.primary }}
                  variant="headlineLarge"
                >
                  {user.numCreatedMarkers}
                </Text>
                <Text variant="titleMedium">Markers Created</Text>
              </View>
              <View style={styles.statistic}>
                <Text
                  style={{ color: theme.colors.primary }}
                  variant="headlineLarge"
                >
                  {user.numCreatedLogs}
                </Text>
                <Text variant="titleMedium">Logs Created</Text>
              </View>
            </View>
          </Surface>

          <ChangeUsernameDialog
            editingUsername={editingUsername}
            setEditingUsername={setEditingUsername}
          />

          <CreatedMarkersList
            selectedMarker={props.selectedMarker}
            setSelectedMarker={props.setSelectedMarker}
          />

          <GoogleSignOut />
        </Surface>
      </ScrollView>
    );
  }
  return (
    <Surface style={styles.container}>
      <Text variant="titleLarge" style={styles.centerText}>
        Sign in or create an account to add map markers, write logs, and view
        your profile!
      </Text>
      <GoogleSignIn />
    </Surface>
  );
}

const styles = StyleSheet.create({
  surface: {
    padding: 8,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    alignSelf: 'center',
  },
  statisticsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
  },
  statistic: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
  },
  centerText: {
    textAlign: 'center',
  },
});
